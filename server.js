let db_user = 'brettcassette'
let port;

if (process.env.NODE_ENV == 'dev') {
  port = 3000
} else {
  port = 3001
}

const express = require('express');
// const graphqlHTTP = require('express-graphql');
// const { graphql, buildSchema } = require('graphql');
const { postgraphile } = require("postgraphile");

const app = express();

let db_url = `postgres://${db_user}@localhost:5432/graphql_postgres_${process.env.NODE_ENV}`;
console.log(`Starting DB on ${db_url}`)

app.use(postgraphile(
  db_url,
  "public",
  {
    graphqlRoute: '/graphql',
    graphiqlRoute: '/graphiql',
    graphiql: true,
    enableCors: true,
    enableQueryBatching: true
  }));

const listener = app.listen(port, () => {
  console.log(`Server is running at port ${listener.address().port}`)
});