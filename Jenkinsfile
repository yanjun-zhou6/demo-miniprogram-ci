pipeline {
  agent {
    docker {
      image 'node:15.2.0-alpine3.10'
      args  '--dns 10.72.0.3 --dns 10.22.16.254'
    }
  }

  stages {
    stage('prepare environment') {
      steps {
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
      when {
        branch 'dev'
      }

      steps {
        script {
          sh 'APP_ID=wx26472e7a2fdabe94 PREVIEW_PATH=`pwd` node .deploy/preview.js'
          currentBuild.description = "<img src='${JOB_URL}ws/preview-dev.png' height='200' width='200' />"
        }
      }
    }

    stage('deploy') {
      when {
        branch 'master'
        beforeInput true
      }
      input {
        message 'Please input version and description of this deploy'
        ok 'done'
        parameters {
          string(name: 'VERSION', defaultValue: '', description: 'what\'s the version?')
          string(name: 'DESCRIPTION', defaultValue: '', description: 'what\'s the description?')
        }
      }
      steps {
        sh 'APP_ID=wx26472e7a2fdabe94 VERSION=${params.VERSION} DESCRIPTION=${params.DESCRIPTION} node .deploy/upload.js'
      }
    }
  }
}
