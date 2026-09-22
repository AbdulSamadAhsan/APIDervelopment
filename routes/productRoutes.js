const express = require("express");

const {
    createProduct,
      getProducts,
    deleteProduct,
      getProduct,
    updateProduct

} = require("../controllers/productController");

const router = express.Router();

router.post("/create", createProduct);
router.get("/", getProducts);
router.delete("/:id", deleteProduct);
router.get("/:id",getProduct);
router.put("/:id",  updateProduct);


module.exports = router;

