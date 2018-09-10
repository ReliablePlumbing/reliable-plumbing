# Installing Nginx on AWS ec2 instance with Ubuntu 16.04

### step 1: install nginx
    sudo apt-get update && sudo apt-get upgrade -y
    sudo apt-get install nginx -y

### step 2: check status and start
    sudo systemctl status nginx    # To check the status of nginx
    sudo systemctl start nginx     # To start nginx

### step 3: Make sure that Nginx will run on system startup
    sudo systemctl enable nginx

### step 4: Remove and add default file to sites-available
    sudo rm /etc/nginx/sites-available/default
    sudo vi /etc/nginx/sites-available/default

### step 5: add required configs


# commands used

### Test the configuration of Nginx
sudo nginx -t

### reload 
sudo /etc/init.d/nginx reload

