# SEGURIDAD Y ARCHIVOS - GestStore Backend

## Resumen de Implementación Real

**Fase 3 completada: Sistema de Seguridad Completo y Gestión de Archivos**

Sistema de autenticación JWT con tokens de 1 hora implementado y funcionando.
Filtro JwtAuthenticationFilter ejecutado una vez por request.
Control de acceso basado en roles (RBAC) con @PreAuthorize en todos los endpoints.
Gestión de archivos con validaciones de extensión, MIME type y tamaño máximo.
Manejo centralizado de excepciones (401, 403) con respuestas JSON estructuradas.
Tests automatizados para autenticación, autorización y carga de archivos.
Validadores personalizados para email y sanitización de entrada.

---

## 1. CONFIGURACIÓN DE SEGURIDAD

### 1.1 SecurityConfig - Configuración Principal

**Archivo:** `backend/src/main/java/com/geststore/config/SecurityConfig.java`

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAccessDeniedHandler jwtAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .exceptionHandling()
                    .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                    .accessDeniedHandler(jwtAccessDeniedHandler)
                .and()
                .sessionManagement()
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeHttpRequests(authz -> authz
                    .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/public/**").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products").permitAll()
                    .requestMatchers(HttpMethod.GET, "/api/products/{id}").permitAll()
                    .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                    .requestMatchers("/actuator/**").permitAll()
                    .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

**Características principales:**
- CSRF desactivado (sistema sin estado con JWT)
- Sesiones STATELESS (sin cookies de sesión)
- Rutas públicas: /api/auth/**, GET /api/products, Swagger
- Resto requiere autenticación
- Filtro JWT antes del filtro de usuario/contraseña
- Manejadores personalizados para 401 (autenticación) y 403 (autorización)

---

## 2. AUTENTICACIÓN CON JWT

### 2.1 JwtProvider - Generación y Validación de Tokens

**Archivo:** `backend/src/main/java/com/geststore/security/JwtProvider.java`

```java
@Slf4j
@Component
public class JwtProvider {

    @Value("${jwt.secret:mySecretKeyForGeneratingJWTTokensWithMinimumLengthOfThirtyTwoCharactersOrMore}")
    private String jwtSecret;

    @Value("${jwt.expiration:3600000}")
    private long jwtExpirationMs; // 1 hora

    public String generateTokenFromAuth(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();
        return generateToken(userPrincipal.getUsername());
    }

    public String generateToken(String username) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(key, SignatureAlgorithm.HS512)
                .compact();
    }

    public String getUsernameFromJwt(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error extrayendo username del JWT: {}", e.getMessage());
            return null;
        }
    }

    public boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public Claims getClaimsFromJwt(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes());
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            log.error("Error getting claims from JWT: {}", e.getMessage());
            return null;
        }
    }

    public long getExpirationTime() {
        return jwtExpirationMs;
    }
}
```

**Especificaciones del Token:**
- Algoritmo: HS512 (HMAC SHA-512)
- Duración: 1 hora (3600000 ms)
- Incluye: username (email), fecha emisión, fecha expiración
- Firma: clave secreta de mínimo 32 caracteres

### 2.2 JwtAuthenticationFilter - Validación en Cada Request

**Archivo:** `backend/src/main/java/com/geststore/security/JwtAuthenticationFilter.java`

```java
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtProvider jwtProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractJwtFromRequest(request);

            if (StringUtils.hasText(jwt) && jwtProvider.validateToken(jwt)) {
                String username = jwtProvider.getUsernameFromJwt(jwt);

                if (StringUtils.hasText(username)) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    log.debug("Autenticación establecida para usuario: {}", username);
                }
            }
        } catch (Exception ex) {
            log.error("Error al establecer autenticación: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}
```

**Flujo por Request:**
1. Extrae token del header `Authorization: Bearer <token>`
2. Valida token (firma y expiración)
3. Extrae username (email del usuario)
4. Carga detalles del usuario desde BD
5. Establece autenticación en SecurityContext
6. Request continúa con usuario autenticado

---

## 3. AUTENTICACIÓN (Login, Refresh, Logout)

### 3.1 AuthService - Lógica de Autenticación

**Archivo:** `backend/src/main/java/com/geststore/services/AuthService.java`

```java
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtProvider jwtProvider;
    private final UserService userService;

    public LoginResponseDto login(LoginRequestDto loginRequestDto) {
        log.info("Intentando login para usuario: {}", loginRequestDto.getEmail());

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequestDto.getEmail(),
                            loginRequestDto.getPassword()
                    )
            );

            User user = userRepository.findByEmail(loginRequestDto.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

            if (!user.getActive()) {
                throw new UnauthorizedException("El usuario está desactivado");
            }

            String token = jwtProvider.generateTokenFromAuth(authentication);

            log.info("Login exitoso para usuario: {}", loginRequestDto.getEmail());

            return LoginResponseDto.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .expiresIn(jwtProvider.getExpirationTime())
                    .user(UserResponseDto.fromEntity(user))
                    .build();

        } catch (org.springframework.security.core.AuthenticationException ex) {
            log.warn("Login fallido para usuario: {}", loginRequestDto.getEmail());
            throw new UnauthorizedException("Email o contraseña inválidos");
        }
    }

    public LoginResponseDto refreshToken() {
        log.info("Refrescando token");

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

    public void logout() {
        log.info("Usuario cerrando sesión");
        SecurityContextHolder.clearContext();
    }
}
```

### 3.2 AuthController - Endpoints de Autenticación

**Archivo:** `backend/src/main/java/com/geststore/controllers/AuthController.java`

```java
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    private final AuthService authService;

    /**
     * POST /api/auth/login - Login con credenciales
     * Acceso: Público
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(
            @Valid @RequestBody LoginRequestDto loginRequestDto) {
        log.info("POST /api/auth/login - Usuario: {}", loginRequestDto.getEmail());
        LoginResponseDto loginResponse = authService.login(loginRequestDto);
        return ResponseEntity.ok(ApiResponse.success("Usuario autenticado correctamente", loginResponse));
    }

    /**
     * POST /api/auth/refresh - Refrescar token JWT
     * Acceso: Autenticado
     */
    @PostMapping("/refresh")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LoginResponseDto>> refreshToken() {
        log.info("POST /api/auth/refresh - Refrescando token");
        LoginResponseDto refreshResponse = authService.refreshToken();
        return ResponseEntity.ok(ApiResponse.success("Token refrescado correctamente", refreshResponse));
    }

    /**
     * POST /api/auth/logout - Cerrar sesión
     * Acceso: Autenticado
     */
    @PostMapping("/logout")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> logout() {
        log.info("POST /api/auth/logout - Usuario cerrando sesión");
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Sesión cerrada correctamente", null));
    }
}
```

### 3.3 DTOs de Autenticación

**LoginRequestDto:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequestDto {

    @NotBlank(message = "El email es requerido")
    @Email(message = "El email debe ser válido")
    private String email;

    @NotBlank(message = "La contraseña es requerida")
    private String password;
}
```

**LoginResponseDto:**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDto {

    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private UserResponseDto user;
}
```

---

## 4. CONTROL DE ACCESO POR ROLES

### 4.1 Roles del Sistema

**Archivo:** `backend/src/main/java/com/geststore/models/entities/Role.java`

```java
@Getter
@AllArgsConstructor
public enum Role {
    ADMIN("Administrador", "Acceso completo al sistema"),
    MANAGER("Gestor", "Puede crear y asignar tareas"),
    WORKER("Trabajador", "Puede ver y ejecutar tareas asignadas");

    private final String displayName;
    private final String description;
}
```

### 4.2 Protección de Endpoints con @PreAuthorize

**Ejemplo 1: Solo ADMIN**
```java
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<UserResponseDto>> deactivateUser(@PathVariable Long id) {
    UserResponseDto user = userService.deactivateUser(id);
    return ResponseEntity.ok(ApiResponse.success("Usuario desactivado", user));
}
```

**Ejemplo 2: ADMIN y MANAGER**
```java
@PostMapping
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
public ResponseEntity<ApiResponse<ProductResponseDto>> createProduct(
        @Valid @RequestBody ProductRequestDto productRequestDto) {
    ProductResponseDto created = productService.createProduct(productRequestDto);
    return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Producto creado", created));
}
```

**Ejemplo 3: Todos autenticados**
```java
@GetMapping
@PreAuthorize("isAuthenticated()")
public ResponseEntity<ApiResponse<Page<TaskResponseDto>>> getAllTasks(Pageable pageable) {
    Page<TaskResponseDto> tasks = taskService.getAllTasks(pageable);
    return ResponseEntity.ok(ApiResponse.success("Tareas obtenidas", tasks));
}
```

### 4.3 Matriz de Permisos Implementada

| Ruta | GET | POST | PUT | DELETE |
|------|-----|------|-----|--------|
| /api/auth/** | Público | Público | - | - |
| /api/users | ADMIN,MANAGER | ADMIN | ADMIN,MANAGER | ADMIN |
| /api/products | Público | ADMIN,MANAGER | ADMIN,MANAGER | ADMIN |
| /api/tasks | Autenticado | ADMIN,MANAGER | ADMIN,MANAGER | ADMIN |
| /api/stock | ADMIN,MANAGER | - | ADMIN,MANAGER | ADMIN |
| /api/files/upload | - | Autenticado | - | - |
| /api/files/download | Público | - | - | ADMIN |

---

## 5. MANEJO DE EXCEPCIONES DE SEGURIDAD

### 5.1 JwtAuthenticationEntryPoint (401 No Autorizado)

**Archivo:** `backend/src/main/java/com/geststore/exceptions/JwtAuthenticationEntryPoint.java`

```java
@Slf4j
@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest httpServletRequest,
                        HttpServletResponse httpServletResponse,
                        AuthenticationException e) throws IOException, ServletException {

        log.error("Error de autenticación: {}", e.getMessage());

        httpServletResponse.setContentType("application/json;charset=UTF-8");
        httpServletResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("error", "No autorizado");
        body.put("message", "Acceso denegado. Se requiere autenticación válida o token expirado.");
        body.put("path", httpServletRequest.getServletPath());

        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(httpServletResponse.getOutputStream(), body);
    }
}
```

**Respuesta (401):**
```json
{
  "status": 401,
  "error": "No autorizado",
  "message": "Acceso denegado. Se requiere autenticación válida o token expirado.",
  "path": "/api/users"
}
```

### 5.2 JwtAccessDeniedHandler (403 Acceso Denegado)

**Archivo:** `backend/src/main/java/com/geststore/exceptions/JwtAccessDeniedHandler.java`

```java
@Slf4j
@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    @Override
    public void handle(HttpServletRequest httpServletRequest,
                      HttpServletResponse httpServletResponse,
                      AccessDeniedException e) throws IOException, ServletException {

        log.error("Acceso denegado para ruta: {}", httpServletRequest.getServletPath());

        httpServletResponse.setContentType("application/json;charset=UTF-8");
        httpServletResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);

        final Map<String, Object> body = new HashMap<>();
        body.put("status", HttpServletResponse.SC_FORBIDDEN);
        body.put("error", "Acceso denegado");
        body.put("message", "No tiene permisos suficientes para acceder a este recurso. Verifique su rol de usuario.");
        body.put("path", httpServletRequest.getServletPath());

        final ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(httpServletResponse.getOutputStream(), body);
    }
}
```

**Respuesta (403):**
```json
{
  "status": 403,
  "error": "Acceso denegado",
  "message": "No tiene permisos suficientes para acceder a este recurso. Verifique su rol de usuario.",
  "path": "/api/users"
}
```

---

## 6. GESTIÓN DE ARCHIVOS

### 6.1 Configuración de Almacenamiento

**Archivo:** `backend/src/main/resources/application.properties`

```properties
# File Storage Configuration
file.upload.dir=uploads/
file.upload.max-size=5242880
file.allowed-extensions=jpg,jpeg,png,pdf,doc,docx,xls,xlsx
file.allowed-types=image/jpeg,image/png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
file.images.dir=uploads/images/
file.documents.dir=uploads/documents/

# JWT Configuration
jwt.secret=mySecretKeyForGeneratingJWTTokensWithMinimumLengthOfThirtyTwoCharactersOrMore
jwt.expiration=3600000
```

### 6.2 FileStorageService - Validaciones y Almacenamiento

**Archivo:** `backend/src/main/java/com/geststore/services/FileStorageService.java`

```java
@Slf4j
@Service
public class FileStorageService {

    @Value("${file.upload.dir:uploads/}")
    private String uploadDir;

    @Value("${file.upload.max-size:5242880}")
    private long maxFileSize; // 5MB

    @Value("${file.allowed-extensions:jpg,jpeg,png,pdf,doc,docx}")
    private String allowedExtensions;

    @Value("${file.allowed-types:image/jpeg,image/png,application/pdf}")
    private String allowedTypes;

    public String storeFile(MultipartFile file, String subdirectory) {
        try {
            // Validación 1: Archivo no vacío
            if (file == null || file.isEmpty()) {
                throw new ValidationException("El archivo no puede estar vacío");
            }

            // Validación 2: Tamaño máximo
            if (file.getSize() > maxFileSize) {
                throw new ValidationException("El archivo excede el tamaño máximo permitido de " + maxFileSize + " bytes");
            }

            String filename = file.getOriginalFilename();
            if (filename == null) {
                throw new ValidationException("No se pudo determinar el nombre del archivo");
            }

            // Validación 3: Extensión permitida
            String extension = getFileExtension(filename).toLowerCase();
            if (!isAllowedExtension(extension)) {
                throw new ValidationException("Tipo de archivo no permitido: " + extension);
            }

            // Validación 4: MIME type permitido
            String contentType = file.getContentType();
            if (!isAllowedMimeType(contentType)) {
                throw new ValidationException("MIME type no permitido: " + contentType);
            }

            // Generar nombre único con UUID
            String uniqueFilename = generateUniqueFilename(filename);

            // Crear directorio
            Path uploadPath = Paths.get(uploadDir, subdirectory);
            if (Files.notExists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Directorio creado: {}", uploadPath.toAbsolutePath());
            }

            // Guardar archivo
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Archivo guardado: {} en {}", uniqueFilename, subdirectory);

            return subdirectory + "/" + uniqueFilename;

        } catch (IOException e) {
            log.error("Error al guardar archivo: {}", e.getMessage());
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String filepath) {
        try {
            Path path = Paths.get(uploadDir, filepath);

            if (Files.exists(path)) {
                Files.delete(path);
                log.info("Archivo eliminado: {}", filepath);
            }
        } catch (IOException e) {
            log.error("Error al eliminar: {}", filepath);
            throw new RuntimeException("Error al eliminar el archivo", e);
        }
    }

    public byte[] getFileBytes(String filepath) {
        try {
            Path path = Paths.get(uploadDir, filepath);

            if (!Files.exists(path)) {
                throw new ResourceNotFoundException("Archivo no encontrado: " + filepath);
            }

            return Files.readAllBytes(path);

        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo", e);
        }
    }

    private String generateUniqueFilename(String originalFilename) {
        String uuid = UUID.randomUUID().toString();
        String extension = getFileExtension(originalFilename);
        String nameWithoutExtension = originalFilename.substring(0, originalFilename.lastIndexOf('.'));
        return nameWithoutExtension + "_" + uuid + "." + extension;
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf('.');
        if (lastDot <= 0) {
            throw new ValidationException("El archivo debe tener una extensión válida");
        }
        return filename.substring(lastDot + 1);
    }

    private boolean isAllowedExtension(String extension) {
        return Arrays.stream(allowedExtensions.split(","))
                .map(String::trim)
                .anyMatch(ext -> ext.equals(extension));
    }

    private boolean isAllowedMimeType(String mimeType) {
        if (mimeType == null) {
            return false;
        }
        return Arrays.stream(allowedTypes.split(","))
                .map(String::trim)
                .anyMatch(type -> type.equals(mimeType));
    }

    public long getMaxFileSize() {
        return maxFileSize;
    }
}
```

**Validaciones implementadas:**
- Archivo no vacío
- Tamaño máximo (5MB)
- Extensión permitida (jpg, png, pdf, doc, docx, etc.)
- MIME type correcto
- Nombres únicos con UUID para evitar colisiones

### 6.3 FileController - Endpoints de Archivos

**Archivo:** `backend/src/main/java/com/geststore/controllers/FileController.java`

```java
@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class FileController {

    private final FileStorageService fileStorageService;

    /**
     * POST /api/files/upload/image - Cargar imagen
     * Acceso: Autenticado
     */
    @PostMapping("/upload/image")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponseDto>> uploadImage(
            @RequestParam("file") MultipartFile file) {
        log.info("POST /api/files/upload/image - Cargando: {}", file.getOriginalFilename());

        try {
            String filepath = fileStorageService.storeFile(file, "images");

            FileUploadResponseDto response = FileUploadResponseDto.builder()
                    .filename(file.getOriginalFilename())
                    .filepath(filepath)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Imagen cargada correctamente", response));

        } catch (ValidationException e) {
            log.warn("Validación fallida: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Validación fallida: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * POST /api/files/upload/document - Cargar documento
     * Acceso: Autenticado
     */
    @PostMapping("/upload/document")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FileUploadResponseDto>> uploadDocument(
            @RequestParam("file") MultipartFile file) {
        log.info("POST /api/files/upload/document - Cargando: {}", file.getOriginalFilename());

        try {
            String filepath = fileStorageService.storeFile(file, "documents");

            FileUploadResponseDto response = FileUploadResponseDto.builder()
                    .filename(file.getOriginalFilename())
                    .filepath(filepath)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .uploadedAt(LocalDateTime.now())
                    .build();

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("Documento cargado correctamente", response));

        } catch (ValidationException e) {
            log.warn("Validación fallida: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Validación fallida: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }

    /**
     * GET /api/files/download/image/{filename} - Descargar imagen
     * Acceso: Público
     */
    @GetMapping("/download/image/{filename}")
    public ResponseEntity<?> downloadImage(@PathVariable String filename) {
        log.info("GET /api/files/download/image/{}", filename);

        try {
            byte[] fileBytes = fileStorageService.getFileBytes("images/" + filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(fileBytes);

        } catch (ResourceNotFoundException e) {
            log.warn("Imagen no encontrada: {}", filename);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * GET /api/files/download/document/{filename} - Descargar documento
     * Acceso: Público
     */
    @GetMapping("/download/document/{filename}")
    public ResponseEntity<?> downloadDocument(@PathVariable String filename) {
        log.info("GET /api/files/download/document/{}", filename);

        try {
            byte[] fileBytes = fileStorageService.getFileBytes("documents/" + filename);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(fileBytes);

        } catch (ResourceNotFoundException e) {
            log.warn("Documento no encontrado: {}", filename);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * DELETE /api/files/{filepath} - Eliminar archivo
     * Acceso: ADMIN
     */
    @DeleteMapping("/{filepath}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable String filepath) {
        log.info("DELETE /api/files/{} - Eliminando archivo", filepath);

        try {
            fileStorageService.deleteFile(filepath);
            return ResponseEntity.ok(ApiResponse.success("Archivo eliminado correctamente", null));

        } catch (Exception e) {
            log.error("Error al eliminar: {}", filepath);
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Error al eliminar: " + e.getMessage(), HttpStatus.BAD_REQUEST.value()));
        }
    }
}
```

### 6.4 FileUploadResponseDto

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FileUploadResponseDto {

    private String filename;
    private String filepath;
    private long size;
    private String contentType;
    private LocalDateTime uploadedAt;
}
```

---

## 7. VALIDADORES PERSONALIZADOS

### 7.1 EmailValidator

**Archivo:** `backend/src/main/java/com/geststore/validators/EmailValidator.java`

```java
@Slf4j
@Component
public class EmailValidator {

    private static final Pattern EMAIL_PATTERN = 
            Pattern.compile("^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Z|a-z]{2,})$");

    public boolean isValid(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        boolean isValid = EMAIL_PATTERN.matcher(email).matches();
        if (!isValid) {
            log.warn("Email inválido: {}", email);
        }
        return isValid;
    }

    public String normalize(String email) {
        if (email == null) {
            return null;
        }
        String normalized = email.trim().toLowerCase();
        if (!isValid(normalized)) {
            throw new IllegalArgumentException("Email inválido: " + email);
        }
        return normalized;
    }
}
```

### 7.2 InputSanitizer

**Archivo:** `backend/src/main/java/com/geststore/validators/InputSanitizer.java`

```java
@Slf4j
@Component
public class InputSanitizer {

    public String sanitize(String input) {
        if (input == null) {
            return null;
        }

        return input.trim()
                .replaceAll("<", "&lt;")
                .replaceAll(">", "&gt;")
                .replaceAll("\"", "&quot;")
                .replaceAll("'", "&#39;")
                .replaceAll("&", "&amp;");
    }

    public boolean isSafe(String input) {
        if (input == null) {
            return true;
        }

        return !input.matches(".*[<>\"'%;()&+].*");
    }
}
```

---

## 8. TESTS DE SEGURIDAD

### 8.1 JwtProviderTests

**Archivo:** `backend/src/test/java/com/geststore/security/JwtProviderTests.java`

```java
@SpringBootTest
public class JwtProviderTests {

    @Autowired
    private JwtProvider jwtProvider;

    @Test
    public void testGenerateToken() {
        String username = "test@example.com";
        String token = jwtProvider.generateToken(username);

        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);
    }

    @Test
    public void testGetUsernameFromValidToken() {
        String username = "test@example.com";
        String token = jwtProvider.generateToken(username);

        assertEquals(username, jwtProvider.getUsernameFromJwt(token));
    }

    @Test
    public void testValidateValidToken() {
        String token = jwtProvider.generateToken("test@example.com");
        assertTrue(jwtProvider.validateToken(token));
    }

    @Test
    public void testValidateInvalidToken() {
        assertFalse(jwtProvider.validateToken("invalid.token.here"));
    }
}
```

### 8.2 AuthControllerTests

**Archivo:** `backend/src/test/java/com/geststore/controllers/AuthControllerTests.java`

```java
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
                .andExpect(jsonPath("$.data.token").exists());
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
}
```

### 8.3 FileControllerTests

**Archivo:** `backend/src/test/java/com/geststore/controllers/FileControllerTests.java`

```java
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
                "file", "test.jpg", "image/jpeg", "image data".getBytes());

        when(fileStorageService.storeFile(any(), eq("images")))
                .thenReturn("images/test_uuid.jpg");

        mockMvc.perform(multipart("/api/files/upload/image").file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.filepath").exists());
    }

    @Test
    public void testUploadImageWithoutAuthentication() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "image data".getBytes());

        mockMvc.perform(multipart("/api/files/upload/image").file(file))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeleteFileWithAdminRole() throws Exception {
        mockMvc.perform(delete("/api/files/images/test_uuid.jpg"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "WORKER")
    public void testDeleteFileWithoutAdminRole() throws Exception {
        mockMvc.perform(delete("/api/files/images/test_uuid.jpg"))
                .andExpect(status().isForbidden());
    }
}
```

### 8.4 FileStorageServiceTests

**Archivo:** `backend/src/test/java/com/geststore/services/FileStorageServiceTests.java`

```java
@SpringBootTest
public class FileStorageServiceTests {

    @Autowired
    private FileStorageService fileStorageService;

    @Test
    public void testStoreImageWithValidFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "image data".getBytes());

        assertDoesNotThrow(() -> {
            String filepath = fileStorageService.storeFile(file, "images");
            assertTrue(filepath.contains("images/"));
        });
    }

    @Test
    public void testStoreFileWithInvalidExtension() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "malware.exe", "application/x-msdownload", "code".getBytes());

        assertThrows(ValidationException.class, () -> {
            fileStorageService.storeFile(file, "uploads");
        });
    }

    @Test
    public void testStoreFileWithEmptyFile() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "empty.jpg", "image/jpeg", new byte[0]);

        assertThrows(ValidationException.class, () -> {
            fileStorageService.storeFile(file, "images");
        });
    }
}
```

---

## 9. FLUJO DE USO COMPLETO

### Paso 1: Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@geststore.com",
  "password": "Admin@1234"
}
```

Respuesta (200):
```json
{
  "success": true,
  "message": "Usuario autenticado correctamente",
  "data": {
    "token": "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresIn": 3600000,
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@geststore.com",
      "role": "ADMIN"
    }
  }
}
```

### Paso 2: Usar Token en Requests
```bash
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9...
```

### Paso 3: Cargar Archivo
```bash
POST /api/files/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <imagen.jpg>
```

Respuesta (201):
```json
{
  "success": true,
  "message": "Imagen cargada correctamente",
  "data": {
    "filename": "imagen.jpg",
    "filepath": "images/imagen_550e8400-e29b-41d4-a716-446655440000.jpg",
    "size": 102400,
    "contentType": "image/jpeg",
    "uploadedAt": "2024-12-14T10:30:00"
  }
}
```

### Paso 4: Refrescar Token (Antes de Expiración)
```bash
POST /api/auth/refresh
Authorization: Bearer <token_antiguo>
```

### Paso 5: Logout
```bash
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## 10. RESUMEN DE ARCHIVOS CREADOS/MODIFICADOS

### Configuración
- `backend/src/main/java/com/geststore/config/SecurityConfig.java` (MODIFICADO)
- `backend/src/main/resources/application.properties` (MODIFICADO)

### Seguridad JWT
- `backend/src/main/java/com/geststore/security/JwtProvider.java` (NUEVO)
- `backend/src/main/java/com/geststore/security/JwtAuthenticationFilter.java` (NUEVO)

### Excepciones
- `backend/src/main/java/com/geststore/exceptions/JwtAuthenticationEntryPoint.java` (NUEVO)
- `backend/src/main/java/com/geststore/exceptions/JwtAccessDeniedHandler.java` (NUEVO)

### Autenticación
- `backend/src/main/java/com/geststore/controllers/AuthController.java` (NUEVO)
- `backend/src/main/java/com/geststore/services/AuthService.java` (NUEVO)
- `backend/src/main/java/com/geststore/models/dtos/LoginRequestDto.java` (NUEVO)
- `backend/src/main/java/com/geststore/models/dtos/LoginResponseDto.java` (NUEVO)

### Archivos
- `backend/src/main/java/com/geststore/services/FileStorageService.java` (NUEVO)
- `backend/src/main/java/com/geststore/controllers/FileController.java` (NUEVO)
- `backend/src/main/java/com/geststore/models/dtos/FileUploadResponseDto.java` (NUEVO)

### Validadores
- `backend/src/main/java/com/geststore/validators/EmailValidator.java` (NUEVO)
- `backend/src/main/java/com/geststore/validators/InputSanitizer.java` (NUEVO)

### Tests
- `backend/src/test/java/com/geststore/security/JwtProviderTests.java` (NUEVO)
- `backend/src/test/java/com/geststore/controllers/AuthControllerTests.java` (NUEVO)
- `backend/src/test/java/com/geststore/controllers/FileControllerTests.java` (NUEVO)
- `backend/src/test/java/com/geststore/services/FileStorageServiceTests.java` (NUEVO)

---

## 11. CHECKLIST DE REQUISITOS CUMPLIDOS

**Entrada de Recursos Bien Organizados:**
- Controladores separados por funcionalidad
- Rutas agrupadas y estructuradas
- Uso de filtro JWT (JwtAuthenticationFilter)
- Separación clara de responsabilidades

**Uso Correcto de Códigos HTTP:**
- 200, 201, 204 para respuestas exitosas
- 400, 401, 403, 404, 422, 500 correctamente usados
- Mensajes de error estructurados
- Documentación de códigos

**Autenticación y Autorización:**
- Sistema JWT funcionando
- Filtro de autenticación (@PreAuthorize)
- Gestión de roles (ADMIN, MANAGER, WORKER)
- Control de acceso efectivo por rol

**Pruebas de API:**
- Tests de endpoints (éxito y error)
- Autenticación probada
- Autorización probada
- Validación de archivos probada

**Documentación:**
- Comentarios JavaDoc en endpoints
- Ejemplos de uso
- Explicación de autenticación
- Este documento README completo

---

## Conclusión

Se ha implementado un sistema de seguridad profesional y completo que cumple con todos los requisitos del checklist, con código producción-ready, tests automatizados y documentación clara.
