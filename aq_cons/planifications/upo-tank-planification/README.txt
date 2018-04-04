El contenido este fichero comprimido es el siguiente:

/project/        ---> Contiene ficheros asociados al gestor de dependencias SBT, necesario para el contenedor "aquasig_fase2"
/src/            ---> Código fuente del proyecto, necesario para el contenedor "aquasig_fase2"
build.sbt        ---> Fichero de dependencias SBT, necesario para el contenedor "aquasig_fase2"
Dockerfile_base  ---> Dockerfile para construir el contenedor "aquasig_base"
Dockerfile_fase2 ---> Dockerfile para construir el contenedor "aquasig_fase2"
entrypoint.sh    ---> Script que debe ejecutar el CRON del contenedor "aquasig_fase2"
fase2-cron       ---> Fichero CRONTAB que debe configurarse en el contenedor "aquasig_fase2"
sbt-1.1.1.deb    ---> Paquete para instalar el gestor de dependencias SBT en el contenedor "aquasig_base"


Tenemos dos Dockers, uno base, y otro con el despliegue de la aplicación.

En el primero se ha tenido en cuenta una conexión con proxy:
ENV http_proxy 'http://193.147.185.18:8080'
ENV https_proxy 'https://193.147.185.18:8080'

Además, se realiza una instalación del manejador de dependencias SBT. Las nuevas versiones se publican en https://dl.bintray.com/sbt/debian/.



En el segundo Docker, de despliegue de la aplicación, se copian los fuentes, y se compilan con dependencias.

Además, se establecen como variables de entorno los datos de conexión a la BD:
ENV URL 'jdbc:postgresql://52.210.216.50:5432/aquasig_energy'
ENV USERNAME 'aquasig_energy'
ENV PASSWORD 'mesopausa2018'
ENV SCHEMA 'phase2_v1'

También se pasa el script de ejecucion "entrypoint.sh". La ejecución del programa se hace con el siguiente comando:
$ java -jar /usr/local/app/target/scala-2.12/AquaSIG_fase2_v2-assembly-0.1.jar


Se ha establecido un cron que llama al script, todas las horas a los minutos 55:
55 * * * * env - `cat /root/environmentVariables.txt` /bin/sh /entrypoint.sh >> /var/log/fase2-cron.log 2>&1




Por tanto, pasos para ejecutar:

1) $ docker build . -f Dockerfile_base -t aquasig_base

2) $ docker build . -f Dockerfile_fase2 -t aquasig_fase2

3) $ docker run -d --name upo-tank-planification aquasig_fase2

