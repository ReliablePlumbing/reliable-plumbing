## install new cron job to backup db everyday at specific hour

#### step 1: create shell file
sudo vi backup_db.sh

#### step 2: add this content to the shell file
`
    #!/bin/sh

    echo "Start Backing up relaibleDb"

    docker exec $(docker container ls -f label="base_image=mongo" -q) sh -c 'exec  mongodump -d <db-name> --out /backups/`date +%d%m%Y`'

    echo "Finished backing reliableDb"
    echo "Date: $(date)"
`

#### step 4: add cron job
 open crontab in vim: sudo crontab -e
 add the following
 `
    MAILTO=email
    0 10 * * * /path/to/backup_db.sh
 `
 the first three args: min h sss

 ### break down for the docker exec command
`docker exec $(docker container ls -f label="base_image=mongo" -q)`
to get the mongo docker container labeled as base_image=mongo, -q flag for quite 

`exec  mongodump -d reliableDb --out /backups/`date +%d%m%Y``
to dump the db in a folder with today's date

