## Dependencies:
Django v3.0.7 \
Docker v19.03.8 \
Python v3.8.3

# Quick start

### Update the file permissions locally:

`$ chmod +x app/entrypoint.prod.sh`

### Build the new image and spin up the two containers:
`docker-compose up -d --build`


### Run the migrations:
`docker-compose exec web python manage.py migrate --noinput`

>  Get the following error? \
>  `django.db.utils.OperationalError: FATAL:  database >"hello_django_dev" does not exist` \
>   Run `docker-compose down -v` to remove the volumes along with the containers. Then, re-build the images, run the containers, and apply the migrations.
