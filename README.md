# Auto-generate A RESTful GraphQL API with Postgraphile

Postgraphile automatically detects tables, columns, indexes, relationships, views, etc. - providing a GraphQL server that is highly intelligent about your data - while remaining extensible to your own resolvers and providing ample security options.

This application provides a starting point for creating a GraphQL server backed by Postgraphile. The frontend for a Todo app is already provided, but it will need
to be re-written to use the Apollo client to interact with GraphQL.

# Getting Started

1) [Install NPM](https://www.npmjs.com/get-npm)
2) [Install Ruby](https://rvm.io/rvm/install)
3) [Install Postgres](https://postgresapp.com/)
4) Install dependencies

```bash
npm install
bundle install
```

5) Create the database with the provided todos schema

```bash
bundle exec rake db:create db:migrate
RAILS_ENV=test bundle exec rake db:migrate
```

# Now You're Ready to Follow Along

The lesson on Egghead.io will teach you the rest!