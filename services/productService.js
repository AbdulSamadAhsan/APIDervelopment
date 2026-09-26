const Product = require("../models/Product");

const createProduct = async (data) => {
      /*
    const existingProduct = await Product.findOne({
        name: data.name.trim()
    });

    if (existingProduct) {
        const error = new Error("Product already exists");
        error.statusCode = 409;
        throw error;
    }*/

    const product = await Product.create({
        name: data.name,
        price: data.price,
        category:data.category,
        brand:data.brand,
        stock:data.stock

    });

    return product;
};
const updateProduct = async (id, data) => {

    const { name, price , category,brand,stock} = data;
    
    // Name validation
    if (!name || !name.trim()) {
        const error = new Error("Product name is required");
        error.statusCode = 400;
        throw error;
    }

    // Price required
    if (
        price === undefined ||
        price === null ||
        price === ""
    ) {
        const error = new Error("Price is required");
        error.statusCode = 400;
        throw error;
    }

    const numericPrice = Number(price);

    // Price must be number
    if (!Number.isFinite(numericPrice)) {
        const error = new Error("Price must be a number");
        error.statusCode = 400;
        throw error;
    }

    // Price range
    if (numericPrice < 1000 || numericPrice > 10000) {
        const error = new Error(
            "Price must be between 1000 and 10000"
        );

        error.statusCode = 400;
        throw error;
    }

    const product = await Product.findByIdAndUpdate(
        id,
        {
            name: name.trim(),
            price: numericPrice,
            category:category,
            brand:brand,
            stock:stock
        },
        {
            returnDocument: "after",
            runValidators: true
        }
    );

    if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        throw error;
    }

    return product;
};

module.exports = {
    createProduct,
    updateProduct
};