import { IQueryOptions, executeQuery } from "./executeQuery";
import { DBConnection } from "./connection";

/**
 * Creates a SQL DELETE statement with filter(s) as sql AND clauses.
 *
 * @export
 * @template ReturnType
 * @template FilterType
 * @param {string} table
 * @param {IQueryOptions} [options]
 * @returns
 */
export function sql_delete<ReturnType, FilterType>(table: string, options?: IQueryOptions<ReturnType, ReturnType>) {
    return async function (filter: FilterType, connection?: DBConnection): Promise<ReturnType> {
        const query = `DELETE FROM ${table} WHERE ${Object.keys(filter).map(f => `${f} = :f_${f}`).join(" AND")} RETURNING *`;
        const parameters: any = {};
        Object.keys(filter).forEach(f => parameters[`f_${f}`] = filter[f]);
        return executeQuery<ReturnType, any>(query, parameters, options, connection);
    }
}