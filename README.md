# GestStore - Proyecto Individual 2DAW

Este es mi proyecto individual de segundo curso del ciclo formativo de Desarrollo de Aplicaciones Web. GestStore es una aplicación de gestión de tareas complementada de inventario que he desarrollado como parte de mi formación, abarcando tanto el desarrollo backend como frontend y deployment entre otros.

## Backend

He desarrollado el servidor utilizando Spring Boot con Java. La API REST gestiona todas las operaciones de la tienda incluyendo productos, categorías, usuarios y autenticación. He implementado el modelo de datos con JPA/Hibernate y una arquitectura basada en controladores y servicios siguiendo buenas prácticas de desarrollo.

## Frontend (Apartado Diseño) 

Para el apartado de diseño he creado la interfaz de usuario con Angular, aplicando una arquitectura de componentes siguiendo la metodología Atomic Design. He estructurado los estilos con SCSS utilizando la metodología ITCSS y he desarrollado una guía de estilos completa que documenta todos los componentes visuales del proyecto. Más adelante desarrollaremos la web completa.
[Documentación](GestStore/docs/design/DOCUMENTACION.md)

## Cliente (Apartado Cliente)

En el apartado de cliente he implementado la lógica funcional de la aplicación Angular. Esto incluye formularios reactivos con validaciones síncronas y asíncronas, gestión del estado, servicios de comunicación con la API, guards de navegación y manejo de eventos entre componentes. [Documentación](GestStore/docs/cliente/DOCUMENTACION_CLIENTE.md)

## Deploy

Aplicación desplegada en Koyeb actualmente (intentare migrar a otro servicio ya que es muy lento), con base de datos en MongoDB Atlas. 