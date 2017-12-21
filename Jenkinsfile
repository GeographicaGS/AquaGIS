pipeline {
    parameters {
        string(email: 'build@geographica.gs')
    }
    agent {
      node {
        label 'docker'
      }
    }
    stages {

      stage('Building') {
          steps {
            
            echo "Building aquagis/${env.BRANCH_NAME}"
          }
      }
    }
}
