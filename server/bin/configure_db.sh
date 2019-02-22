#! /bin/bash

echo "Configuring invoicedb"

# export PGPASSWORD = 'node_password';

dropdb -U danielferrer invoicedb
createdb -U danielferrer invoicedb

psql -U danielferrer invoicedb < ./bin/sql/user.sql

echo "invoicedb was configured"