const Order = require("../models/Order");
const Cart = require('../models/Cart');

module.exports.createOrder = (req, res) => {
    Cart.findOne({ userId: req.user.id })
    .then(cart => {
        if(!cart) {
            return res.status(404).send({ error: "No Items to Checkout" });
        } else {
            const order = new Order({
                userId: req.user.id,
                productsOrdered: cart.cartItems, 
                totalPrice: cart.totalPrice      
            });

            return order.save()
            .then(() => {
                return res.status(201).send({ message: "Ordered Successfully" });
            })
        }
    })
    .catch(error => errorHandler(error, req, res));
}

// Retrieve logged-in user's orders
module.exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id });
        if (!orders.length) {
            return res.status(404).json({ message: "No orders found for this user." });
        }
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Retrieve all users' orders (Admin only)
module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({});
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
