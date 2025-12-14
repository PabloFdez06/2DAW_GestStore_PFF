package com.geststore.controllers;

import com.geststore.models.dtos.FileUploadResponseDto;
import com.geststore.services.FileStorageService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests para FileController
 * Verifica carga, descarga y eliminación de archivos
 */
@SpringBootTest
@AutoConfigureMockMvc
public class FileControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FileStorageService fileStorageService;

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUploadImageWithValidFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.jpg",
                "image/jpeg",
                "image data".getBytes()
        );

        when(fileStorageService.storeFile(any(), eq("images")))
                .thenReturn("images/test-image_uuid.jpg");

        mockMvc.perform(multipart("/api/files/upload/image")
                .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.filepath").exists())
                .andExpect(jsonPath("$.data.filename").value("test-image.jpg"));
    }

    @Test
    public void testUploadImageWithoutAuthentication() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-image.jpg",
                "image/jpeg",
                "image data".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload/image")
                .file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUploadDocumentWithValidFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test-document.pdf",
                "application/pdf",
                "pdf data".getBytes()
        );

        when(fileStorageService.storeFile(any(), eq("documents")))
                .thenReturn("documents/test-document_uuid.pdf");

        mockMvc.perform(multipart("/api/files/upload/document")
                .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.filepath").exists());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeleteFileWithAdminRole() throws Exception {
        mockMvc.perform(delete("/api/files/images/test-image_uuid.jpg"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "WORKER")
    public void testDeleteFileWithoutAdminRole() throws Exception {
        mockMvc.perform(delete("/api/files/images/test-image_uuid.jpg"))
                .andExpect(status().isForbidden());
    }
}
