package com.geststore.services;

import com.geststore.exceptions.ValidationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests para FileStorageService
 * Verifica validaciones y almacenamiento de archivos
 */
@SpringBootTest
public class FileStorageServiceTests {

    @Autowired
    private FileStorageService fileStorageService;

    @Test
    public void testStoreImageWithValidFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "image data".getBytes()
        );

        assertDoesNotThrow(() -> {
            String filepath = fileStorageService.storeFile(file, "images");
            assertTrue(filepath.contains("images/"));
            assertTrue(filepath.endsWith(".jpg"));
        });
    }

    @Test
    public void testStoreFileWithInvalidExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "malware.exe",
                "application/x-msdownload",
                "malicious code".getBytes()
        );

        assertThrows(ValidationException.class, () -> {
            fileStorageService.storeFile(file, "uploads");
        });
    }

    @Test
    public void testStoreFileWithEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "empty.jpg",
                "image/jpeg",
                new byte[0]
        );

        assertThrows(ValidationException.class, () -> {
            fileStorageService.storeFile(file, "images");
        });
    }

    @Test
    public void testGetMaxFileSize() {
        long maxSize = fileStorageService.getMaxFileSize();
        assertTrue(maxSize > 0);
    }
}
