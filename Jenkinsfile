pipeline {
  agent {
    node {
      label 'docker'
    }
  }
  stages {
    stage('Building') {
      steps {
        script {
          shortCommit = sh(returnStdout: true, script: "git log -n 1 --pretty=format:'%h'").trim()
        }
        echo "Building aquagis/${shortCommit}"
      }
    }
    stage("Deploy") {
      when {
        // skip this stage unless on Master branch
        branch "alberto/testjenkins"
      }
      steps {
       sh "docker build -t geographica/aquagis_www:prod -f deploy/www/Dockerfile"
       sh "docker run --rm --name aquagis_www_deploy geographica/aquagis_www:prod npm run-script deploy"
      }
    }
  }
}
