const express = require("express");
const productController = require("../controllers/product.js");
const { verify, verify2, verifyAdmin } = require("../auth");

const router = express.Router();

// Create a Product (Admin Only)
router.post("/", verify, verifyAdmin, productController.createProduct);

// Retrieve all products (Admin Only)
router.get("/all", verify2, verifyAdmin, productController.getAllProducts);

// Retrieve all active products (All Users)
router.get("/active", productController.getActiveProducts);

// Retrieve single product (All Users)
router.get("/:productId", productController.getSingleProduct);

// Update Product Info (Admin Only)
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

// Archive Product (Admin Only)
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

// Activate Product (Admin Only)
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

router.post("/search-by-name", productController.searchByName);

router.post("/search-by-price", productController.searchByPrice);

module.exports = router;
