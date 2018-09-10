# mounting new volume to ec2 linux instance [create an anchor](#mounting-new-volume)

### list the available disks
    lsblk

### Check if the volume has any data
    sudo file -s /dev/xvdf
If the above command output shows “/dev/xvdf: data”, it means your volume is empty (no need for next step).

### Format the volume to ext4 filesystem using the following command.
    sudo mkfs -t ext4 /dev/xvdf

### Create a directory to mount our new ext4 volume
    sudo mkdir /backendData

### Mount the volume to “newvolume” directory
    sudo mount /dev/xvdf /backendData/

### display the disk storage by cd into the folder
    df -h .


# detach volume from instance [create an anchor](#detach-volume)

### unmount the volume
sudo umount -d /dev/<volume-name>
ex: sudo umount -d /dev/xvdf

### detach the volume using aws console
