package com.dreamhiring.storage;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.CannedAccessControlList;
import org.junit.jupiter.api.Test;

import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OssObjectStorageServiceTest {

    private final OSS ossClient = mock(OSS.class);
    private final StorageProperties properties = properties();
    private final OssObjectStorageService storageService =
            new OssObjectStorageService(ossClient, properties);

    @Test
    void publicAssetsShouldUsePublicAclAndStableCdnUrl() {
        ObjectStorageService.StoredObject stored = storageService.upload(
                "COMPANY_LOGO",
                7L,
                "logo.png",
                "image/png",
                "logo".getBytes(StandardCharsets.UTF_8)
        );

        verify(ossClient).setObjectAcl(
                eq("dreamhiring"),
                anyString(),
                eq(CannedAccessControlList.PublicRead)
        );
        assertThat(stored.visibility()).isEqualTo("PUBLIC");
        assertThat(stored.urlExpiresAt()).isNull();
        assertThat(stored.url()).startsWith("https://cdn.example.com/company-logo/7/");
    }

    @Test
    void resumeAttachmentsShouldRemainPrivateAndUseSignedUrl() throws Exception {
        when(ossClient.generatePresignedUrl(
                eq("dreamhiring"),
                anyString(),
                any(Date.class)
        )).thenReturn(new URL("https://oss.example.com/signed-resume"));

        ObjectStorageService.StoredObject stored = storageService.upload(
                "RESUME_ATTACHMENT",
                8L,
                "resume.pdf",
                "application/pdf",
                "%PDF".getBytes(StandardCharsets.UTF_8)
        );

        verify(ossClient, never()).setObjectAcl(
                anyString(),
                anyString(),
                any(CannedAccessControlList.class)
        );
        assertThat(stored.visibility()).isEqualTo("PRIVATE");
        assertThat(stored.url()).isEqualTo("https://oss.example.com/signed-resume");
        assertThat(stored.urlExpiresAt()).isNotNull();
    }

    private StorageProperties properties() {
        StorageProperties properties = new StorageProperties();
        properties.getOss().setEndpoint("https://oss-cn-hangzhou.aliyuncs.com");
        properties.getOss().setBucket("dreamhiring");
        properties.getOss().setPublicBaseUrl("https://cdn.example.com");
        properties.getOss().setSignedUrlSeconds(900);
        return properties;
    }
}
