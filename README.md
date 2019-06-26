# SQLKit

A Promise based Database Access library for PostgreSQL

## Motivation

This library is created to provide a simple yet powerful data access layer for
performing common database query tasks without the need to incorporate a large
ORM in a project.

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

# Usage

## Create a connection

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

## Creating a connection using environment variables.

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

```typescript
createConnection({
    host: "localhost",
    database: "mydb",
    user: "myuser",
    password: "secret",
    port: 5432 // optional
});
```

## Create an arbitrary SQL statement

SQLKit can wrap any SQL statement as an asynchronous JS function. Here are several examples:

```typescript
import { sql_query } from "@blendsdl/sqlkit";

/**
 * Interface describing a record from
 * the tbl_person table
 *
 * @interface IPerson
 */
interface IPerson {
    person_id?: number;
    first_name?: string;
    last_name?: string;
}

/**
 * [1] Returns an array of IPerson objects
 * [2] `unknown` refers to: No InputType
 */
const getAllPersons = sql_query<IPerson[], unknown>("SELECT * FROM tbl_person");

/**
 * Lets run the query and get the results.
 */
const persons = await getAllPersons();
```

## Query options

You can pass configuration options to SQLKit to configure the function that is created
which runs your SQL query.

```typescript
export interface IQueryOptions<InputType, OutputType> {
    /**
     * Whether to return a single record
     *
     * @type {boolean}
     * @memberof IQueryOptions
     */
    single?: boolean;
    /**
     * A callback function that can be used to apply changes
     * just before the record is passed to query executor.
     *
     * @memberof IQueryOptions
     */
    inConverter?: (record: InputType) => any;
    /**
     * A callback function that can be used to apply changes to a
     * record when the record is returned from a query execution.
     *
     * @memberof IQueryOptions
     */
    outConverter?: (record: OutputType) => any;
}
```

## Create an INSERT statement

SQLKit comes with an INSERT statement function that can insert single records
into a table. In this example we will insert a record into the `tbl_person` table

```typescript
import { sql_insert } from "@blendsdk/sqlkit";

/**
 * [1] The first IPerson type refers to the InputType
 * [2] The second IPerson type refers to the ReturnType
 * [3] The SQL statement that is executed is:
 *      `INSERT INTO tbl_person (first_name, last_name) VALUES ($1, $2) RETURNING *`
 */
const createNewPerson = sql_insert<IPerson, IPerson>("tbl_person");

/**
 * Let's run create a new tbl_person record.
 */
const newPerson = await createNewPerson({
    first_name: "John",
    last_name: "Doe"
});

/**
 * The newPerson.person_id is filled with the next PK id
 */
console.log(newPerson);
```

## Create an UPDATE statement

SQLKit also includes an UPDATE statement that can be used to update one or more records
from a table.

```typescript
/**
 * Interface describing the fields that can
 * be updated
 *
 * @interface IPersonLastName
 */
interface IPersonLastName {
    last_name: string;
}

/**
 * Interface describing the update filter (WHERE clause)
 *
 * @interface IPersonID
 */
interface IPersonID {
    person_id: number;
}

/**
 * Updates a record in the tbl_person table and returns the
 * updated record.
 *
 * [1] We only want to allow the last_name to update!
 * [2] We must provide a person_id to update the record!
 * [3] The SQL statement that is executed is:
 *      `UPDATE tbl_person SET last_name = $1 WHERE person_id = $2`
 */
const updatePersonLastNameByID = sql_update<
    IPerson,
    IPersonLastName,
    IPersonID
>("tbl_person", {
    single: true
});

/**
 * Let's run the query with some parameters.
 */
const result = await updatePersonLastNameByID(
    {
        last_name: "Peters"
    },
    {
        person_id: 1
    }
);
```

## Create a DELETE statement

SQLKit also includes an DELETE statement that can be used to delete one or more records
from a table.

```typescript
/**
 * Interface describing the fields that can
 * are used to filter the tbl_person record
 * to be deleted.
 *
 * @interface IPersonLastName
 */
interface IPersonFirstAndLastName {
    fist_name: string;
    last_name: string;
}

/**
 * [1] We must provide the first_name and the last_name.
 * [2] The query returns the deleted records.
 * [3] The SQL statement that is executed is:
 *      `DELETE FROM tbl_person WHERE first_name = $1 AND last_name = $2`
 */
const deleteByFirstAndLastName = sql_delete<IPerson, IPersonFirstAndLastName>(
    "tbl_person"
);

/**
 * Let's run the query and delete some records.
 */
const deletedRecords = deleteByFirstAndLastName({
    fist_name: "Jane",
    last_name: "Peters"
});
```

## A COUNT of records example.

```typescript
/**
 * Interface describing the return value of
 * `countOpenOrdersByCustomerID`
 *
 * @interface IOpenOrders
 */
interface IOpenOrders {
    num_open_orders: number;
}

/**
 * Interface describing the input value of
 * `countOpenOrdersByCustomerID`
 *
 * @interface IOrderOrdersCustomerID
 */
interface IOrderOrdersCustomerID {
    customer_id: number;
}

/**
 * Counts the open orders by a given customer_id
 */
const countOpenOrdersByCustomerID = sql_query<
    IOpenOrders,
    IOrderOrdersCustomerID
>(`
    SELECT
        COUNT(*) AS num_open_orders
    FROM
        tbl_order
    WHERE
        is_closed = false
        customer_id = :customer_id
`);

const result = await countOpenOrdersByCustomerID({
    customer_id: 30
});
```

## Converting values before and after query

In this example I would like to show use how to serialize and
de-serialize a JSON object into a text field with a database table
using the conversion methods in SQLKit.

```sql
DROP TABLE IF EXISTS tbl_document;
CREATE TABLE tbl_document (
    document_id serial not null primary key,
    content text not null,
    meta_data text
);
```

```typescript
/**
 * Interface describing some meta data
 * for a fancy document.
 *
 * @interface IDocumentMetaData
 */
interface IDocumentMetaData {
    author: string;
    tags: string[];
}

/**
 * Interface describing a fancy document
 *
 * @interface IDocument
 */
interface IDocument {
    document_id?: number;
    content?: string;
    meta_data?: IDocumentMetaData;
}

/**
 * Convert an IDocument record before inserting or
 * updating into the tbl_document table
 * @param record
 */
const documentInConverter = (record: IDocument): IDocument => {
    // create a new object and convert the meta_data property
    // to a JSON string
    return {
        ...record,
        meta_data: JSON.stringify(record.meta_data || {}) as any
    };
};

/**
 * Converts an IDocument record after it has been read
 * from the database.
 * @param record
 */
const documentOutConverter = (record: IDocument): IDocument => {
    // convert the meta_data property from string to a JS object
    return {
        ...record,
        meta_data: JSON.parse((record.meta_data as any) || "{}")
    };
};

/**
 * [1] The IDocument types refer to the InputType and ReturnType
 * [2] The inConverter and the outConverter convert the meta_data
 *      to string when writing to the table and back to JS object
 *      when reading from the table.
 */
const createNewDocument = sql_insert<IDocument, IDocument>("tbl_document", {
    inConverter: documentInConverter,
    outConverter: documentOutConverter
});

/**
 * Let's call the query and create a new document record
 */
const newDocument = createNewDocument({
    content: "This is some content",
    meta_data: {
        author: "Some Person",
        tags: ["tag1", "tag2", "tag3"]
    }
});
```

## Logging with Winston

SQLKit can log the SQL statements using the `winston` logger. In order to do that
you need to have logger configures and ready to go, then assign the logger to SQLKit
using the `registerDatabaseLogger` function:

```typescript
/**
 * Configure a winston Logger
 */
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: process.env.NODE_ENV === "production" ? "error" : "debug"
        })
    ]
});

/**
 * Assign the logger to SQLKit
 */
registerDatabaseLogger(logger);
```
