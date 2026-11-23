const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

// Get tasks with search and filter
router.get("/", authMiddleware, async (req, res) => {
    try {
        const { search, status, priority } = req.query;

        const filter = {
            userId: req.user.id
        };

        if (status === "completed") {
            filter.completed = true;
        }

        if (status === "pending") {
            filter.completed = false;
        }

        if (priority) {
            filter.priority = priority;
        }

        if (search) {
            filter.title = {
                $regex: search,
                $options: "i"
            };
        }

        const tasks = await Task.find(filter)
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create task
router.post("/", authMiddleware, async (req, res) => {
    try {
        const task = await Task.create({
            title: req.body.title,
            description: req.body.description,
            priority: req.body.priority || "Medium",
            dueDate: req.body.dueDate || null,
            userId: req.user.id
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update task
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        if (req.body.title !== undefined)
            task.title = req.body.title;

        if (req.body.description !== undefined)
            task.description = req.body.description;

        if (req.body.completed !== undefined)
            task.completed = req.body.completed;

        if (req.body.priority !== undefined)
            task.priority = req.body.priority;

        if (req.body.dueDate !== undefined)
            task.dueDate = req.body.dueDate || null;

        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete task
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;