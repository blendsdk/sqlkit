import { close } from "fs";
import { closeConnection, createConnection } from "../connection";
import { executeQuery, IDynamicQuery } from "../executeQuery";
import { sql_query } from "../query";
import { toSQLParameters } from "../utils";

test("sql_query", async () => {
    const connection = createConnection({
        database: "postgres",
        user: "postgres",
        password: "postgres",
        host: "localhost"
    });

    const get_db_year = sql_query<{ year: number }, unknown>(
        `select date_part('year', now()) as year`,
        {
            single: true
        }
    );

    const result = await get_db_year();

    expect(result.year).toBe(new Date().getFullYear());

    await closeConnection();
});

test("sql_query dynamic", async () => {
    const connection = createConnection({
        database: "postgres",
        user: "postgres",
        password: "postgres",
        host: "localhost"
    });

    interface InputType {
        oids: number[];
    }

    const get_oids = sql_query<any[], InputType>(
        (params: InputType): IDynamicQuery => {
            return {
                named: false,
                sql: `select * from pg_class where oid in (${toSQLParameters<string>(params.oids)})`,
                parameters: params.oids
            }
        }
    );

    const result = await get_oids({ oids: [112, 113, 174] });
    expect(result.length).toEqual(3);

    await closeConnection();
});
