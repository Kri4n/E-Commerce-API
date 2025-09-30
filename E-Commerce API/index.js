// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const productRoutes = require("./routes/product.js");
const userRoutes = require("./routes/user.js");
const cartRoutes = require("./routes/cart.js");
const orderRoutes = require("./routes/order.js");

// [SECTION] Environment Setup
// const port = 4000;
require("dotenv").config();

// [SECTION] Server Setup
// Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Allows all resources to access our backend application
// app.use(cors());

// You can also customize CORS options to meet your specific requirements
const corsOptions = {
  origin: [
    "http://localhost:8000",
    "http://localhost:4006",
    "http://localhost:3000",
    "https://cartify-io.vercel.app/",
  ], //allow requests from this origin
  credentials: true, // Allows credentials(cookies, authorization headers)
  optionsSuccessStatus: 200, // Provides a status code to use for successful options request
};

app.use(cors(corsOptions));

mongoose.connect(process.env.MONGODB_STRING, {});

mongoose.connection.once("open", () =>
  console.log("Now Connected to MongoDB Atlas.")
);

app.use("/b6/users", userRoutes);
app.use("/b6/products", productRoutes);
app.use("/b6/cart", cartRoutes);
app.use("/b6/orders", orderRoutes);

if (require.main === module) {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`API is now online on port ${process.env.PORT || 3000}`);
  });
}

module.exports = { app, mongoose };
