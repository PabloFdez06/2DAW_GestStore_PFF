<div align="center">
<img src="./GestStore.png" width="100%" alt="Mi Proyecto">
</div>


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

Como primera opción por comodidad, opte por desplegar la aplicación en koyeb con la base de datos en MongoDB Atlas. Tras ver que era extremadamente lento, he optado por migrar a Digital Ocean, donde tengo un App Platform con frontend y backend, en el cual configuro las respectivas variables de entorno para enlazarlo con un cluster que he creado tambien en Digital Ocean, donde se aloja mi base de datos en MongoDB.

Como en ambos dispongo de un periodo o bien de prueba o con las suscripicones estudiantiles, mantengo ambos despliegues:

https://geststore-av5zv.ondigitalocean.app/
https://satisfactory-chandra-geststore-0b06e3cf.koyeb.app/

#### Deploy en local

1. Descargar la carpeta del proyecto.
2. Tener Docker hub abierto (depende del SO), ya que el siguiente comando generara los contenedores.
3. Ejecutar el siguiente comando: docker-compose up --build

El docker-compose esta diseñado de forma que tal como se ejecute ese comando, te generará las imagenes necesarias, contenedores, etc. Y autimaticamente se enlazaran de forma que permitira en local la comunicacion entre backend, frontend y base de datos, sin necesidad de instalar nada ya que tambien te instala las dependencias necesarias durante la ejecucion del mismo, como?

Este tiene conexión con el dockerfile, el cual es el que se encarga de instalar todo lo necesario, y todo esto automatizado con un solo comando.