package com.geststore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal de la aplicación GestStore Backend
 * Inicia el servidor Spring Boot en el puerto 8080
 */
@SpringBootApplication
public class GestStoreApplication {

    public static void main(String[] args) {
        SpringApplication.run(GestStoreApplication.class, args);
    }

}
