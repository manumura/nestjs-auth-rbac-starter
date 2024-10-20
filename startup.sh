#!/bin/bash
# Read the DATABASE_MIGRATION argument from environment variables
if [ -z "$DATABASE_MIGRATION" ]
then
    # docker run -it --rm -p 9002:9002 --name nestjs-auth-rbac-starter --env-file=.env manumura/nestjs-auth-rbac-starter
    echo "===== No DATABASE_MIGRATION argument provided ====="
else
    echo "===== DATABASE_MIGRATION=$DATABASE_MIGRATION ====="
    if [ $DATABASE_MIGRATION == "true" ]
    then
        # Use it like this:
        # docker run -it --rm -p 9002:9002 --name nestjs-auth-rbac-starter -e DATABASE_MIGRATION="true" --env-file=.env manumura/nestjs-auth-rbac-starter
        echo "===== Migrating database ====="
        npx prisma migrate deploy
        echo "===== Migration complete ====="
    fi
fi

echo "===== Starting the server ====="
node dist/src/main.js
