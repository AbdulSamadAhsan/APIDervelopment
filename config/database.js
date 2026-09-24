const mysql = require("mysql2/promise");
const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
async function testConnection() {
    try {
        const connection = await db.getConnection();

        console.log("MySQL connected successfully");

        connection.release();
    } catch (error) {
        console.error("MySQL connection failed:"+error);
        console.error(error);
    }
}

testConnection();


module.exports = db;