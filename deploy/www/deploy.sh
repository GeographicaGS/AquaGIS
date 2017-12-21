#!/bin/bash
branch=$1

git clone git@github.com:GeographicaGS/UrboCore-www.git
git checkout $branch
git pull origin $branch
git submodule init && git submodule update

if [ "${branch}" == 'master' ]; then
    cp deploy/www/Config.prod.js  UrboCore-www/src/js/Config.js
    cp deploy/www/s3_website.prod.yml UrboCore-www/s3_website.yml
fi

cd UrboCore-www
npm run-script update-vertical -- ../AquaGIS/aq_cons aq_cons

#docker build  -t geographica/aquagis_www_builder .
