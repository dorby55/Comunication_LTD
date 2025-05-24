const db = require("../config/db");
const he = require("he");

class Customer {
  static async create(customerData) {
    const { id, first_name, last_name } = customerData;

    //const encodedId = he.encode(id);
    const encodedFirstName = he.encode(first_name || "");
    const encodedLastName = he.encode(last_name || "");

    const query = `
      INSERT INTO customers (id, first_name, last_name)
      VALUES (?, ?, ?)
    `;

    const [result] = await db.execute(query, [
      id,
      encodedFirstName,
      encodedLastName,
    ]);

    return {
      id: id,
      first_name: encodedFirstName,
      last_name: encodedLastName,
    };
  }

  static async findAll() {
    const query = "SELECT * FROM customers ORDER BY first_name";
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findById(customerId) {
    const query = "SELECT * FROM customers WHERE id = ?";
    const [rows] = await db.execute(query, [customerId]);
    return rows[0];
  }
}

module.exports = Customer;
