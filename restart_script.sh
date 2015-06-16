#!/bin/bash

FOUND_PROCESSES="$(pgrep python2.7)"

echo $FOUND_PROCESSES

if [ -z "${FOUND_PROCESSES}" ]; then
	cd "/var/www/heatmap"
	python2.7 "server.py" &
fi

exit
