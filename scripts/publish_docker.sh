#!/bin/bash

docker build -t policyer .
docker tag policyer niradler/policyer:latest
docker push niradler/policyer:latest
