#!/bin/bash

grep -Ea '.*\$@.*LDAP/[^/]+@' /var/log/samba/samba.log | awk '{split($3, a, "@"); split($5, b, ":"); print a[1], b[2]}' > computers.txt
