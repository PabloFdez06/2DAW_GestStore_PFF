## Arquitectura: ¿Por qué has colocado tus variables en la capa Settings y tus estilos en Components? ¿Qué pasaría si importaras Components antes que Settings en el manifiesto?

Las variables van en Settings porque ahí defines la “configuración global” reusable (colores, tipografías, espaciamientos), y los estilos de Components usan esas variables para dar apariencia concreta a cada componente de UI

## Metodología: Explica una ventaja real que te haya aportado usar BEM en este examen frente a usar selectores de etiqueta anidados (ej: div > button).

la metodologia bem en general me aporta mejor organizacion a la hora de la nomenclatura en las etiquetas, de forma que al menos con mis palabras y a mi, me ayuda a entender mejor cual seria la etiqueta padre, cual seria el hijo, y cuando debemos modificar ciertos elementos de un hijo, me ayuda perfectamente a distinguir de que etiqueta padre proviene y que elemento concreto estamos modificando, asi evito muchisimo el anidamiento, el nombrar sin sentido y el entender a que realmente le estoy dando un nombre para editar por ejemplo.
