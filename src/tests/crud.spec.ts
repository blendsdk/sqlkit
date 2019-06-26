import { createConnection, closeConnection } from "../connection";
import { sql_insert } from "../insert";
import { sql_update } from "../update";
import { sql_delete } from "../delete";

interface SQLKitRecord {
    id?: number,
    field1?: string;
    field2?: boolean;
}

describe("CRUD", () => {
    // Applies only to tests in this describe block
    beforeAll(async () => {
        const conn = createConnection({
            database: 'postgres',
            user: 'postgres',
            password: 'postgres',
            host: 'localhost'
        });

        await conn.query(`
            drop table if exists sqlkit;
            create table sqlkit (
                id serial not null primary key,
                field1 varchar not null,
                field2 boolean not null default true
            );
        `)

    });

    afterAll(async () => {
        const conn = createConnection();
        await conn.query("drop table if exists sqlkit")
        await closeConnection();
    })

    test('1. INSERT', async () => {
        const addRecord = sql_insert<SQLKitRecord, SQLKitRecord>("sqlkit");
        const result = await addRecord({
            field1: "test1"
        });
        expect(result.id).toBe(1);
        expect(result.field1).toBe("test1");
        expect(result.field2).toBe(true);
    });

    test('2. UPDATE', async () => {
        const updateRecordByID = sql_update<SQLKitRecord, SQLKitRecord, { id: number }>("sqlkit", { single: true })
        const result = await updateRecordByID(
            {
                field1: "changed",
                field2: false
            },
            {
                id: 1
            });
        expect(result.id).toBe(1);
        expect(result.field1).toBe("changed");
        expect(result.field2).toBe(false);
    });

    test('2. DELETE', async () => {
        const deleteRecord = sql_delete<SQLKitRecord[], { id: number }>("sqlkit");
        const result = await deleteRecord({ id: 1 });
        expect(result.length).toBe(1);
    });

});