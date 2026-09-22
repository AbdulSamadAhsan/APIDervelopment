const User = require("../models/User");


// ==========================
// CREATE USER
// ==========================
const createUser = async (req, res) => {
    try {
        
  const { name, email } = req.body || {};

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }
         const existingUser = await User.getByEmail(email);
          if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already registered"
            });
        }

        const userId = await User.create(name, email);
       
        const user = await User.getById(userId);

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: user
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================
// GET ALL USERS
// ==========================
const getUsers = async (req, res) => {
    try {
        const users = await User.getAll();

        return res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================
// GET SINGLE USER
// ==========================
const getUser = async (req, res) => {
    try {
        const user = await User.getById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================
// UPDATE USER
// ==========================
const updateUser = async (req, res) => {
    try {
        const { name, email } = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }

        const affectedRows = await User.update(
            req.params.id,
            name,
            email
        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = await User.getById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: user
        });

    } catch (error) {
        console.error(error);

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


// ==========================
// DELETE USER
// ==========================
const deleteUser = async (req, res) => {
    try {
        const affectedRows = await User.delete(req.params.id);
         
        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};


module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser
};