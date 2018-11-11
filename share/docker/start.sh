#!/bin/sh

flicd -f /var/lib/flic/flicd.db -s 0.0.0.0 &

exec su-exec node node src/app.js
