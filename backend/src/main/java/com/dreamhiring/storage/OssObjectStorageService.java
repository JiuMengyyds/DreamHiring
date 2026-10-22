package com.dreamhiring.storage;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.CannedAccessControlList;
import com.aliyun.oss.model.ObjectMetadata;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
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
        if (!privateObject) {
            ossClient.setObjectAcl(
                    properties.getOss().getBucket(),
                    objectKey,
                    CannedAccessControlList.PublicRead
            );
        }
        String url = privateObject
                ? createPrivateAccessUrl(objectKey)
                : createPublicUrl(objectKey);
        LocalDateTime expiresAt = privateObject
                ? LocalDateTime.now(BUSINESS_ZONE).plusSeconds(properties.getOss().getSignedUrlSeconds())
                : null;
        return new StoredObject(
                objectKey,
                url,
                privateObject ? "PRIVATE" : "PUBLIC",
                expiresAt
        );
    }

    @Override
    public void delete(String objectKey) {
        if (objectKey != null && !objectKey.isBlank()) {
            ossClient.deleteObject(properties.getOss().getBucket(), objectKey);
        }
    }

    @Override
    public String createPrivateAccessUrl(String objectKey) {
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

    @Override
    public String createPublicUrl(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return null;
        }
        String baseUrl = properties.getOss().getPublicBaseUrl();
        if (baseUrl == null || baseUrl.isBlank()) {
            String endpoint = properties.getOss().getEndpoint()
                    .replaceFirst("^https?://", "")
                    .replaceFirst("/+$", "");
            baseUrl = "https://" + properties.getOss().getBucket() + "." + endpoint;
        }
        return baseUrl.replaceFirst("/+$", "") + "/" + objectKey;
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
