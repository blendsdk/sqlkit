import { createConnection, closeConnection } from "../connection";
import { close } from "fs";
import { executeQuery } from "../executeQuery";
import { sql_query } from "../query";

test('sql_query', async () => {

    const connection = createConnection({
        database: 'postgres',
        user: 'postgres',
        password: 'postgres',
        host: 'localhost'
    });

    const get_db_year = sql_query<{ year: number }, unknown>(`select date_part('year', now()) as year`, {
        single: true
    });

    const result = await get_db_year()

    expect(result.year).toBe(new Date().getFullYear())

    await closeConnection();
});