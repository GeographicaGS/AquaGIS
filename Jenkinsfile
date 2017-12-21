node("docker") {

    currentBuild.result = "SUCCESS"

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

            echo "Building urbo-telefonica/${build_name} (not today)"

        stage "Testing"

            echo "Testing urbo-telefonica/${build_name} (not today)"

    } catch (error) {

        currentBuild.result = "FAILURE"

        echo "Sending failure mail :("
        emailext subject: "${job_name} - Failure in build #${env.BUILD_NUMBER}", to: "${committer_email}, \$DEFAULT_RECIPIENTS", body: "Check console output at ${env.BUILD_URL} to view the results."

        echo "urbo-telefonica/${build_name} failed: ${error}"
        throw error

    } finally {

        stage "Cleaning"

            echo "Cleaning urbo-telefonica/${build_name}"

        if (currentBuild.result == "SUCCESS" && ["master", "dev"].contains(branch_name)) {

            stage "Deploying"

                if (branch_name == "master") {
                    echo "Deploying master ... (not today)"
                    sh "ansible urbo-frontend-production -a '/data/app/UrboCore-www/deploy.sh ${branch_name}'"
                    sh "ansible urbo-production -a 'sh /data/app/urbo/urbocore-api/deploy.sh'"
                    sh "ansible urbo-production -a 'sh /data/app/urbo/urbocore-processing/deploy.sh'"

                } else if (branch_name == "dev") {
                    echo "Deploying dev ..."
                    sh "ansible urbo-frontend-dev -a '/data/app/UrboCore-www/deploy.sh ${branch_name}'"
                    sh "ansible urbo-dev -a 'sh /data/app/urbo/urbocore-api/deploy.sh'"
                    sh "ansible urbo-dev -a 'sh /data/app/urbo/urbocore-processing/deploy.sh'"

                } else {
                    currentBuild.result = "FAILURE"
                    error_message = "Jenkinsfile error, deploying neither master nor dev"

                    echo "${error_message}"
                    error(error_message)
                }
        }
    }
}
