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
