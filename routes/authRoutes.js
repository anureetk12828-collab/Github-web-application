const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

const router = express.Router();

function makeToken(userId) {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
    );
}

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password || password.length < 8) {
            return res.status(400).json({
                message: "Enter name, email and a password of at least 8 characters."
            });
        }

        const cleanEmail = email.toLowerCase().trim();

        const existing = await User.findOne({
            email: cleanEmail
        });

        if (existing) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            passwordHash
        });

        return res.status(201).json({
            message: "Registration successful.",
            token: makeToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Could not register user."
        });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Incorrect email or password."
            });
        }

        return res.json({
            message: "Login successful.",
            token: makeToken(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Could not log in."
        });
    }
});

module.exports = router;