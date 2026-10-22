package com.dreamhiring.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@ConditionalOnProperty(prefix = "app.storage", name = "mode", havingValue = "stub")
public class StubObjectStorageService implements ObjectStorageService {

    @Override
    public StoredObject upload(String scope, Long ownerId, String originalName, String contentType, byte[] content) {
        String objectKey = scope.toLowerCase() + "/" + ownerId + "/"
                + UUID.randomUUID() + "-" + originalName;
        boolean privateObject = "RESUME_ATTACHMENT".equals(scope);
        return new StoredObject(
                objectKey,
                "/stub-files/" + objectKey,
                privateObject ? "PRIVATE" : "PUBLIC",
                privateObject ? LocalDateTime.now().plusMinutes(15) : null
        );
    }

    @Override
    public void delete(String objectKey) {
        // 测试存储不保留真实文件，无需清理。
    }

    @Override
    public String createPrivateAccessUrl(String objectKey) {
        return createPublicUrl(objectKey);
    }

    @Override
    public String createPublicUrl(String objectKey) {
        return objectKey == null || objectKey.isBlank() ? null : "/stub-files/" + objectKey;
    }
}
