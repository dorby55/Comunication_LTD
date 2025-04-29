// Secure version of models/Customer.js
const db = require("../config/db");

class Customer {
  static async create(customerData, createdBy) {
    const { name, email, phone, address, packageType, sector } = customerData;

    // SECURE: Using parameterized queries to prevent SQL Injection
    const query = `
      INSERT INTO customers (name, email, phone, address, package_type, sector, created_by, registration_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;

    const [result] = await db.execute(query, [
      name,
      email,
      phone,
      address,
      packageType,
      sector,
      createdBy,
    ]);

    return {
      id: result.insertId,
      name,
      email,
      phone,
      address,
      packageType,
      sector,
    };
  }

  static async findAll() {
    const query = "SELECT * FROM customers ORDER BY registration_date DESC";
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findById(customerId) {
    // SECURE: Using parameterized queries to prevent SQL Injection
    const query = "SELECT * FROM customers WHERE customer_id = ?";
    const [rows] = await db.execute(query, [customerId]);
    return rows[0];
  }
}

module.exports = Customer;
