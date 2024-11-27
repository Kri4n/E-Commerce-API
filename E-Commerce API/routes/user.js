// [SECTION] Dependencies and Modules
const express = require("express");
const { verify, verifyAdmin } = require("../auth"); 
const userController = require("../controllers/user.js");

// [SECTION] Routing Component
const router = express.Router();

// Routes will be placed here

// Route for user registration
router.post("/register", userController.registerUser);

// Route for user authentication
router.post("/login", userController.loginUser);

// Route to retrieve User Details
router.get("/details", verify, userController.getProfile);

// Route to update user as admin (Admin)
router.patch("/:userId/set-as-admin", verify, verifyAdmin, userController.updateAdmin);

// Route to update user password
router.patch("/update-password", verify, userController.updatePassword);

// [SECTION] Export Route System
module.exports = router;
