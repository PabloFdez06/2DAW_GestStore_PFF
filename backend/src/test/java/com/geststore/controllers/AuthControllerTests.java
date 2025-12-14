package com.geststore.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.geststore.models.dtos.LoginRequestDto;
import com.geststore.models.dtos.LoginResponseDto;
import com.geststore.services.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests para AuthController
 * Verifica endpoints de autenticación: login, refresh, logout
 */
@SpringBootTest
@AutoConfigureMockMvc
public class AuthControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testLoginWithValidCredentials() throws Exception {
        LoginRequestDto loginRequest = LoginRequestDto.builder()
                .email("admin@test.com")
                .password("Admin@1234")
                .build();

        LoginResponseDto loginResponse = LoginResponseDto.builder()
                .token("test-jwt-token")
                .tokenType("Bearer")
                .expiresIn(3600000)
                .build();

        when(authService.login(any(LoginRequestDto.class)))
                .thenReturn(loginResponse);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token").exists())
                .andExpect(jsonPath("$.data.tokenType").value("Bearer"));
    }

    @Test
    public void testLoginWithInvalidEmail() throws Exception {
        LoginRequestDto loginRequest = LoginRequestDto.builder()
                .email("invalid-email")
                .password("Admin@1234")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void testLoginWithEmptyPassword() throws Exception {
        LoginRequestDto loginRequest = LoginRequestDto.builder()
                .email("admin@test.com")
                .password("")
                .build();

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }
}
