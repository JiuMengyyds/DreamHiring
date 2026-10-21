package com.dreamhiring.storage;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.storage")
public class StorageProperties {

    private String mode = "oss";
    private Oss oss = new Oss();

    @Data
    public static class Oss {
        private String endpoint;
        private String bucket;
        private String accessKeyId;
        private String accessKeySecret;
        private long signedUrlSeconds = 900;
    }
}
