# install mongodb on linux
get mongo version
sudo curl -O http://downloads.mongodb.org/linux/mongodb-linux-x86_64-amazon-v3.6-latest.tgz
tar -zxvf mongodb-linux-x86_64-amazon-v3.6-latest.tgz
sudo mv mongodb-linux-x86_64-amazon-v3.6-latest/ mongodb
sudo vi ~/.bashrc
export PATH=/home/ec2-user/mongodb/bin:$PATH
source ~/.bashrc

# backup db
mongodump --out <dir> -d <database>

# restore db
mongorestore <dir> to db