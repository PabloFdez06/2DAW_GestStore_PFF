package com.geststore.services;

import com.geststore.models.dtos.LoginRequestDto;
import com.geststore.models.dtos.LoginResponseDto;
import com.geststore.models.dtos.UserResponseDto;
import com.geststore.models.entities.User;
import com.geststore.repositories.UserRepository;
import com.geststore.security.JwtProvider;
import com.geststore.exceptions.UnauthorizedException;
import com.geststore.exceptions.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Servicio de autenticación
 * Maneja login, refresh de tokens y logout
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final UserService userService;

    /**
     * Autentica un usuario y genera un token JWT
     * @param loginRequestDto credenciales del usuario
     * @return token JWT y datos del usuario
     */
    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        log.info("Intentando login para usuario: {}", loginRequestDto.getEmail());

        try {
            // Autenticar con credenciales
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.getEmail(),
                            loginRequestDto.getPassword()
                    )
            );

            // Verificar que el usuario existe y está activo
            User user = userRepository.findByEmail(loginRequestDto.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

            if (!user.getActive()) {
                throw new UnauthorizedException("El usuario está desactivado");
            }

            // Generar token JWT
            String token = jwtProvider.generateTokenFromAuth(authentication);

            log.info("Login exitoso para usuario: {}", loginRequestDto.getEmail());

            return LoginResponseDto.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtProvider.getExpirationTime())
                    .user(UserResponseDto.fromEntity(user))
                    .build();

        } catch (org.springframework.security.core.AuthenticationException ex) {
            log.warn("Login fallido para usuario: {} - Razón: {}", loginRequestDto.getEmail(), ex.getMessage());
            throw new UnauthorizedException("Email o contraseña inválidos");
        }
    }

    /**
     * Refresca el token JWT del usuario autenticado
     * @return nuevo token JWT
     */
    public LoginResponseDto refreshToken() {
        log.info("Refrescando token para usuario autenticado");

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String newToken = jwtProvider.generateToken(user.getEmail());

        return LoginResponseDto.builder()
                .token(newToken)
                .tokenType("Bearer")
                .expiresIn(jwtProvider.getExpirationTime())
                .user(UserResponseDto.fromEntity(user))
                .build();
    }

    /**
     * Cierra sesión del usuario
     */
    public void logout() {
        log.info("Usuario cerrando sesión");
        SecurityContextHolder.clearContext();
    }
}
