pipeline {

    environment {
        registry = "staffingaccolite/staffingui"
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
                    sh 'docker push staffingaccolite/staffingui:latest'
                }
            }
        }

        stage('Deploy') {
            steps {
             
                    sh '/home/accoliteadmin/Desktop/Staffing/deployui.sh'
                
            }
        }

    }
}