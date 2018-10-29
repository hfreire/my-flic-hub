#!/bin/sh

$(which flicd) -f /var/lib/flic/flicd.db -s 0.0.0.0 &

$(which npm) start
