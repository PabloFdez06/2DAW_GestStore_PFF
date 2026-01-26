package com.geststore.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Swagger/OpenAPI para documentación automática de la API REST
 * 
 * Documentación disponible en:
 * - Swagger UI: http://localhost:8080/swagger-ui.html
 * - OpenAPI JSON: http://localhost:8080/v3/api-docs
 * - OpenAPI YAML: http://localhost:8080/v3/api-docs.yaml
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("GestStore API")
                        .version("1.0.0")
                        .description("API REST para gestionar tareas y almacén de una empresa.\n\n" +
                                "La API proporciona endpoints para:\n" +
                                "- Autenticación y autorización de usuarios\n" +
                                "- Gestión de tareas con asignación de usuarios\n" +
                                "- Gestión de productos y stock\n" +
                                "- Gestión de relaciones entre tareas y productos\n\n" +
                                "Todos los endpoints requieren autenticación mediante JWT token excepto " +
                                "los de registro y login.")
                        .contact(new Contact()
                                .name("GestStore Team")
                                .email("geststore@example.com"))
                        .license(new License()
                                .name("MIT License")))
                .addServersItem(new Server()
                        .url("http://localhost:8080/api")
                        .description("Servidor de desarrollo"))
                .addServersItem(new Server()
                        .url("https://api.example.com")
                        .description("Servidor de producción"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT token obtenido del endpoint /auth/login o /auth/register")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
