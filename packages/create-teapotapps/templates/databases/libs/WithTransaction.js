import db from "../configs/database.js";
import { responseApi } from "./RestApiHandler.js";

export const withTransaction = (fn, useTransaction = true) => {
    return async (req, res) => {
        let transaction = null;
        try {
            if (useTransaction) {
                transaction = await db.transaction();
                await fn(req, res, transaction);
                await transaction.commit();
            } else {
                await fn(req, res, null);
            }
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error("Error in withTransaction:", error);
            return responseApi(res, [], null, "Server error....", 1);
        }
    };
};
