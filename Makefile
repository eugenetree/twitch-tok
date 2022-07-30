include .env

ifeq ($(ENV),DEV)
    compose_file_path := docker/dev/docker-compose.yml
else
    compose_file_path := docker/prod/docker-compose.yml
endif

up: # create and start containers
	docker-compose -f ${compose_file_path} up -d

build: # build containers
	docker-compose -f ${compose_file_path} build 

stop: # stop containers, but not destroy
	docker-compose -f ${compose_file_path} stop

down: # stop and destroy containers
	docker-compose -f ${compose_file_path} down

down-volume: #  WARNING: stop and destroy containers with volumes
	docker-compose -f ${compose_file_path} down -v

ps: # show started containers and their status
	docker-compose -f ${compose_file_path} ps

migrate:
	docker-compose -f ${compose_file_path} exec web npm run migration:run

connect_front:
	docker-compose -f ${compose_file_path} exec web bash

connect_db:
	docker-compose -f ${compose_file_path} exec mysql bash
