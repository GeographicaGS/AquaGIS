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
       sh "./deploy/www/deploy.sh ${branch_name}"
       echo "Heal it"
      }
    }
  }
}
