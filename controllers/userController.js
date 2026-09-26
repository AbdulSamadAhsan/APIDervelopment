const User = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// ==========================
// CREATE USER
// ==========================
console.log("Controllers");
const createUser = async (req, res) => {
    try {

        const { name, email,password } = req.body || {};

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }
        if(!password){
              return res.status(400).json({
                success: false,
                message: "Password is required"
            });
        }
        const hashedPassword = await bcrypt.hash(
    password,
    12
);
    
        const existingUser = await User.getByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already registered"
            });
        }

        const userId = await User.create(name, email,hashedPassword);

        const user = await User.getById(userId);
delete user.password;
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
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }
        if (!password) {
            return res.status(400).json({ success: false, message: "Password is required" });
        }
        const existingUser = await User.getByEmail(email);
        if (!existingUser) {
            return res.status(404).json({ status: false, message: "User Not Registered" });
        }
        const isMatch = await bcrypt.compare(password, existingUser.password);
        if (!isMatch) {
            return res.status(404).json({ status: false, message: "Wrong Password" });
        }
        const { password: passwordHash, ...publicUser } = existingUser;
        const api_key = process.env.API_KEY;
        const token = jwt.sign(
            { ...publicUser, api_key },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );
        return res.status(200).json({
            status: true,
            message: "User Login Successfully",
            apikey: api_key,
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
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
        delete user.password;
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
        const { name, email ,password} = req.body;

        if (!name || !email) {
            return res.status(400).json({
                success: false,
                message: "Name and email are required"
            });
        }
         let hashedPassword = null;

        // Hash password only if provided
        if (password && password.trim() !== "") {
            hashedPassword = await bcrypt.hash(password, 10);
        }    


        const affectedRows = await User.update(
            req.params.id,
            name,
            email,
            hashedPassword

        );

        if (affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = await User.getById(req.params.id);
        delete user.password;
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

const profileUser=async(req,res)=>{
    console.log("User Profile Controller");
    
      
    return res.status(200).json(req.user);
};
module.exports = {
    createUser,
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    loginUser,
    profileUser
};