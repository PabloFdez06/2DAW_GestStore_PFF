# GestStore - Proyecto Individual 2DAW

Este es mi proyecto individual de segundo curso del ciclo formativo de Desarrollo de Aplicaciones Web. GestStore es una aplicación de gestión de tareas complementada de inventario que he desarrollado como parte de mi formación, abarcando tanto el desarrollo backend como frontend y deployment entre otros.

## Backend

He desarrollado el servidor utilizando Spring Boot con Java. La API REST gestiona todas las operaciones de la tienda incluyendo productos, categorías, usuarios y autenticación. He implementado el modelo de datos con JPA/Hibernate y una arquitectura basada en controladores y servicios siguiendo buenas prácticas de desarrollo.

## Frontend (Apartado Diseño)

Para el apartado de diseño he creado la interfaz de usuario con Angular, aplicando una arquitectura de componentes siguiendo la metodología Atomic Design. He estructurado los estilos con SCSS utilizando la metodología ITCSS y he desarrollado una guía de estilos completa que documenta todos los componentes visuales del proyecto. Más adelante desarrollaremos la web completa.

## Cliente (Apartado Cliente)

En el apartado de cliente he implementado la lógica funcional de la aplicación Angular. Esto incluye formularios reactivos con validaciones síncronas y asíncronas, gestión del estado, servicios de comunicación con la API, guards de navegación y manejo de eventos entre componentes.

## Deploy

He configurado el despliegue automático en GitHub Pages mediante GitHub Actions. El workflow construye y despliega ambas ramas del proyecto de forma independiente, permitiendo acceder a cada apartado desde su propia URL:

- Apartado Diseño (rama main): https://pablofdez06.github.io/2DAW_GestStore_PFF/
- Apartado Cliente (rama apartado_cliente): https://pablofdez06.github.io/2DAW_GestStore_PFF/cliente/

# IMPORTANTE | EJEMPLO DE USO

Para comprobar funcionalmente el proyecto, ya que aun no he tenido tiempo de desplegarlo en la nube para tener un funcionamento que sincronice y permita uso de front, back y bd, voy a explicar unos simples pasos que permitiran comprobar el funcionamiento del mismo.

1. Descargar la carpeta del proyecto.
2. Tener Docker hub abierto (depende del SO), ya que el siguiente comando generara los contenedores.
3. Ejecutar el siguiente comando: `docker-compose up --build`

El docker-compose esta diseñado de forma que tal como se ejecute ese comando, te generará las imagenes necesarias, contenedores, etc.
Y autimaticamente se enlazaran de forma que permitira en local la comunicacion entre backend, frontend y base de datos, sin necesidad de instalar nada ya que tambien te instala las dependencias necesarias durante la ejecucion del mismo.

Este tiene conexión con el dockerfile, el cual es el que se encarga de instalar todo lo necesario, y todo esto automatizado con un solo comando, importante destacar que esto es mientras que no despliego la aplicación, una vez este desplegada el proceso realmente es casi el mismo, solo que desde el exterior no es necesario hacer nada, solo se accede a traves de un enlace.