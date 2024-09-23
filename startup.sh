#!/bin/bash
if [ -z "$DATABSE_MIGRATION" ]
then
    # docker run -it --rm -p 9002:9002 --name nestjs-auth-rbac-starter --env-file=.env manumura/nestjs-auth-rbac-starter
    echo "===== No DATABSE_MIGRATION argument provided ====="
else
    echo "===== DATABSE_MIGRATION=$DATABSE_MIGRATION ====="
    if [ $DATABSE_MIGRATION == "true" ]
    then
        # docker run -it --rm -p 9002:9002 --name nestjs-auth-rbac-starter -e DATABSE_MIGRATION="true" --env-file=.env manumura/nestjs-auth-rbac-starter
        echo "===== Migrating database ====="
        npx prisma migrate deploy
        echo "===== Migration complete ====="
    fi
fi

echo "===== Starting the server ====="
node dist/src/main.js
