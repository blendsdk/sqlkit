import { wrapInArray } from "@blendsdk/stdlib/dist/wrapInArray";
import { isNullOrUndefDefault } from "@blendsdk/stdlib/dist/isNullOrUndef";

/**
 * Creates a numbered parameter based the provided argument
 * to be used in an SQL query. This function is mainly used
 * from the IN(....) caluse.
 *
 * @export
 * @template ReturnType
 * @param {(any | any[])} args
 * @param {boolean} [asArray]
 * @returns {ReturnType}
 */
export function toSQLParameters<ReturnType extends string | string[]>(args: any | any[], asArray?: boolean): ReturnType {
    const tArgs = wrapInArray(args),
        aArgs = tArgs.map((a, i) => { return "$" + (i + 1); });
    asArray = isNullOrUndefDefault<boolean>(asArray, false);
    return asArray ? aArgs : aArgs.join(", ") as any;
}