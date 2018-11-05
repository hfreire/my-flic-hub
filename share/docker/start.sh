#!/bin/sh

flicd -f /var/lib/flic/flicd.db -s 0.0.0.0 &

node src/app.js
