ARG ENV=dev

from geographica/urbo_core_www:latest

COPY deploy/www/Config.$ENV.js /usr/src/app/src/Config.js
COPY deploy/www/s3_website.$ENV.yml /usr/src/app/s3_website.yml
COPY aq_cons/www /usr/src/app/src/verticals/aq_cons
