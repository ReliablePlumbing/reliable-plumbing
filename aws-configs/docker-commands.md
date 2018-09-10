# docker most used commands

### list all running containers
docker ps 
use flag: --all to display all containers

### run docker compose
docker-compose up 
use flag: -d to run it in detached mode

### stop running container
docker stop <id>

### access a container from insied using bash
docker exec -it <container-id> bash

### stop all running containers
docker stop $(docker ps -a -q)

### remove all containers
docker rm $(docker ps -a -q)

### listing volumes
docker volume ls

### remove all volumes
docker volume rm $(docker volume ls)
