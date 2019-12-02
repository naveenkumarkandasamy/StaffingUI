pipeline {

    environment {
        registry = "payalmantri10/staffingui"
        registryCredential = 'payalmantri10'
    }
    agent any;
    stages {
        stage('Building image') {
            steps {
                script {

                    docker.build registry + ":latest"
                }
            }
        }
        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerHub', passwordVariable: 'dockerHubPassword', usernameVariable: 'dockerHubUser')]) {
                    sh "docker login -u ${env.dockerHubUser} -p ${env.dockerHubPassword}"
                    sh 'docker push payalmantri10/staffingui:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
                dir('/home/accoliteadmin/Desktop/Staffing/') {
                    sh '/home/accoliteadmin/Desktop/Staffing/deployui.sh'
                }
            }
        }

    }
}