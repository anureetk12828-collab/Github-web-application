const express = require("express");

const Task = require("../models/Task");
const requireAuth = require("../middleware/auth");

const router = express.Router();

// All routes require login
router.use(requireAuth);

// GET ALL TASKS
router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.userId
        }).sort({ createdAt: -1 });

        res.json(tasks);

    } catch (error) {
        res.status(500).json({
            message: "Could not load tasks."
        });
    }
});

// CREATE TASK
router.post("/", async (req, res) => {
    try {
        const title = (req.body.title || "").trim();

        if (!title || title.length > 120) {
            return res.status(400).json({
                message: "Task title must be 1-120 characters."
            });
        }

        const task = await Task.create({
            title,
            user: req.userId
        });

        res.status(201).json(task);

    } catch (error) {
        res.status(500).json({
            message: "Could not create task."
        });
    }
});

// UPDATE TASK
router.patch("/:id", async (req, res) => {
    try {
        const updates = {};

        if (typeof req.body.title === "string") {
            const title = req.body.title.trim();

            if (!title || title.length > 120) {
                return res.status(400).json({
                    message: "Invalid task title."
                });
            }

            updates.title = title;
        }

        if (typeof req.body.completed === "boolean") {
            updates.completed = req.body.completed;
        }

        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.userId
            },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.json(task);

    } catch (error) {
        res.status(400).json({
            message: "Could not update task."
        });
    }
});

// DELETE TASK
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found."
            });
        }

        res.json({
            message: "Task deleted."
        });

    } catch (error) {
        res.status(400).json({
            message: "Could not delete task."
        });
    }
});

module.exports = router;