import { Pool, PoolConfig, QueryResult } from "pg";
import { Logger } from "winston";

/**
 * Internal Winston Logger Object
 */
let databaseLogger: Logger = null;

/**
 * Interface describing a pool(ed) database connection
 */
export type DBConnection = Pool;

/**
 * Interface describing connections pools
 *
 * @interface IConnectionPools
 */
interface IConnectionPools {
    [name: string]: DBConnection;
}

/**
 * Interface describing a connection config
 *
 * @interface IConnectionConfig
 * @extends {PoolConfig}
 */
export interface IConnectionConfig extends PoolConfig {
}

/**
 * Interface describing a QueryResult
 *
 * @export
 * @interface IQueryResult
 * @extends {QueryResult}
 */
export interface IQueryResult extends QueryResult {

}

/**
 * Index of connection pools
 */
const connectionPools: IConnectionPools = {}

/**
 * Creates and caches a connection pool.
 * `name` is set to `default` if not provided.
 * @param config
 * @param name
 */
const createConnection = (config?: IConnectionConfig, name?: string): DBConnection => {
    name = name || 'default';
    if (connectionPools[name]) {
        return connectionPools[name];
    } else {
        config = config || {
            host: process.env.DB_HOST || "127.0.0.1",
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: parseInt(process.env.DB_PORT as any || "5432")
        }
        if (databaseLogger) {
            databaseLogger.debug(`Creating a new connection pool with ${JSON.stringify(config || null)}`);
        }
        connectionPools[name] = new Pool(config);
        return connectionPools[name];
    }
}

/**
 * Closes a database connection.
 * `name` is set to `default` if not provided.
 * @param name
 */
const closeConnection = async (name?: string): Promise<boolean> => {
    name = name || 'default';
    return new Promise(async (resolve, reject) => {
        if (connectionPools[name]) {
            await connectionPools[name].end();
            delete (connectionPools[name]);
            resolve(true);
        } else {
            reject(false);
        }

    })
}

/**
 * Registers a Winston logger to log database operations
 * @param winstonLogger
 */
export const registerDatabaseLogger = (winstonLogger: Logger) => {
    databaseLogger = winstonLogger;
}

export {
    createConnection,
    closeConnection,
    databaseLogger
}

