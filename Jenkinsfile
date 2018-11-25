node {
  checkout scm
  stage('docker Build') {
    echo "docker build"
    sh """
    cd ${WORKSPACE}
    ls
    cd ${WORKSPACE}/reliable-plumbing-api/
    export version=\$(git log -1 --pretty=%h)
    echo \$version
    docker build -t api-build:\$version .
    docker tag api-build:\$version  api-build:latest
    cd ${WORKSPACE}/
    """
  }
}
