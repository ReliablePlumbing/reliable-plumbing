node {
  stage('docker Build') {
    echo "docker build"
    sh """
    echo ${VERSION}
    cd ${WORKSPACE}/reliable-plumbing-api/
    export version=$(git log -1 --pretty=%h)
    docker build -t api-build:$(git log -1 --pretty=%h) .
    docker tag api-build:${VERSION}  api-build:latest
    cd ${WORKSPACE}/
    """
  }
}
