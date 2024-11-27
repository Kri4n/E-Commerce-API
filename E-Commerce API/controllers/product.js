const Product = require("../models/Product.js");
const { errorHandler } = require("../auth");

// Create a Product (Admin Only)
module.exports.createProduct = (req, res) => {
    const { name, description, price } = req.body;

    if (!name || !description || typeof price !== "number" || price < 0) {
        return res.status(400).send({ message: "Invalid product details" });
    }

    const newProduct = new Product({ name, description, price });
    return newProduct
        .save()
        .then((result) => res.status(201).send(result))
        .catch((error) => errorHandler(error, req, res));
};

// Retrieve all products (Admin Only)
module.exports.getAllProducts = (req, res) => {
    Product.find({})
        .then((products) => res.status(200).send(products))
        .catch((error) => errorHandler(error, req, res));
};

// Retrieve all active products (All Users)
module.exports.getActiveProducts = (req, res) => {
    return Product.find({ isActive: true })
        .then((products) => res.status(200).send(products))
        .catch((error) => errorHandler(error, req, res));
};

// Retrieve single product (All Users)
module.exports.getSingleProduct = (req, res) => {
    const { productId } = req.params;

    return Product.findById(productId)
        .then((product) => {
            if (!product) {
                return res.status(404).send({ message: "Product not found" });
            }
            res.status(200).send(product);
        })
        .catch((error) => errorHandler(error, req, res));
};

// Update Product (Admin Only)
module.exports.updateProduct = (req, res)=>{
    
    let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(product => {
        if (product) {
            res.status(200).send({ success: true, message: 'Product updated successfully' });
        } else {
            res.status(404).send({ error: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

// Archive Product (Admin Only)
module.exports.archiveProduct = (req, res) => {
    
    let updateActiveField = {
        isActive: false
    };
    
    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (product) {
            if (!product.isActive) {
                return res.status(200).send({ 
                    message: 'Product already archived',
                    archivedProduct: product
                });
            }
            return res.status(200).send({ 
                success: true, 
                message: 'Product archived successfully'
            });
        } else {
            return res.status(404).send({ message: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


// Activate Product (Admin Only)
module.exports.activateProduct = (req, res) => {
    
    let updateActiveField = {
        isActive: true
    }
    
    Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(product => {
        if (product) {
            if (product.isActive) {

                return res.status(200).send({ 
                    message: 'Product already active', 
                    activatedProduct: product
                });
            }

            return res.status(200).send({
                success: true,
                message: 'Product activated successfully'
            });
        } else {
            return res.status(404).send({ error: 'Product not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.searchByName = (req, res) => {
    const { name } = req.body;

    Product.find({ name: { $regex: name, $options: 'i' } })
        .then(products => {
            return res.status(200).send(products)})
        .catch((error) => errorHandler(error, req, res));
};

module.exports.searchByPrice = (req, res) => {
    const { minPrice, maxPrice } = req.body;

    Product.find({ price: { $gte: minPrice, $lte: maxPrice } })
        .then(products => {
            return res.status(200).send(products)})
        .catch((error) => errorHandler(error, req, res));
};
