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
router.get("/", getUsers);
router.get("/profile",authenticate,profileUser);

router.post("/create",createUser);
router.get("/:id", getUser);
router.put("/:id/update", updateUser);
router.delete("/:id", deleteUser);
router.post("/login", loginUser);

module.exports = router;