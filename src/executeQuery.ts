import { DBConnection, createConnection, IQueryResult, databaseLogger } from "./connection";
import { pg as named } from "yesql";
import { isFunction, isNullOrUndefined } from "util";
import { QueryResult } from "pg";

export interface IDynamicQuery {
    sql: string;
    parameters?: any;
    named?: boolean;
}

export type TDynamicQuery<InputType> = (parameters: InputType) => IDynamicQuery;


/**
 * Interface for defining query options for the
 * `executeQuery` function.
 *
 * @export
 * @interface IQueryOptions
 * @template InputType
 * @template OutputType
 */
export interface IQueryOptions<InputType, OutputType> {
    /**
     * Whether to return a single record
     *
     * @type {boolean}
     * @memberof IQueryOptions
     */
    single?: boolean,
    /**
     * A callback function that can be used to apply changes
     * just before the record is passed to query executor.
     *
     * @memberof IQueryOptions
     */
    inConverter?: (record: InputType) => InputType;
    /**
     * A callback function that can be used to apply changes to a
     * record when the record is returned from a query execution.
     *
     * @memberof IQueryOptions
     */
    outConverter?: (record: OutputType) => OutputType;
}

/**
 * Executes a promise based SQL query.
 *
 * @export
 * @template ReturnType
 * @template InputType
 * @param {string} query
 * @param {*} parameters
 * @param {IQueryOptions} options
 * @param {DBConnection} [connection]
 * @returns {Promise<ReturnType>}
 */
export function executeQuery<ReturnType, InputType>(query: string | TDynamicQuery<InputType>, parameters?: any, options?: IQueryOptions<InputType, ReturnType>, connection?: DBConnection): Promise<ReturnType> {
    return new Promise(async (resolve, reject) => {
        try {
            options = options || {};
            parameters = parameters || {};
            // parse the input parameters
            const queryParameters = options.inConverter ? options.inConverter(parameters) : parameters;
            // execute the query
            if (databaseLogger) {
                databaseLogger.debug({ query, parameters: queryParameters })
            }
            /**
             * Check if we have a function and pass the parameter to that function and
             * expect a SQL statement based on the provided parameters
             */
            let queryRequest: any;

            if (isFunction(query)) {
                const dQuery = query as TDynamicQuery<InputType>,
                    dRequest = dQuery(queryParameters);
                queryRequest = dRequest.named ? named(dRequest.sql)(queryParameters) : { text: dRequest.sql, values: dRequest.parameters }
            } else {
                queryRequest = named(query as string)(queryParameters);
            }
            const result = await (connection || createConnection()).query(queryRequest);

            // create a single record array if single:true
            let records = options.single ? [result.rows[0]] : result.rows;

            // apply the out converter if possible and filter out the undefined/null records
            records = options.outConverter ? records.map((record) => options.outConverter(record)).filter(record => record !== undefined) : records;

            // if single:true return single object or collection of the result objects
            resolve(options.single ? records[0] || null : records);
        } catch (err) {
            reject(err)
        }
    });
}
