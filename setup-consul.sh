echo "### CONSUL ###"
curl -X PUT -d ${MYSQL_DATABASE} http://consul:8500/v1/kv/jiragithub/db-init/database

while [ $? -ne 0 ] ; 
do
    sleep 1
    echo "Retrying..."
    curl -X PUT -d ${MYSQL_DATABASE} http://consul:8500/v1/kv/jiragithub/db-init/database
done

echo "mysql "
curl -X PUT -d ${MYSQL_DATABASE} http://consul:8500/v1/kv/jiragithub/db-init/database
curl -X PUT -d 'root' http://consul:8500/v1/kv/jiragithub/db-init/user
curl -X PUT -d ${MYSQL_ROOT_PASSWORD} http://consul:8500/v1/kv/jiragithub/db-init/password
curl -X PUT -d 'true' http://consul:8500/v1/kv/jiragithub/db-init/populate-test-data

