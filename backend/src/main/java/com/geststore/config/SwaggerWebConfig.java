package com.geststore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuración de recursos estáticos para Swagger UI
 * Asegura que los archivos de Swagger se sirvan correctamente con el context-path /api
 */
@Configuration
public class SwaggerWebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Servir recursos de webjars (jQuery, Bootstrap, etc.)
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");

        // Servir recursos de Swagger UI
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/swagger-ui/");

        // Servir el archivo swagger-ui.html
        registry.addResourceHandler("/swagger-ui.html")
                .addResourceLocations("classpath:/META-INF/resources/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirigir /swagger-ui a /swagger-ui.html
        registry.addViewController("/swagger-ui")
                .setViewName("forward:/swagger-ui.html");
    }
}
