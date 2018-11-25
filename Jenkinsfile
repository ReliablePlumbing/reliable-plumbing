node {
  VERSION = sh(script: 'git log -1 --pretty=%h', returnStdout: true).trim()
  stage('docker Build') {
    echo "docker build"
    sh """
    echo ${VERSION}
    cd ${WORKSPACE}/reliable-plumbing-api/
    docker build -t api-build:${VERSION} .
    docker tag api-build:${VERSION}  api-build:latest
    cd ${WORKSPACE}/
    """
  }
}
