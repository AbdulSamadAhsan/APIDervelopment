const Product = require("../models/Product");
const productService = require("../services/productService");
const createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body);
         return res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product
        });

    } catch (error) {
       

          console.log(error.name);
        // Mongoose validation error
        if (error.name === "ValidationError") {
         
        const firstError = Object.values(error.errors)[0];
        
            return res.status(400).json({
                success: false,
                message: firstError.message
            });
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
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
     
 const product = await productService.updateProduct(
            req.params.id,
            req.body
        );
        // Name validation
      

        // Price validation
    

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.log(error.name);
   
        // Invalid MongoDB ObjectId
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID"
            });
        }

        // Mongoose validation error

        if (error.name === "ValidationError") {
             const firstError = Object.values(error.errors)[0];
        
            return res.status(400).json({
                success: false,
                message: firstError.message
            });  
         
        }

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message
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
