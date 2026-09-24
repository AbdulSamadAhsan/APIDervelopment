const db = require("../config/database");

class User {
    static async getAll() {
        const [rows] = await db.execute(
            "SELECT * FROM users"
        );

        return rows;
    }

        // Check user by email
   static  async  getByEmail (email)  {
 
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        return rows[0];
    }


     static async create(name, email,password) {
        
        const [result] = await db.execute(
            "INSERT INTO users (name, email,password) VALUES (?, ?,?)",
            [name, email,password]
        );

        return result.insertId;
    }
     static async getById(id) {
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE id = ?",
            [id]
        );

        return rows[0];
    }
      static async update(id, name, email) {
        const [result] = await db.execute(
            "UPDATE users SET name = ?, email = ? WHERE id = ?",
            [name, email, id]
        );
       
        return result.affectedRows;
    }
     static async delete(id) {
        const [result] = await db.execute(
            "DELETE FROM users WHERE id = ?",
            [id]
        );

        return result.affectedRows;
    }


}


module.exports = User;