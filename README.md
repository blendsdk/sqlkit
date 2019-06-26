# SQLKit

A Promise based Database Access library for PostgreSQL

## Motivation

This library is created to provide a simple yet powerful data access layer for
performing common database query tasks without the need to incorporate a large
ORM ina project.

## Implementation

SQLKit internally uses the npm `pg` package. By default connections are created
using a connection pool. SQLKit supports multiple connection pools for performing
database queries on multiple databases from the same application.

SQLKit dynamically creates a Promise function for a given SQL query. This function
can then be used in your application for database manipulation.

Additionally SQLKit uses the `yesql` library for handling named query parameters:

```javascript
const query = "SELECT * FROM employee WHERE id = :employee_id";
```

## Installation

For yarn

```
yarn add @blendsdk/sqlkit --save
```

For npm

```
npm install @blendsdk/@sqlkit --save
```

## Usage

### Create a connection

SQLKit internally uses the pooling mechanism of the `pg` library. The `createConnection` function
requires a configuration object to function. SQLKit keeps track of the connection pool if you need
connections to multiple databases. This is done by taking a unique connection name as parameter.

This parameter is optional and if not provided it defaults to `default`

If you have an application that connects to a single database, then you just need to call
`createConnection` once at the startup of your application.

```javascript
// To create a global connection for your application:
createConnection({
    host: "localhost",
    database: "mydatabase",
    user: "postgres",
    password: "postgres"
});
```

### Creating a connection using environment variables.

A recommended way to configure and create a connection is to make use of environment variables
as configuration parameters. In NodeJS this is easily accomplished using the `dotenv` package.

You just need to create a `.env` file and let the library take care of the rest.

```sh
# content of the .env file
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=secret
DB_DATABASE=mydb
#DB_PORT=5432 optional
```

```javascript
import dotenv from "dotenv";

// Load environment variables from .env file.
dotenv.config({ path: ".env" });

// calling without arguments which will try to
// connect using the values set in the .env file.
createConnection();
```

You also can create a connection using static configuration.

```javascript
createConnection({
    host: "localhost",
    database: "mydb",
    user: "myuser",
    password: "secret",
    port: 5432 // optional
});
```

### Create a query

### Create ans INSERT statement

### Create an UPDATE statement

### Create a DELETE statement

### Create a COUNT statement

### Convert values before and after query

## Logging with Winston

## Advanced

### Method signatures

```

```
