Tenemos dos Dockers, uno base, y otro con el despliegue de la aplicación.

En el primero se ha tenido en cuenta una conexión con proxy:
ENV http_proxy 'http://193.147.185.18:8080'
ENV https_proxy 'https://193.147.185.18:8080'

Además, se realiza una instalación del manejador de dependencias SBT. Las nuevas versiones se publican en https://dl.bintray.com/sbt/debian/.



En el segundo Docker, de despliegue de la aplicación, se copian los fuentes, y se compilan con dependencias.

Además, se establecen como variables de entorno los datos de conexión a la BD:
(ver Dockrefile_prevision-fase2)

También se pasa el script de ejecucion "entrypoint.sh". La ejecución del programa se hace con el siguiente comando:
$ java -jar /usr/local/app/target/scala-2.12/prevision_fase2-assembly-0.1.jar


Se ha establecido un cron que llama al script, todos los domingos a las 00:00:
0 0 * * 0 env - `cat /root/environmentVariables.txt` /bin/sh /entrypoint.sh >> /var/log/prevision-fase2-cron.log 2>&1




Por tanto, pasos para ejecutar:

1) $ docker build . -f Dockerfile_base -t aquasig_base

2) $ docker build . -f Dockerfile_prevision-fase2 -t aquasig_prevision-fase2

3) $ docker run -dit aquasig_prevision-fase2
