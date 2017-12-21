node("docker") {

    currentBuild.result = "SUCCESS"

    failure_email = "build@geographica.gs"

    try {

        stage "Building"

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

        stage "Testing"

            echo "Testing aquagis/${build_name} (not today)"


        if (currentBuild.result == "SUCCESS" && ["master"].contains(branch_name)) {

            stage "Deploying"

                if (branch_name == "master") {
                    echo "Deploying master ... (not today)"
                    sh "/data/app/aquagis/deploy_www.sh ${branch_name}"
                    //sh "ansible aquagis-production -a 'sh /data/app/urbo/urbocore-api/deploy.sh'"
                    //sh "ansible aquagis-production -a 'sh /data/app/urbo/urbocore-processing/deploy.sh'"
                }  else {
                  currentBuild.result = "FAILURE"
                  error_message = "Jenkinsfile error, deploying wrong branch"
                  error(error_message)
                }
        }
    }
    catch (error) {

      currentBuild.result = "FAILURE"

      if (["master"].contains(branch_name)) {
        echo "Sending failure mail :("
        emailext subject: "${ job_name } - Failure #${ env.BUILD_NUMBER }", to: "${ committer_email }, ${ failure_email }", body: "Check console output at ${ env.BUILD_URL } to view the results."

        echo "aquagis/${ build_name } failed: ${ error }"
      }
      throw error

    }
}
