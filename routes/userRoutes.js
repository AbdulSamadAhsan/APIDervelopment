const express = require("express");
const router = express.Router();
const {
    getUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
} = require("../controllers/userController");

router.get("/", getUsers);
router.post("/create",createUser);
router.get("/:id", getUser);
router.put("/:id/update", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;