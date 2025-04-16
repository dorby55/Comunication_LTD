// routes/customers.js
const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const auth = require("../middleware/auth");

// All customer routes are protected
router.use(auth);

// Add new customer
router.post("/customers", customerController.addCustomer);

// Get all customers
router.get("/customers", customerController.getCustomers);

// Get customer by ID
router.get("/customers/:id", customerController.getCustomerById);

module.exports = router;
