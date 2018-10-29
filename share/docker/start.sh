#!/bin/sh

$(which flicd) -f /var/lib/flic/flicd.db &

$(which npm) start
