pipeline {
  environment {
    CRED = credentials("aquagis_www")
  }
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
          anyOf {
              branch 'master';
              branch 'staging';
          }
      }
      steps {
        script {
          if (env.BRANCH_NAME == 'master') {
            DEPLOY_TO = "prod"
          } else if (env.BRANCH_NAME == 'staging') {
            DEPLOY_TO = "staging"
          }
        }

        sh "docker build --build-arg ENV=${DEPLOY_TO} --build-arg VERSION=a680488 -f deploy/www/Dockerfile -t geographica/aquagis_www:${DEPLOY_TO} ."
        sh "docker run --rm --name aquagis_www_${DEPLOY_TO} -e \"S3_WEBSITE_ID=${CRED_USR}\" -e \"S3_WEBSITE_SECRET=${CRED_PSW}\" geographica/aquagis_www:${DEPLOY_TO} npm run-script deploy"
      }
      post {
       failure {
         echo "Pipeline is done"
         // notify users when the Pipeline fails
         mail to: 'build@geographica.gs',
         subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
         body: "Something is wrong with ${env.BUILD_URL}"
       }
     }
    }
  }
}
