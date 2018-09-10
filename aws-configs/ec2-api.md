# this shows how to set up the api on fresh amazone linux fresh ec2 instance

### step 1: install docker/compose 
sudo yum update
sudo yum install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user

get compose version
sudo curl -L https://github.com/docker/compose/releases/download/1.21.0/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

### step 2: get API source code
    pull code or use filezilla to upload to a directory.

### step 3: pull mongodb image
    docker pull mongo

### step 4: build API image
    docker build -t ahmedgomaa/api:<tag> .
    ex: docker build -t ahmedgomaa/api:1.0.0 .

### step 5: mount db volume to the instance
    for configuring new EBS volume, follow: [a relative link](configure-new-EBS-volume.md#mounting-new-volume)
    sudo mount /dev/<driver-name> /<folder-name>/
    get driver name using: lsblk
    ex: sudo mount /dev/xvdf /backendData/

### step 6: docker-compose config
    make sure the volume for mongo data matches the folder in the mounted volume
    ex: /backendData/db:/data/db
    make sure the volume for API matches the folder in the mounted volume
    ex: /backendData/files:/dist/files

### step 7: run the docker-compose
    navigate to docker-compose dir, then run
    docker-compose up -d

### step 8: check status 
    docker ps


# to detach EBS volume, follow the steps [a relative link](configure-new-EBS-volume.md#detach-volume)




