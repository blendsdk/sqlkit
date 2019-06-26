import { createConnection, closeConnection } from "../connection";
import { executeQuery } from "../executeQuery";

test('executeQuery', async () => {


    const result = await executeQuery<{ bool_val: boolean }, unknown>("select true as bool_val", null, {
        single: true
    });
    await closeConnection();
    expect(result.bool_val).toBe(true);
});