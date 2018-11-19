Tenemos dos Dockers, uno base, y otro con el despliegue de la aplicación.

En el primero se ha tenido en cuenta una conexión con proxy:
ENV http_proxy 'http://193.147.185.18:8080'
ENV https_proxy 'https://193.147.185.18:8080'

Además, se realiza una instalación del manejador de dependencias SBT. Las nuevas versiones se publican en https://dl.bintray.com/sbt/debian/.



En el segundo Docker, de despliegue de la aplicación, se copian los fuentes, y se compilan con dependencias.

Además, se establecen como variables de entorno los datos de conexión a la BD:
ENV URL 'jdbc:postgresql://52.210.216.50:5432/urbo'
ENV USERNAME 'urbo_admin'
ENV PASSWORD 'termopausa2099'
ENV SCHEMA 'aljarafe'

También se pasa el script de ejecucion "entrypoint.sh". La ejecución del programa se hace con el siguiente comando:
$ java -jar /usr/local/app/target/scala-2.12/ahorro-fase3-assembly-0.1.jar


Se ha establecido un cron que llama al script, todas las horas a los minutos 55:
55 * * * * env - `cat /root/environmentVariables.txt` /bin/sh /entrypoint.sh >> /var/log/ahorro-fase3-cron.log 2>&1




Por tanto, pasos para ejecutar:

1) $ docker build . -f Dockerfile_base -t aquasig_base

2) $ docker build . -f Dockerfile_ahorro-fase3 -t aquasig_ahorro-fase3

3) $ docker run -it aquasig_ahorro-fase3 bash

4) Dentro del Docker, levantamos el cron con el siguiente comando

    $ cron

