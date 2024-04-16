# API

## Design philosophy

The application uses the Repository Pattern. The main philosophy behind this design pattern is to decouple application logic from the database logic. This decreases the complexity of the application, allows for simpler tests, and makes the maintenance of the code really easy.

## Libraries used

- `hono`: Web server framework
- `kysely`: SQL Query builder
- `ulid`: Helper library that generates spec compliant ULID values
- `zod`: For user and data validation

## Folder structure

- `docker/`: Dockerfile (NOTE: This only applies to development for right now since we don't know which host provider we're going to use yet)
- `src/`: Folder for source code
  - `config.ts`: Configuration object that handles any fields that may vary from environment and sensitive keys/secrets
  - `index.ts`: Entrypoint for app
  - `domains/`: Type definitions for the data that gets passed around the different layers (Repository, Service, Handler)
  - `handlers/`: Handler layer which is responsible for managing HTTP server and, most importantly, handling user requests. This layer is the interface that users interact with
  - `lib/`: Common functions that can be and are used across the app
  - `mysql/`: MySQL implementation for Repository layer
  - `repositories/`: Repository layer which is responsible for defining interfaces that external storage solutions like MySQL must implement to be usable with the app
  - `services/`: Service layer which is responsible for handling all the business logic. Examples: validating user input, working with repository implementation(s), etc.
- `Makefile`: Defines commands that can be used to get local development environment up and running

## Development setup

1. Create a `.env` file in the root directory that has all the fields from `example.env`
2. Depending on if this is the first time setup or not:

   - If it is, run `make compose-up`
   - It it isn't, run `make compose-run`. If you made any changes to `package.json` say you added, updated, or removed a package you have to stop the containers, remove the existing `node_modules` volume with `docker volume rm climb-ai_node_modules`, and then run `make compose-run` again to rebuild the volume

3. Database migration for the MySQL database has to be done manually, however, we do have SQL files (`/mysql/migrations/`) so it's just a matter of attaching to the running container and copy pasting the SQL files to the terminal.
   - Run `docker ps` to locate the running `mysql` container
   - Copy the `CONTAINER ID` for the `mysql` container
   - Run `docker exec -ti CONTAINER_ID mysql -p`. This will then prompt you to enter the password. Use the `DB_PASSWORD` defined in your `.env` file to authenticate
   - Copy and paste the `.sql` files in `/mysql/migrations`
4. To take full advantage of `kysely` we need to introspect the database that we just setup. To do this simply run `pnpm run introspect`. This will run the `kysely-codegen` library and it'll create type definitions for us and output it in `/src/mysql/models.ts`
5. You should now be all setup make changes to the application
