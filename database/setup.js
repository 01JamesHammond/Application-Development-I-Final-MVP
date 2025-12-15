// database/setup.js
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

// Create Sequelize instance
const db = new Sequelize({
    dialect: "sqlite",
    storage: `database/${process.env.DB_NAME}`,
    logging: console.log
});

// Define Device model
const Device = db.define("Device", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    type: {
        type: DataTypes.STRING
    },
    serialNumber: {
        type: DataTypes.STRING,
        unique: true
    },
    status: {
        type: DataTypes.STRING
    },
    location: {
        type: DataTypes.STRING
    },
    purchaseDate: {
        type: DataTypes.STRING
    },
    notes: {
        type: DataTypes.STRING
    }
});

// Define User model
const User = db.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    department: {
        type: DataTypes.STRING
    },
    role: {
        type: DataTypes.STRING
    }
});

// Define Assignment model
const Assignment = db.define("Assignment", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    deviceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Device,
            key: "id"
        }
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "id"
        }
    },
    assignedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    returnedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});


// Define relationships
Device.hasMany(Assignment, { foreignKey: "deviceId" });
Assignment.belongsTo(Device, { foreignKey: "deviceId" });

User.hasMany(Assignment, { foreignKey: "userId" });
Assignment.belongsTo(User, { foreignKey: "userId" });

// Async function to initialize database
async function setupDatabase() {
    try {
        await db.authenticate();
        console.log("Connection to database established successfully.");

        // force: true drops tables if they exist; use false if you want to preserve data
        await db.sync({ force: true });
        console.log(`Database file created at: database/${process.env.DB_NAME}`);
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

// Run only when file is executed directly
if (require.main === module) {
    setupDatabase();
}

module.exports = { db, Device, User, Assignment };
