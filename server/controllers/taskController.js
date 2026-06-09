const Task = require('../models/Task');
const Activity = require('../models/Activity');
const { awardXP } = require('../utils/gamification');

// @desc    Get tasks for user (optionally filtered by date)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        const { date } = req.query;
        const query = { user: req.user._id };

        if (date) {
            // Get start and end of the specified date in UTC or local day range
            const startDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setUTCHours(23, 59, 59, 999);

            query.date = {
                $gte: startDate,
                $lte: endDate
            };
        }

        const tasks = await Task.find(query).sort({ completed: 1, priority: -1, createdAt: -1 });

        res.json({
            success: true,
            count: tasks.length,
            data: tasks
        });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch tasks'
        });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const { title, description, date, category, priority } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Task title is required'
            });
        }

        const taskDate = date ? new Date(date) : new Date();

        const task = await Task.create({
            title,
            description,
            date: taskDate,
            category: category || 'Other',
            priority: priority || 2,
            user: req.user._id
        });

        res.status(201).json({
            success: true,
            message: 'Task created successfully',
            data: task
        });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create task',
            error: error.message
        });
    }
};

// @desc    Update task (and award XP if completed)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const existingTask = await Task.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!existingTask) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        const oldCompleted = existingTask.completed;
        const updates = req.body;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            updates,
            { new: true, runValidators: true }
        );

        let xpResult = null;

        // If completed status changed
        if (task.completed && !oldCompleted) {
            // Log in activity stream
            await Activity.create({
                user: req.user._id,
                activityType: 'DAILY_TASK_COMPLETED',
                referenceId: String(task._id),
                detail: `Completed daily planner task: ${task.title}`,
                date: new Date()
            });

            // Award XP
            xpResult = await awardXP(req.user._id, 'TASK_COMPLETED');
        } else if (!task.completed && oldCompleted) {
            // Delete associated activity
            await Activity.deleteMany({
                user: req.user._id,
                activityType: 'DAILY_TASK_COMPLETED',
                referenceId: String(task._id)
            });
        }

        res.json({
            success: true,
            message: 'Task updated successfully',
            data: task,
            xpResult
        });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update task',
            error: error.message
        });
    }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Clean up any completion activity
        await Activity.deleteMany({
            user: req.user._id,
            activityType: 'DAILY_TASK_COMPLETED',
            referenceId: String(task._id)
        });

        res.json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete task'
        });
    }
};

module.exports = {
    getTasks,
    createTask,
    updateTask,
    deleteTask
};
