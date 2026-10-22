package com.dreamhiring.storage;

import java.time.LocalDateTime;

public interface ObjectStorageService {

    StoredObject upload(String scope, Long ownerId, String originalName, String contentType, byte[] content);

    void delete(String objectKey);

    String createPrivateAccessUrl(String objectKey);

    String createPublicUrl(String objectKey);

    record StoredObject(
            String objectKey,
            String url,
            String visibility,
            LocalDateTime urlExpiresAt
    ) {
    }
}
