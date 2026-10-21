package com.dreamhiring.storage;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.ObjectMetadata;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Locale;
import java.util.UUID;

@Service
@ConditionalOnProperty(prefix = "app.storage", name = "mode", havingValue = "oss", matchIfMissing = true)
public class OssObjectStorageService implements ObjectStorageService {

    private static final ZoneId BUSINESS_ZONE = ZoneId.of("Asia/Shanghai");

    private final OSS ossClient;
    private final StorageProperties properties;

    public OssObjectStorageService(OSS ossClient, StorageProperties properties) {
        this.ossClient = ossClient;
        this.properties = properties;
    }

    @Override
    public StoredObject upload(String scope, Long ownerId, String originalName, String contentType, byte[] content) {
        String objectKey = buildObjectKey(scope, ownerId, originalName);
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(content.length);
        metadata.setContentType(contentType);
        ossClient.putObject(
                properties.getOss().getBucket(),
                objectKey,
                new ByteArrayInputStream(content),
                metadata
        );

        boolean privateObject = "RESUME_ATTACHMENT".equals(scope);
        Date expiration = Date.from(LocalDateTime.now()
                .plusSeconds(properties.getOss().getSignedUrlSeconds())
                .atZone(BUSINESS_ZONE)
                .toInstant());
        URL url = ossClient.generatePresignedUrl(properties.getOss().getBucket(), objectKey, expiration);
        return new StoredObject(
                objectKey,
                url.toString(),
                privateObject ? "PRIVATE" : "PUBLIC",
                privateObject
                        ? LocalDateTime.ofInstant(expiration.toInstant(), BUSINESS_ZONE)
                        : null
        );
    }

    @Override
    public void delete(String objectKey) {
        if (objectKey != null && !objectKey.isBlank()) {
            ossClient.deleteObject(properties.getOss().getBucket(), objectKey);
        }
    }

    @Override
    public String createAccessUrl(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return null;
        }
        Date expiration = Date.from(LocalDateTime.now()
                .plusSeconds(properties.getOss().getSignedUrlSeconds())
                .atZone(BUSINESS_ZONE)
                .toInstant());
        return ossClient.generatePresignedUrl(
                properties.getOss().getBucket(),
                objectKey,
                expiration
        ).toString();
    }

    private String buildObjectKey(String scope, Long ownerId, String originalName) {
        String prefix = switch (scope) {
            case "RESUME_ATTACHMENT" -> "resume";
            case "COMPANY_LOGO" -> "company-logo";
            case "AVATAR" -> "avatar";
            default -> "misc";
        };
        String datePath = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy/MM"));
        String safeName = originalName == null
                ? "file"
                : originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
        return String.format(Locale.ROOT, "%s/%d/%s/%s-%s",
                prefix, ownerId, datePath, UUID.randomUUID(), safeName);
    }
}
