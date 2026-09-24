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
        },
        brand:{
          type:String,
          required:[true,"Brand is Required"]

        },
        category:{
          type:String,  
          required:[true,"Category is Required"],
         trim:true,
           minlength: [2, "Category name must be at least 2 characters"],
            maxlength: [10, "Category name cannot exceed 100 characters"]
        },
        stock:{
         type:Number,
          required: [true, "Stock is required"],
         min: [5, "Stcok must be at least 5"],
        max: [10, "Stock cannot exceed 10"]
        }
    },
    {
        timestamps: true
    }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;