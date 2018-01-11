ARG VERSION=latest
FROM geographica/urbo_core_www:$VERSION
ARG ENV

ADD deploy/www/Config.${ENV}.js /usr/src/app/src/js/Config.js
COPY deploy/www/s3_website.${ENV}.yml /usr/src/app/s3_website.yml
COPY aq_cons/www /usr/src/app/src/verticals/aq_cons
COPY aquagis-theme/www /usr/src/app/src/verticals/aquagis-theme
