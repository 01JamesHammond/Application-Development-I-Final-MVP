const express = require("express");
const { db, Device, User, Assignment } = require("./database/setup.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

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

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
