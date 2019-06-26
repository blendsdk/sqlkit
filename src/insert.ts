import { IQueryOptions, executeQuery } from "./executeQuery";
import { DBConnection } from "./connection";

/**
 * Creates a SQL INSERT statement.
 *
 * @export
 * @template ReturnType
 * @template InputType
 * @param {string} table
 * @param {IQueryOptions} [options]
 * @returns
 */
export function sql_insert<ReturnType, InputType>(table: string, options?: IQueryOptions<InputType, ReturnType>) {
    // force to single object
    options = options || {};
    options.single = true;
    return async function (record: InputType, connection?: DBConnection): Promise<ReturnType> {
        const query = `INSERT INTO ${table} (${Object.keys(record).join(",")}) VALUES (${Object.keys(record).map(p => `:${p}`).join(",")}) RETURNING *`;
        return executeQuery<ReturnType, InputType>(query, record, options, connection);
    }
}