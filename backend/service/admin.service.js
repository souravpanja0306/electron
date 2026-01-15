const db = require("../database/connection");

exports.resetTableData = async ({
    tableNames = "",
}) => {
    try {
        let result = await db.exec(`DROP TABLE IF EXISTS ${tableNames}`);
        return result;
    } catch (error) {
        console.log(error)
    };
};
