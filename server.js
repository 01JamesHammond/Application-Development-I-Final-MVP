const express = require("express");
const { db, Device, User, Assignment } = require("./database/setup.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Custom logging middleware
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

    // Log request body for POST and PUT requests
    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }

    next(); // Pass control to next middleware
};

app.use(requestLogger);


// Test database connection
async function testConnection() {
    try {
        await db.authenticate();
        console.log("Connection to database established successfully.");
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

testConnection();

// DEVICES
app.get("/api/devices", async (req, res) => {
    try {
        const devices = await Device.findAll();
        res.json(devices);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).json({ error: "Failed to fetch devices" });
    }
});

app.get("/api/devices/:id", async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) return res.status(404).json({ error: "Device not found" });
        res.json(device);
    } catch (error) {
        console.error("Error fetching device:", error);
        res.status(500).json({ error: "Failed to fetch device" });
    }
});

app.post("/api/devices", async (req, res) => {
    try {
        const { name, type, serialNumber, status, location, purchaseDate, notes } = req.body;

        const newDevice = await Device.create({
            name,
            type,
            serialNumber,
            status,
            location,
            purchaseDate,
            notes
        });

        res.status(201).json(newDevice);
    } catch (error) {
        console.error("Error creating device:", error);
        res.status(500).json({ error: "Failed to create device" });
    }
});

app.put("/api/devices/:id", async (req, res) => {
    try {
        const { name, type, serialNumber, status, location, purchaseDate, notes } = req.body;

        const [updatedRowsCount] = await Device.update(
            { name, type, serialNumber, status, location, purchaseDate, notes },
            { where: { id: req.params.id } }
        );

        if (updatedRowsCount === 0) return res.status(404).json({ error: "Device not found" });

        const updatedDevice = await Device.findByPk(req.params.id);
        res.json(updatedDevice);
    } catch (error) {
        console.error("Error updating device:", error);
        res.status(500).json({ error: "Failed to update device" });
    }
});

app.delete("/api/devices/:id", async (req, res) => {
    try {
        const deletedRowsCount = await Device.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowsCount === 0) return res.status(404).json({ error: "Device not found" });

        res.json({ message: "Device deleted successfully" });
    } catch (error) {
        console.error("Error deleting device:", error);
        res.status(500).json({ error: "Failed to delete device" });
    }
});

// ASSIGNMENTS
app.get("/api/assignments", async (req, res) => {
    try {
        const assignments = await Assignment.findAll({ include: [Device, User] });
        res.json(assignments);
    } catch (error) {
        console.error("Error fetching assignments:", error);
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

app.get("/api/assignments/:id", async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id, { include: [Device, User] });
        if (!assignment) return res.status(404).json({ error: "Assignment not found" });
        res.json(assignment);
    } catch (error) {
        console.error("Error fetching assignment:", error);
        res.status(500).json({ error: "Failed to fetch assignment" });
    }
});

app.post("/api/assignments", async (req, res) => {
    try {
        const { deviceId, userId, assignedAt, returnedAt } = req.body;

        const newAssignment = await Assignment.create({
            deviceId,
            userId,
            assignedAt,
            returnedAt
        });

        res.status(201).json(newAssignment);
    } catch (error) {
        console.error("Error creating assignment:", error);
        res.status(500).json({ error: "Failed to create assignment" });
    }
});

app.put("/api/assignments/:id", async (req, res) => {
    try {
        const { deviceId, userId, assignedAt, returnedAt } = req.body;

        const [updatedRowsCount] = await Assignment.update(
            { deviceId, userId, assignedAt, returnedAt },
            { where: { id: req.params.id } }
        );

        if (updatedRowsCount === 0) return res.status(404).json({ error: "Assignment not found" });

        const updatedAssignment = await Assignment.findByPk(req.params.id);
        res.json(updatedAssignment);
    } catch (error) {
        console.error("Error updating assignment:", error);
        res.status(500).json({ error: "Failed to update assignment" });
    }
});

app.delete("/api/assignments/:id", async (req, res) => {
    try {
        const deletedRowsCount = await Assignment.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowsCount === 0) return res.status(404).json({ error: "Assignment not found" });

        res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        res.status(500).json({ error: "Failed to delete assignment" });
    }
});

// USERS
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

app.get("/api/users/:id", async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

app.post("/api/users", async (req, res) => {
    try {
        const { name, email, department, role } = req.body;

        const newUser = await User.create({
            name,
            email,
            department,
            role
        });

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Failed to create user" });
    }
});

app.put("/api/users/:id", async (req, res) => {
    try {
        const { name, email, department, role } = req.body;

        const [updatedRowsCount] = await User.update(
            { name, email, department, role },
            { where: { id: req.params.id } }
        );

        if (updatedRowsCount === 0) return res.status(404).json({ error: "User not found" });

        const updatedUser = await User.findByPk(req.params.id);
        res.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Failed to update user" });
    }
});

app.delete("/api/users/:id", async (req, res) => {
    try {
        const deletedRowsCount = await User.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowsCount === 0) return res.status(404).json({ error: "User not found" });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
