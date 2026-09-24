const Product = require("../models/Product");

const createProduct = async (req, res) => {
    try {
        const { name, price ,brand,category,stock} = req.body || {};
 const existingProduct = await Product.findOne({
            name: name.trim()
        });
        if (existingProduct) {
            return res.status(409).json({
                success: false,
                message: "Product already exists"
            });
        }

        const product = await Product.create({
            name,
            price,
            brand,
            category,
            stock
        });

        return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
       


        // Mongoose validation error
        if (error.name === "ValidationError") {
         
        const firstError = Object.values(error.errors)[0];
        
            return res.status(400).json({
                success: false,
                message: firstError.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
const getProducts = async (req, res) => {
    try {
        const products = await Product.find();

        return res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }
};
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(
            req.params.id
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(400).json({
            success: false,
            message: "Invalid product ID"
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, price } = req.body || {};

        // Name validation
        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Product name is required"
            });
        }

        // Price validation
        if (
            price === undefined ||
            price === null ||
            price === ""
        ) {
            return res.status(400).json({
                success: false,
                message: "Price is required"
            });
        }

        const numericPrice = Number(price);

        if (!Number.isFinite(numericPrice)) {
            return res.status(400).json({
                success: false,
                message: "Price must be a number"
            });
        }

        if (numericPrice < 1000 || numericPrice > 10000) {
            return res.status(400).json({
                success: false,
                message: "Price must be between 1000 and 10000"
            });
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: name.trim(),
                price: numericPrice
            },
            {
                 returnDocument: "after",
    runValidators: true
            }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.log(error);
   
        // Invalid MongoDB ObjectId
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Mongoose validation error

        if (error.name === "ValidationError") {
           
            return res.status(400).json({
                success: false,   
                message: error.message
            });
        }

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = {
    createProduct,
    getProducts,
    deleteProduct,
    getProduct,
    updateProduct
};