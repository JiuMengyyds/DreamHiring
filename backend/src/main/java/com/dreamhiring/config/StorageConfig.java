package com.dreamhiring.config;

import com.aliyun.oss.OSS;
import com.aliyun.oss.OSSClientBuilder;
import com.dreamhiring.storage.StorageProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(StorageProperties.class)
public class StorageConfig {

    @Bean(destroyMethod = "shutdown")
    @ConditionalOnProperty(prefix = "app.storage", name = "mode", havingValue = "oss", matchIfMissing = true)
    public OSS ossClient(StorageProperties properties) {
        return new OSSClientBuilder().build(
                properties.getOss().getEndpoint(),
                properties.getOss().getAccessKeyId(),
                properties.getOss().getAccessKeySecret()
        );
    }
}
