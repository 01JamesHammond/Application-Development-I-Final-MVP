# Application-Development-I-Final-MVP# Inventory & Assignment Management API

A REST API for managing devices, users, and assignments, built with Node.js, Express, and SQLite.

## Features

- CRUD operations for devices
- CRUD operations for users
- CRUD operations for assignments (linking devices to users)
- SQLite database with Sequelize ORM
- Simple logging middleware for request tracking

## API Endpoints

### Devices
- `GET /api/devices` - Get all devices  
- `GET /api/devices/:id` - Get a single device by ID  
- `POST /api/devices` - Create a new device  
- `PUT /api/devices/:id` - Update an existing device  
- `DELETE /api/devices/:id` - Delete a device  

### Users
- `GET /api/users` - Get all users  
- `GET /api/users/:id` - Get a single user by ID  
- `POST /api/users` - Create a new user  
- `PUT /api/users/:id` - Update an existing user  
- `DELETE /api/users/:id` - Delete a user  

### Assignments
- `GET /api/assignments` - Get all assignments  
- `GET /api/assignments/:id` - Get a single assignment by ID  
- `POST /api/assignments` - Create a new assignment  
- `PUT /api/assignments/:id` - Update an existing assignment  
- `DELETE /api/assignments/:id` - Delete an assignment  

### Utility
- `GET /` - Basic API information  

## Local Development

1. Install dependencies:
   ```bash
   npm install
