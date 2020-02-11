#!/bin/bash

sudo docker stop ctn_neurone_coordinator
sudo docker rm ctn_neurone_coordinator
sudo docker rmi img_neurone_coordinator


sudo docker build -t img_neurone_coordinator .
sudo docker run  --network=host  -p 4001:4001 --name ctn_neurone_coordinator -d img_neurone_coordinator