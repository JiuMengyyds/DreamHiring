package com.dreamhiring.service;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.impl.AuthServiceImpl;
import com.dreamhiring.storage.ObjectStorageService;
import com.dreamhiring.storage.ObjectStorageService.StoredObject;
import com.dreamhiring.vo.FileView;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.Set;

@Service
public class FileService {

    private static final Set<String> ALLOWED_TYPES = Set.of("application/pdf", "image/png", "image/jpeg", "image/webp");
    private static final Set<String> ALLOWED_SCOPES = Set.of("RESUME_ATTACHMENT", "COMPANY_LOGO", "AVATAR");

    private final ObjectStorageService storageService;

    public FileService(ObjectStorageService storageService) {
        this.storageService = storageService;
    }

    public FileView upload(String scope, MultipartFile file) {
        if (!ALLOWED_SCOPES.contains(scope)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "不支持的上传用途");
        }
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "上传文件不能为空");
        }
        if (file.getSize() > 10 * 1024 * 1024L) {
            throw new BusinessException(ResultCode.PAYLOAD_TOO_LARGE);
        }
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        try {
            byte[] content = file.getBytes();
            String contentType = detectContentType(content);
            if (!ALLOWED_TYPES.contains(contentType)) {
                throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "不支持的文件类型");
            }
            StoredObject stored = storageService.upload(
                    scope,
                    principal.id(),
                    file.getOriginalFilename(),
                    contentType,
                    content
            );
            return new FileView(
                    stored.objectKey(),
                    stored.url(),
                    stored.visibility(),
                    stored.urlExpiresAt(),
                    file.getOriginalFilename(),
                    contentType,
                    file.getSize()
            );
        } catch (IOException exception) {
            throw new BusinessException(ResultCode.INTERNAL_SERVER_ERROR, "文件读取失败");
        }
    }

    public void deleteAfterCommit(String objectKey) {
        if (objectKey == null || objectKey.isBlank()) {
            return;
        }
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    storageService.delete(objectKey);
                }
            });
            return;
        }
        storageService.delete(objectKey);
    }

    public String attachmentUrl(String objectKey) {
        return storageService.createAccessUrl(objectKey);
    }

    private String detectContentType(byte[] content) {
        if (startsWith(content, new byte[]{0x25, 0x50, 0x44, 0x46, 0x2D})) {
            return "application/pdf";
        }
        if (startsWith(content, new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A})) {
            return "image/png";
        }
        if (startsWith(content, new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF})) {
            return "image/jpeg";
        }
        if (content.length >= 12
                && startsWith(content, new byte[]{0x52, 0x49, 0x46, 0x46})
                && Arrays.equals(Arrays.copyOfRange(content, 8, 12), new byte[]{0x57, 0x45, 0x42, 0x50})) {
            return "image/webp";
        }
        return "application/octet-stream";
    }

    private boolean startsWith(byte[] content, byte[] signature) {
        return content.length >= signature.length
                && Arrays.equals(Arrays.copyOf(content, signature.length), signature);
    }
}
