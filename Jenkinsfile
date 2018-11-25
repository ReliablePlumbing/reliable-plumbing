node {
  checkout scm
  stage('docker Build') {
    echo "docker build"
    sh """
    cd ${WORKSPACE}
    ls
    cd ${WORKSPACE}/reliable-plumbing-api/
    export version=\$(git log -1 --pretty=%h)
    echo \$5version
    docker build -t api-build:\$5version .
    docker tag api-build:\$version  api-build:latest
    cd ${WORKSPACE}/
    """
  }
}
