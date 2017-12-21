pipeline {

    agent {
      node {
        label 'docker'
      }
    }
    stages {

      stage('Building') {
          steps {

            echo "Building aquagis/${env}"
          }
      }
    }
}
