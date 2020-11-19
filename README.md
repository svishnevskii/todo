# ToDo App

## Note
This web app is in development. Designs and features are not final and are still undergoing constant implementation, testing, and changes.

## Overview

ToDo is a board, lists, and cards that allow teams to organize in a fun, flexible, and rewarding way.

### We work with any team
Whether it's a job, a side project, or even your next family vacation, ToDo helps you or your team stay organized. \
You can have many teams and assign tasks to the desired team. \


Short Demos of Main Features: https://www.youtube.com/watch?v=xDV9F69ouic

## Launch
#### Dependencies:
Django v3.0.7 \
Docker v19.03.8 \
Python v3.8.3

##### Update the file permissions locally:

`$ chmod +x app/entrypoint.prod.sh`

#### Build the new image and spin up the two containers:
`docker-compose up -d --build`

#### Run the migrations:
`docker-compose exec web python manage.py migrate --noinput`

>  Get the following error? \
>  `django.db.utils.OperationalError: FATAL:  database >"hello_django_dev" does not exist` \
>   Run `docker-compose down -v` to remove the volumes along with the containers. Then, re-build the images, run the containers, and apply the migrations.



## Architecture
ToDo is an application website built with JavaScript and Django. JavaScript was used for asynchronous requests for the backend and rendering objects to the DOM without reloading the page in the front-end. Django is responsible for the backend part where the business logic of the application is tied. \

It should also be noted that the application is isolated in a Docker image. This allows us to easily port it to separate servers without wasting time setting up dependencies.

### Stack:
#### Languages:
* Python
* JavaScript
* HTML
* CSS

#### Technology:
* Django
* Git
* Docker
* Bootstrap
* PostgreSQL

## Bug Reports and Improvements
If you experience any bugs or see anything that can be improved or added, please feel free to [open an issue](https://github.com/svishnevskii/todo/issues) here or simply contact me through any of the methods below. Thanks in advance!
