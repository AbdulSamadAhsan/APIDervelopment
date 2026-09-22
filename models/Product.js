const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Product name is required"],
            trim: true,
            minlength: [2, "Product name must be at least 2 characters"],
            maxlength: [100, "Product name cannot exceed 100 characters"]
        },

        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [1000, "Price must be at least 1000"],
            max: [10000, "Price cannot exceed 10000"]
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;