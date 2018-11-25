node {
  stage('docker Build') {
    echo "docker build"
    sh """
    echo ${VERSION}
    cd ${WORKSPACE}/reliable-plumbing-api/
    export version=\$5(git log -1 --pretty=%h)
    docker build -t api-build:${version} .
    docker tag api-build:${VERSION}  api-build:latest
    cd ${WORKSPACE}/
    """
  }
}
