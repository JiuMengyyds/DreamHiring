package com.dreamhiring.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.config.RetryInterceptorBuilder;
import org.springframework.amqp.core.AcknowledgeMode;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.amqp.SimpleRabbitListenerContainerFactoryConfigurer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import com.dreamhiring.service.DeadLetterService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@ConditionalOnProperty(prefix = "app.messaging", name = "mode", havingValue = "rabbit")
public class RabbitNotificationConfig {

    public static final String EXCHANGE = "dreamhiring.notification.exchange";
    public static final String QUEUE = "dreamhiring.notification.queue";
    public static final String DEAD_LETTER_QUEUE = "dreamhiring.notification.dlq";
    public static final String ROUTING_KEY = "application.status.changed";
    public static final String ANNOUNCEMENT_QUEUE = "dreamhiring.announcement.queue";
    public static final String ANNOUNCEMENT_ROUTING_KEY = "announcement.published";
    public static final String ANNOUNCEMENT_DLQ_ROUTING_KEY = "announcement.published.dlq";

    @Bean
    public DirectExchange notificationExchange() {
        return new DirectExchange(EXCHANGE, true, false);
    }

    @Bean
    public Queue notificationQueue() {
        return QueueBuilder.durable(QUEUE)
                .deadLetterExchange(EXCHANGE)
                .deadLetterRoutingKey(DEAD_LETTER_QUEUE)
                .build();
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DEAD_LETTER_QUEUE).build();
    }

    @Bean
    public Queue announcementQueue() {
        return QueueBuilder.durable(ANNOUNCEMENT_QUEUE)
                .deadLetterExchange(EXCHANGE)
                .deadLetterRoutingKey(ANNOUNCEMENT_DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding notificationBinding() {
        return BindingBuilder.bind(notificationQueue())
                .to(notificationExchange())
                .with(ROUTING_KEY);
    }

    @Bean
    public Binding deadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue())
                .to(notificationExchange())
                .with(DEAD_LETTER_QUEUE);
    }

    @Bean
    public Binding announcementBinding() {
        return BindingBuilder.bind(announcementQueue())
                .to(notificationExchange())
                .with(ANNOUNCEMENT_ROUTING_KEY);
    }

    @Bean
    public Binding announcementDeadLetterBinding() {
        return BindingBuilder.bind(deadLetterQueue())
                .to(notificationExchange())
                .with(ANNOUNCEMENT_DLQ_ROUTING_KEY);
    }

    @Bean
    public MessageConverter rabbitMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            SimpleRabbitListenerContainerFactoryConfigurer configurer,
            ConnectionFactory connectionFactory,
            MessageRecoverer deadLetterMessageRecoverer
    ) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        configurer.configure(factory, connectionFactory);
        factory.setAcknowledgeMode(AcknowledgeMode.MANUAL);
        factory.setPrefetchCount(10);
        factory.setAdviceChain(RetryInterceptorBuilder.stateless()
                .maxAttempts(3)
                .backOffOptions(1_000, 2.0, 5_000)
                .recoverer(deadLetterMessageRecoverer)
                .build());
        return factory;
    }

    @Bean
    public MessageRecoverer deadLetterMessageRecoverer(
            DeadLetterService deadLetterService,
            ObjectMapper objectMapper
    ) {
        return new ArchivingMessageRecoverer(deadLetterService, objectMapper);
    }
}
