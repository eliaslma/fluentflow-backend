Run fast:

- create env
- create tables in db: npx prisma generate
- create container: docker run -d --name mysql_db -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=mysql_db -p 3306:3306 mysql:latest
- migrate dev: npx prisma migrate dev
- run dev: yarn dev

Test endpoints: 

Create Account: 
POST - http://localhost:3001/v1/customers/create/

JSON test
{
"name": "",
"email": "",
"password": ""
}

Auth:

POST - http://localhost:3001/v1/customers/auth/

{
"email": "",
"password": ""
}

View db in browser:
npx prisma studio
