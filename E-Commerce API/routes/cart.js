const express = require("express");
const cartController = require("../controllers/cart.js");
const { verify } = require("../auth");
const { removeFromCart, clearCart } = require("../controllers/cart");
const router = express.Router();

router.get("/get-cart", verify, cartController.getCart);

router.post("/add-to-cart", verify, cartController.addToCart);

router.patch("/update-cart-quantity", verify, cartController.updateCartQuantity);

router.patch("/:productId/remove-from-cart", verify, removeFromCart);

router.put("/clear-cart", verify, clearCart);

module.exports = router;