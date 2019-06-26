import { IQueryOptions, executeQuery } from "./executeQuery";
import { DBConnection } from "./connection";

/**
 * Creates a SQL UPDATE statement with filter(s) as sql AND clauses.
 *
 * @export
 * @template ReturnType
 * @template InputType
 * @template FilterType
 * @param {string} table
 * @param {IQueryOptions} [options]
 * @returns
 */
export function sql_update<ReturnType, InputType, FilterType>(table: string, options?: IQueryOptions<InputType, ReturnType>) {
    return async function (record: InputType, filter: FilterType, connection?: DBConnection): Promise<ReturnType> {
        const query = `UPDATE ${table} SET ${Object.keys(record).map(c => `${c} = :i_${c}`)} WHERE ${Object.keys(filter).map(f => `${f} = :f_${f}`).join(" AND ")} RETURNING *`;
        const parameters: any = {};
        Object.keys(record).forEach(f => parameters[`i_${f}`] = record[f]);
        Object.keys(filter).forEach(f => parameters[`f_${f}`] = filter[f]);
        return executeQuery<ReturnType, InputType>(query, parameters, options, connection);
    }
}