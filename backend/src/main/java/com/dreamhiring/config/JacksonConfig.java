package com.dreamhiring.config;

import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateDeserializer;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.format.DateTimeFormatter;
import java.util.TimeZone;

/**
 * 统一 API 的 Java Time 序列化格式和时区。
 */
@Configuration
public class JacksonConfig {

    public static final String DATE_TIME_PATTERN = "yyyy-MM-dd HH:mm:ss";
    public static final String DATE_PATTERN = "yyyy-MM-dd";
    public static final String TIME_ZONE = "Asia/Shanghai";

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern(DATE_TIME_PATTERN);
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern(DATE_PATTERN);

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer javaTimeFormatCustomizer() {
        return builder -> builder
                .timeZone(TimeZone.getTimeZone(TIME_ZONE))
                .serializers(
                        new LocalDateTimeSerializer(DATE_TIME_FORMATTER),
                        new LocalDateSerializer(DATE_FORMATTER)
                )
                .deserializers(
                        new LocalDateTimeDeserializer(DATE_TIME_FORMATTER),
                        new LocalDateDeserializer(DATE_FORMATTER)
                );
    }
}
