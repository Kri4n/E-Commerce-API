const Cart = require("../models/Cart.js");
const { errorHandler } = require("../auth");

module.exports.getCart = (req, res) => {
  return Cart.find({ userId: req.user.id })
    .then((cart) => {
      if (cart.length > 0) {
        return res.status(200).send(cart);
      }
      return res.status(404).send({
        message: "No products added to cart",
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.addToCart = (req, res) => {
  Cart.findOne({ userId: req.user.id })
    .then((cart) => {
      if (!cart) {
        // No cart found, create a new one
        cart = new Cart({
          userId: req.user.id,
          cartItems: [],
        });
      }

      // Check if product already exists in cart
      const existingItem = cart.cartItems.find(
        (item) => item.productId === req.body.productId
      );
      if (existingItem) {
        // Update quantity and subtotal
        existingItem.quantity += req.body.quantity;
        existingItem.subtotal += req.body.subtotal;
      } else {
        // Add new product to cart
        cart.cartItems.push({
          productId: req.body.productId,
          quantity: req.body.quantity,
          subtotal: req.body.subtotal,
        });
      }

      // Update totalPrice
      cart.totalPrice = cart.cartItems.reduce(
        (total, item) => total + item.subtotal,
        0
      );

      // Save cart document
      return cart.save();
    })
    .then((updatedCart) => {
      return res.status(201).send({
        message: "Item added to cart successfully",
        cart: updatedCart,
      });
    })
    .catch((error) => errorHandler(error, req, res));
};

module.exports.updateCartQuantity = async (req, res) => {
  try {
    const { productId, quantity, subtotal } = req.body;

    const userId = req.user.id;

    const cart = await Cart.findOne({ userId });

    const productIndex = cart.cartItems.findIndex(
      (item) => item.productId === productId
    );

    if (productIndex !== -1) {
      cart.cartItems[productIndex].quantity = quantity;
      cart.cartItems[productIndex].subtotal = subtotal;
    } else {
      cart.cartItems.push({
        productId,
        quantity,
        subtotal,
      });
    }

    cart.totalPrice = cart.cartItems.reduce(
      (acc, item) => acc + item.subtotal,
      0
    );

    await cart.save();

    return res.status(200).json({
      message: "Cart updated successfully.",
      cartContents: cart,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while updating the cart.",
      errorDetails: error.message,
    });
  }
};

module.exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;

    // Find the cart for the user
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).send({ message: "Cart not found." });
    }

    // Find the index of the product in the cart items
    const productIndex = cart.cartItems.findIndex(
      (item) => item.productId === productId
    );
    if (productIndex === -1) {
      return res.status(404).send({ message: "Item not found in cart" });
    }

    // Update the total price by subtracting the subtotal of the removed product
    const productSubtotal = cart.cartItems[productIndex].subtotal;
    cart.totalPrice = Math.max(cart.totalPrice - productSubtotal, 0);

    // Remove the product from the cart items
    cart.cartItems.splice(productIndex, 1);

    // Save the updated cart
    const updatedCart = await cart.save();

    // Respond with success
    return res.status(200).send({
      message: "Item removed from cart successfully.",
      updatedCart: updatedCart,
    });
  } catch (error) {
    (error) => errorHandler(error, req, res);
  }
};

module.exports.clearCart = (req, res) => {
  const userId = req.user.id;

  Cart.findOne({ userId: userId })
    .then((cart) => {
      if (!cart) {
        return res.status(404).send({ message: "Cart not found." });
      }

      if (cart.cartItems.length === 0) {
        return res.status(400).send({ message: "Cart is already empty." });
      }

      cart.cartItems = [];
      cart.totalPrice = 0;

      cart
        .save()
        .then((updatedCart) => {
          res.status(200).send({
            message: "Cart cleared.",
            cart: updatedCart,
          });
        })
        .catch((err) =>
          res.status(500).send({ message: "Error saving cart.", error: err })
        );
    })
    .catch((err) =>
      res.status(500).send({ message: "Error finding cart.", error: err })
    );
};
