pipeline {
  agent {
    docker {
      image 'node:15.2.0-alpine3.10'
      args  '--dns 10.72.0.3 --dns 10.22.16.254'
    }
  }

  stages {
    stage('checkout source code') {
      steps {
        checkout([
          $class: 'GitSCM',
          branches: [[name: '*/dev']],
          doGenerateSubmoduleConfigurations: false,
          extensions: [],
          submoduleCfg: [],
          userRemoteConfigs: [[
            credentialsId: 'jenkins-addy-for-github-repository',
            url: 'git@github.com:unnKoel/mini-ci-demo.git'
            ]]
          ]
        )
        sh 'yarn install'
      }
    }

    stage('test') {
      steps {
        echo 'test process'
      }
    }

    stage('build') {
      steps {
        echo 'build process'
      }
    }

    stage('preview') {
      steps {
        script {
          sh 'APP_ID=wx26472e7a2fdabe94 PREVIEW_PATH=`pwd` node .deploy/preview.js'
          currentBuild.description = "<img src='${JOB_URL}ws/preview-dev.png' height='200' width='200' />"
        }
      }
    }
  }
}
