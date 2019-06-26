import { IQueryOptions, executeQuery } from "./executeQuery";
import { DBConnection } from "./connection";

/**
 * Create a SQL query function.
 *
 * @export
 * @template ReturnType
 * @template InputType
 * @param {string} query
 * @param {IQueryOptions} [options]
 * @returns
 */
export function sql_query<ReturnType, InputType>(query: string, options?: IQueryOptions<InputType, ReturnType>) {
    options = options || {};
    return async function (parameters?: InputType, connection?: DBConnection): Promise<ReturnType> {
        return executeQuery<ReturnType, InputType>(query, parameters, options, connection);
    }
}