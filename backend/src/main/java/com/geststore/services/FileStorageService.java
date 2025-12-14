package com.geststore.services;

import com.geststore.exceptions.ValidationException;
import com.geststore.exceptions.ResourceNotFoundException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;

/**
 * Servicio de almacenamiento de archivos
 * Gestiona la carga, descarga y eliminación de archivos
 * Valida extensiones, MIME types y tamaño máximo
 */
@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload.dir:uploads/}")
    private String uploadDir;

    @Value("${file.upload.max-size:5242880}")
    private long maxFileSize;

    @Value("${file.allowed-extensions:jpg,jpeg,png,pdf,doc,docx}")
    private String allowedExtensions;

    @Value("${file.allowed-types:image/jpeg,image/png,application/pdf}")
    private String allowedTypes;

    /**
     * Almacena un archivo en el directorio especificado
     * Realiza validaciones de tamaño, extensión y MIME type
     *
     * @param file archivo a almacenar
     * @param subdirectory subdirectorio donde almacenar
     * @return ruta relativa del archivo guardado
     */
    public String storeFile(MultipartFile file, String subdirectory) {
        try {
            // Validar que el archivo no esté vacío
            if (file == null || file.isEmpty()) {
                throw new ValidationException("El archivo no puede estar vacío");
            }

            // Validar tamaño
            if (file.getSize() > maxFileSize) {
                throw new ValidationException("El archivo excede el tamaño máximo permitido de " + maxFileSize + " bytes");
            }

            String filename = file.getOriginalFilename();
            if (filename == null) {
                throw new ValidationException("No se pudo determinar el nombre del archivo");
            }

            // Validar extensión
            String extension = getFileExtension(filename).toLowerCase();
            if (!isAllowedExtension(extension)) {
                throw new ValidationException("Tipo de archivo no permitido: " + extension);
            }

            // Validar MIME type
            String contentType = file.getContentType();
            if (!isAllowedMimeType(contentType)) {
                throw new ValidationException("MIME type no permitido: " + contentType);
            }

            // Generar nombre único
            String uniqueFilename = generateUniqueFilename(filename);

            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir, subdirectory);
            if (Files.notExists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Directorio de carga creado: {}", uploadPath.toAbsolutePath());
            }

            // Copiar archivo
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Archivo guardado exitosamente: {} en {}", uniqueFilename, subdirectory);

            // Retornar ruta relativa
            return subdirectory + "/" + uniqueFilename;

        } catch (IOException e) {
            log.error("Error al guardar archivo: {}", e.getMessage());
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina un archivo del almacenamiento
     *
     * @param filepath ruta relativa del archivo a eliminar
     */
    public void deleteFile(String filepath) {
        try {
            Path path = Paths.get(uploadDir, filepath);

            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Archivo eliminado exitosamente: {}", filepath);
            } else {
                log.warn("Intento de eliminar archivo que no existe: {}", filepath);
            }
        } catch (IOException e) {
            log.error("Error al eliminar archivo {}: {}", filepath, e.getMessage());
            throw new RuntimeException("Error al eliminar el archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Obtiene los bytes de un archivo
     *
     * @param filepath ruta relativa del archivo
     * @return contenido del archivo en bytes
     */
    public byte[] getFileBytes(String filepath) {
        try {
            Path path = Paths.get(uploadDir, filepath);

            if (!Files.exists(path)) {
                throw new ResourceNotFoundException("Archivo no encontrado: " + filepath);
            }

            return Files.readAllBytes(path);

        } catch (IOException e) {
            log.error("Error al leer archivo {}: {}", filepath, e.getMessage());
            throw new RuntimeException("Error al leer el archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Verifica si un archivo existe
     *
     * @param filepath ruta relativa del archivo
     * @return true si el archivo existe, false en caso contrario
     */
    public boolean fileExists(String filepath) {
        Path path = Paths.get(uploadDir, filepath);
        return Files.exists(path);
    }

    /**
     * Genera un nombre único para el archivo
     * Añade un UUID al nombre para evitar conflictos
     */
    private String generateUniqueFilename(String originalFilename) {
        String uuid = UUID.randomUUID().toString();
        String extension = getFileExtension(originalFilename);
        String nameWithoutExtension = originalFilename.substring(0, originalFilename.lastIndexOf('.'));

        return nameWithoutExtension + "_" + uuid + "." + extension;
    }

    /**
     * Obtiene la extensión del archivo
     */
    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot <= 0) {
            throw new ValidationException("El archivo debe tener una extensión válida");
        }
        return filename.substring(lastDot + 1);
    }

    /**
     * Verifica si la extensión es permitida
     */
    private boolean isAllowedExtension(String extension) {
        return Arrays.stream(allowedExtensions.split(","))
                .map(String::trim)
                .anyMatch(ext -> ext.equals(extension));
    }

    /**
     * Verifica si el MIME type es permitido
     */
    private boolean isAllowedMimeType(String mimeType) {
        if (mimeType == null) {
            return false;
        }
        return Arrays.stream(allowedTypes.split(","))
                .map(String::trim)
                .anyMatch(type -> type.equals(mimeType));
    }

    /**
     * Obtiene el tamaño máximo de archivo permitido
     */
    public long getMaxFileSize() {
        return maxFileSize;
    }
}
