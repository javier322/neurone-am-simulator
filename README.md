# Generador de datos NEURONE

Este simulador se construye como una  herramienta para probar el módulo NEURONE-AM perteneciente a la solución [NEURONE](https://github.com/NEURONE-IL/neurone). Dicho módulo se encuentra compuesto por tres componentes [neurone-am-connector](https://github.com/NEURONE-IL/neurone-am-connector.git),  [neurone-am-coordinator](https://github.com/NEURONE-IL/neurone-am-coordinator.git) y [neurone-am-visualization](https://github.com/NEURONE-IL/neurone-am-visualization.git). Específicamente, La herramienta permite generar dato aleatorios que puedan ser procesados y leídos por el módulo.

## Funcionamiento
La principal funcionalidad de la herramienta consiste en generar datos de forma aleatoria imitando el formato y estructura de aquellos datos capturados por NEURONE, en el contexto de una base de datos orientada a documentos. Este proceso se hace de forma repetida en un intervalo de tiempo definido para un número de N participantes o usuarios, donde N es configurable.


Específicamente, la herramienta cubre las siguientes colecciones de NEURONE:

* UserData: Datos de cada participante. Para este caso se considera solo el campo username, el cual es único y se encuentra compuesto por la combinación de 'participant' + n, con n siendo un valor entre 0 y N-1.
* VisitedLinks= Datos que representan los documentos visitados por cada participante. Para el caso de esta herramienta se generan los datos considerando un universo de 12 posibles documentos virtuales. Cada dato en esta colección contiene los siguientes campos:

   * username: Identificador del participante.
   * localTimestamp: Timestamp de acceso o salida de un documento.
   * state: Indica si se refiere al acceso o salida de un documento.
   * url: Identificador del documento. Para este caso la diferenciación se hace a través de un string compuesto por 'd'+x, donde x puede tener un valor entre 1 o 12.


* Bookmarks: Datos que representan la acción llevada a cabo por un participante para marcar o desmarcar un documento como relevante. Los campos que contienen son los siguientes:

   * username: Identificador del participante.
   * localTimestamp: Timestamp del momento en que se realiza la acción.
   * action: Tipo de acción (bookmark o unbookmark).
   * docId: Identificador del documento sobre el que se realiza la acción. Es similar al campo url.
   * url: Identificador documento.


* Queries: Datos que representan las consultas efectuadas por los participantes. PAra este caso se considera un número de consultas ya predefinidas compuestas por diferentes palabras. Los campos que contiene son los siguientes:
   * username: Identificador del participante.
   * query: Consulta realizada.
   * localTimestamp: Timestamp en que se lleva a cabo la consulta.

* Keystrokes: Información de las teclas seleccionadas por el usuario para formular la consulta. Para este caso corresponde al conjunto de caracteres que conforman alguna de las posibles consultas, las cuales se selecciona de forma aleatoria. Los campos que incluye  son los siguientes:

   * username: Identificador participante.
   * keyCode: Número que representa el código del carácter en teclado.
   * localTimestamp:  Timestamp en el que se presiona la tecla.
    
 

## Instrucciones

En primer lugar, como requisito mínimo para la correcta generación de datos, la herramienta debe conectarse a una instancia de base de datos Mongo. Los parámetros de dicha base de datos pueden ser configurados a través de variables entorno.

Para iniciar la herramienta se debe seguir los siguientes pasos:

 1. Instalar npm (versiónes >=6).
 2. Clonar repositorio.
 3. Configurar variables de entorno en un archivo .env. (Ver sección de configuración)
 4. Ejecutar el comando ``` npm install``` la primera vez que se inicia la herramienta.
 5. Para iniciar la herramient ejecutar el comando ``` npm run dev```. En este punto es importante destacar que el programa realiza las siguientes tareas:
    * Se conecta a la base de datos con variables definidas.
    * Limpia todas las colecciones de la base de datos  (en caso de que esta no se encuentre vacía).
    * Se generan N participantes en la colección userData, donde N se define en las variables de entorno.

## Servicios

Luego de iniciar la herramienta existen dos servicios REST que pueden ser utilizados para llevar a cabo el proceso. Los servicios se exponen en el puerto 4002 por defecto, pero dicho puerto puede ser modificado con las variables:

* Get-> URL_BASE/init: Al llamar este servicio inicia el proceso de generación de datos. Este se lleva a cabo para los N participantes definidos previamente. El proceso se ejecuta periódicamente hasta que se detenga el programa (CTRL+c) o se invoque el servicio /stop.

* Get-> URL_BASE/stop: Al invocar este servicio se detiene la generación aleatoria de datos. En caso de que se desee repetir el proceso, se debe detener el programa, volver ejecutar ```npm run dev``` y usar el servicio /init.

## Configuración

Existen ciertos parámetros que pueden ser definidos como variables a través de un archivo .env. A continuación se definen cada un de los campos:

* PORT: Puerto en que se pueden consumir los servicios. 4002 por defecto.
* DB_NAME: Nombre de la base de datos, test por defecto.
* DB_USERNAME: Nombre de usuario, test por defecto.
* DB_PASSWORD: Password de la base de datos, test por defecto.
* PARTICIPANT_NUMBER: Cantidad de participantes. 20 por defecto.



```bash
PROT=4002
DB_NAME=test
DB_USERNAME=test
DB_PASSWORD=test
PARTICIPANTS_NUMBER=20
```



