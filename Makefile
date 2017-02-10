all:
	hugo server -t course -w -p 5555

deploy:
	hugo -t course -b "https://uoit-cs.github.io/database-talk-2017/"


