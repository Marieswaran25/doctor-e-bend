# Project Structure

## `index.ts`

- Entry point of the application.
- Starts the server after successfully establishing a database connection.

## `controllers/`

- Contains all business logic.
- Handles incoming HTTP requests and calls the appropriate services.

## `services/`

- Contains all database APIs and external service integrations.
- Handles interactions with the database and third-party APIs.

## `helpers/`

- Contains utility functions.
- Commonly used functions like error handling, data formatting, and validation.

## `middlewares/`

- Contains all custom Express middlewares.
- Examples: authentication, logging, request validation.

## `components/`

- Reusable server and database instances.
- Centralized setup for common instances like database connections and configurations.

## `entities/`

- Database models, useful if using ORM like Prisma or Sequelize.

## `routes/`

- Route definitions for better separation.

## `migrations/`

- Contains all generated db migration files.

# Good to Know

## setup local db / cloud testing db for development

- Used XAMPP MySQL setup for local development.
- Try Migration run Command to create tables in your defined local database.
- To test using cloud test database, run the `npm run dev` which now uses external cloud database in our local express setup.

## To start local express server

> `npm run local` - uses local db
> `npm run dev` - uses cloud db

1. Express server will start running at port `5000`

## To transpile typescript into javascript

> `npm run build`

1. Transpiled Javascript files are located at dist folder in the root.
2. If you want to run the build , try `npm run testing`

### Migration Rules

Migration involves managing changes made to the current version of the database through CLI.

## Migration:Generate

The `npm run migration:generate` command compares the database schema with the entities defined in the `dataSource`. If any changes are detected in the entities, they are considered for generating a new migration script.

To apply changes to the database in different environments:

1. Set the environment variable `NODE_ENV` to the desired environment in `typeorm` script. (Must)

2. Apply the migration by running the migration script with `--name=initial`.

    > `npm run migration:generate --name=initial` > `It will create migration file in the name of initial in migrations`

3. Verify if the migration file is created in the `migrations` directory.

## Migration:Run

The `npm run migration:run` command applies the changes specified in the generated migration file to the database.

## Migration:Revert

The `npm run migration:revert` command reverts the most recent migration applied to the database.
