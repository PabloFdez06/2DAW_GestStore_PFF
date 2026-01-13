package com.geststore.config;

import com.geststore.models.entities.*;
import com.geststore.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Inicializador de datos para MongoDB
 * Solo se ejecuta en perfiles 'dev' o 'prod'
 */
@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ProductRepository productRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    @Profile({"dev", "prod"})
    CommandLineRunner initDatabase() {
        return args -> {
            // Solo inicializar si la BD está vacía
            if (userRepository.count() == 0) {
                System.out.println("🌱 Iniciando datos de prueba en MongoDB...");

                // Crear usuarios
                User admin = User.builder()
                        .name("Administrador")
                        .email("admin@geststore.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(Role.ADMIN)
                        .phone("600000001")
                        .department("Dirección")
                        .active(true)
                        .build();
                admin.onCreate();

                User trabajador1 = User.builder()
                        .name("Carlos Martínez")
                        .email("carlos@geststore.com")
                        .password(passwordEncoder.encode("carlos123"))
                        .role(Role.WORKER)
                        .phone("600000002")
                        .department("Almacén")
                        .active(true)
                        .build();
                trabajador1.onCreate();

                User trabajador2 = User.builder()
                        .name("Ana García")
                        .email("ana@geststore.com")
                        .password(passwordEncoder.encode("ana123"))
                        .role(Role.WORKER)
                        .phone("600000003")
                        .department("Logística")
                        .active(true)
                        .build();
                trabajador2.onCreate();

                userRepository.saveAll(List.of(admin, trabajador1, trabajador2));
                System.out.println("✅ Usuarios creados");

                // Crear productos
                Product producto1 = Product.builder()
                        .name("Tornillos M8")
                        .sku("TOR-M8-001")
                        .description("Tornillos métricos M8 galvanizados")
                        .unitPrice(new BigDecimal("0.50"))
                        .category("Ferretería")
                        .active(true)
                        .stockQuantity(500)
                        .minStockLevel(100)
                        .locationInWarehouse("Pasillo A, Estantería 3")
                        .build();
                producto1.onCreate();

                Product producto2 = Product.builder()
                        .name("Cinta adhesiva industrial")
                        .sku("CIN-IND-002")
                        .description("Cinta adhesiva de alta resistencia 50mm x 50m")
                        .unitPrice(new BigDecimal("3.50"))
                        .category("Embalaje")
                        .active(true)
                        .stockQuantity(200)
                        .minStockLevel(50)
                        .locationInWarehouse("Pasillo B, Estantería 1")
                        .build();
                producto2.onCreate();

                Product producto3 = Product.builder()
                        .name("Pintura blanca 1L")
                        .sku("PIN-BLA-003")
                        .description("Pintura plástica blanca mate interior")
                        .unitPrice(new BigDecimal("12.90"))
                        .category("Pintura")
                        .active(true)
                        .stockQuantity(75)
                        .minStockLevel(20)
                        .locationInWarehouse("Pasillo C, Estantería 2")
                        .build();
                producto3.onCreate();

                Product producto4 = Product.builder()
                        .name("Guantes de trabajo")
                        .sku("GUA-TRA-004")
                        .description("Guantes de protección talla M")
                        .unitPrice(new BigDecimal("2.30"))
                        .category("EPI")
                        .active(true)
                        .stockQuantity(150)
                        .minStockLevel(30)
                        .locationInWarehouse("Pasillo D, Estantería 1")
                        .build();
                producto4.onCreate();

                Product producto5 = Product.builder()
                        .name("Caja de cartón 40x30x30")
                        .sku("CAJ-CAR-005")
                        .description("Caja de cartón canal simple para envíos")
                        .unitPrice(new BigDecimal("0.80"))
                        .category("Embalaje")
                        .active(true)
                        .stockQuantity(300)
                        .minStockLevel(100)
                        .locationInWarehouse("Pasillo E, Estantería 3")
                        .build();
                producto5.onCreate();

                productRepository.saveAll(List.of(producto1, producto2, producto3, producto4, producto5));
                System.out.println("✅ Productos creados");

                // Crear tareas
                Task tarea1 = Task.builder()
                        .title("Revisar inventario de ferretería")
                        .description("Hacer recuento de todos los productos de la categoría ferretería y actualizar stock")
                        .status(TaskStatus.PENDING)
                        .priority(TaskPriority.HIGH)
                        .dueDate(LocalDateTime.now().plusDays(2))
                        .createdByUser(admin)
                        .assignedUser(trabajador1)
                        .completed(false)
                        .notes("Priorizar tornillería y herrajes")
                        .build();
                tarea1.onCreate();

                Task tarea2 = Task.builder()
                        .title("Preparar pedido urgente cliente ABC")
                        .description("Empaquetar y preparar envío para cliente ABC con 50 cajas y material de embalaje")
                        .status(TaskStatus.IN_PROGRESS)
                        .priority(TaskPriority.HIGH)
                        .dueDate(LocalDateTime.now().plusDays(1))
                        .startDate(LocalDateTime.now().minusHours(2))
                        .createdByUser(admin)
                        .assignedUser(trabajador2)
                        .completed(false)
                        .notes("Cliente VIP - máxima prioridad")
                        .build();
                tarea2.onCreate();

                Task tarea3 = Task.builder()
                        .title("Mantenimiento estantería B")
                        .description("Revisar y reforzar estantería B del almacén principal")
                        .status(TaskStatus.PENDING)
                        .priority(TaskPriority.MEDIUM)
                        .dueDate(LocalDateTime.now().plusDays(5))
                        .createdByUser(admin)
                        .completed(false)
                        .notes("Verificar tornillos y nivelación")
                        .build();
                tarea3.onCreate();

                Task tarea4 = Task.builder()
                        .title("Reorganizar zona de pinturas")
                        .description("Clasificar y ordenar todos los productos de pintura por tipo y color")
                        .status(TaskStatus.COMPLETED)
                        .priority(TaskPriority.LOW)
                        .dueDate(LocalDateTime.now().minusDays(1))
                        .startDate(LocalDateTime.now().minusDays(2))
                        .endDate(LocalDateTime.now().minusHours(3))
                        .createdByUser(admin)
                        .assignedUser(trabajador1)
                        .completed(true)
                        .notes("Tarea finalizada correctamente")
                        .build();
                tarea4.onCreate();

                Task tarea5 = Task.builder()
                        .title("Recepción pedido proveedor XYZ")
                        .description("Recepcionar, verificar y almacenar pedido del proveedor XYZ")
                        .status(TaskStatus.PENDING)
                        .priority(TaskPriority.MEDIUM)
                        .dueDate(LocalDateTime.now().plusDays(3))
                        .createdByUser(admin)
                        .assignedUser(trabajador2)
                        .completed(false)
                        .notes("Llega el miércoles por la mañana")
                        .build();
                tarea5.onCreate();

                Task tarea6 = Task.builder()
                        .title("Inventario semanal EPI")
                        .description("Conteo de equipos de protección individual y actualización de stock")
                        .status(TaskStatus.IN_PROGRESS)
                        .priority(TaskPriority.HIGH)
                        .dueDate(LocalDateTime.now().plusDays(1))
                        .startDate(LocalDateTime.now().minusHours(1))
                        .createdByUser(admin)
                        .assignedUser(trabajador1)
                        .completed(false)
                        .notes("Revisar también fecha de caducidad")
                        .build();
                tarea6.onCreate();

                Task tarea7 = Task.builder()
                        .title("Limpieza general almacén")
                        .description("Limpieza profunda de todas las zonas del almacén")
                        .status(TaskStatus.CANCELLED)
                        .priority(TaskPriority.LOW)
                        .dueDate(LocalDateTime.now().minusDays(1))
                        .createdByUser(admin)
                        .completed(false)
                        .notes("Cancelada - pospuesta para próxima semana")
                        .build();
                tarea7.onCreate();

                taskRepository.saveAll(List.of(tarea1, tarea2, tarea3, tarea4, tarea5, tarea6, tarea7));
                System.out.println("✅ Tareas creadas");

                System.out.println("✅ Base de datos inicializada correctamente con datos de prueba");
                System.out.println("📧 Usuarios creados:");
                System.out.println("   - admin@geststore.com / admin123");
                System.out.println("   - carlos@geststore.com / carlos123");
                System.out.println("   - ana@geststore.com / ana123");
            } else {
                System.out.println("ℹ️  Base de datos ya contiene datos, omitiendo inicialización");
            }
        };
    }
}
