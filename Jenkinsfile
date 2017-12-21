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
            checkout scm
            sh "git rev-parse --short HEAD > .git/git_commit"
            sh "git --no-pager show -s --format='%ae' HEAD > .git/git_committer_email"

            workspace = pwd()
            branch_name = "${env.BRANCH_NAME}".replaceAll("/", "_")
            git_commit = readFile(".git/git_commit").replaceAll("\n", "").replaceAll("\r", "")
            build_name = "${branch_name}--${git_commit}"
            job_name = "${env.JOB_NAME}".replaceAll("%2F", "/")
            committer_email = readFile(".git/git_committer_email").replaceAll("\n", "").replaceAll("\r", "")

            echo "Building aquagis/${build_name} (not today)"
          }
      }
    }
}
