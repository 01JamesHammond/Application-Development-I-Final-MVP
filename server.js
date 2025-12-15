const express = require("express");
const { db, Device, User, Assignment } = require("./database/setup.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

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

// JWT AUTH MIDDLEWARE
function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.substring(7);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ error: "Token expired" });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ error: "Invalid token" });
        } else {
            return res.status(401).json({ error: "Token verification failed" });
        }
    }
}

function requireManager(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role === "manager" || req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({ error: "Forbidden: manager or admin required" });
}

function requireAdmin(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ error: "Authentication required" });
    }

    if (req.user.role === "admin") {
        return next();
    }

    return res.status(403).json({ error: "Forbidden: admin required" });
}



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


app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, department, role } = req.body;

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            department,
            role
        });

        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({ token });
    } catch (error) {
        res.status(500).json({ error: "Failed to register user" });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Failed to login" });
    }
});

app.post("/api/logout", requireAuth, (req, res) => {
    res.json({ message: "Logout successful" });
});


// DEVICES
app.get("/api/devices", requireAuth, async (req, res) => {
    try {
        const devices = await Device.findAll();
        res.json(devices);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch devices" });
    }
});

app.get("/api/devices/:id", requireAuth, async (req, res) => {
    try {
        const device = await Device.findByPk(req.params.id);
        if (!device) return res.status(404).json({ error: "Device not found" });
        res.json(device);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch device" });
    }
});

app.post("/api/devices", requireAuth, requireManager, async (req, res) => {
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
        res.status(500).json({ error: "Failed to create device" });
    }
});

app.put("/api/devices/:id", requireAuth, requireManager, async (req, res) => {
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
        res.status(500).json({ error: "Failed to update device" });
    }
});

app.delete("/api/devices/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const deletedRowsCount = await Device.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowsCount === 0) return res.status(404).json({ error: "Device not found" });

        res.json({ message: "Device deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete device" });
    }
});

// ASSIGNMENTS
app.get("/api/assignments", requireAuth, async (req, res) => {
    try {
        const assignments = await Assignment.findAll({ include: [Device, User] });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

app.get("/api/assignments/:id", requireAuth, async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id, { include: [Device, User] });
        if (!assignment) return res.status(404).json({ error: "Assignment not found" });
        res.json(assignment);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assignment" });
    }
});

app.post("/api/assignments", requireAuth, requireManager, async (req, res) => {
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
        res.status(500).json({ error: "Failed to create assignment" });
    }
});

app.put("/api/assignments/:id", requireAuth, requireManager, async (req, res) => {
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
        res.status(500).json({ error: "Failed to update assignment" });
    }
});

app.delete("/api/assignments/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const deletedRowsCount = await Assignment.destroy({
            where: { id: req.params.id }
        });

        if (deletedRowsCount === 0) return res.status(404).json({ error: "Assignment not found" });

        res.json({ message: "Assignment deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete assignment" });
    }
});

// USERS

app.get("/api/users/profile", requireAuth, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["id", "name", "email", "department", "role"]
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user profile" });
    }
});

app.get("/api/users", requireAuth, requireAdmin, async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});



// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
