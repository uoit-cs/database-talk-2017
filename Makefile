all:
	hugo server -t course -w -p 5555

deploy:
	hugo -t course

