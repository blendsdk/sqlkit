import { createConnection, closeConnection } from "../connection";

test('default connection by config', async () => {
    const connection = createConnection({
        database: 'postgres',
        user: 'postgres',
        password: 'postgres',
        host: 'localhost'
    });
    await connection.query("select 1");
    expect(connection).not.toBe(null);
    await closeConnection();
});