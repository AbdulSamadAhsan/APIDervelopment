const express = require("express");
const router = express.Router();
const {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    loginUser,
     profileUser
} = require("../controllers/userController");
 const { authenticate } =
    require("../middleware/authMiddleware");
    const verifyApiKey = require("../middleware/apiKeyMiddleware");
router.get("/", getUsers);
router.get("/profile",authenticate,verifyApiKey,profileUser);
router.post("/create",createUser);
router.get("/:id", getUser);
router.put("/:id/update", updateUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);
console.log("All Routes Are Working Properly");
module.exports = router;