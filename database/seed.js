const { sequelize, Device, User, Assignment } = require('./setup');

async function seedDatabase() {
  try {
    await sequelize.sync(); // ensure tables exist

    const users = await User.bulkCreate([
      { name: 'Alice Johnson', email: 'alice.johnson@example.com', department: 'Engineering', role: 'Engineer' },
      { name: 'Bob Martinez', email: 'bob.martinez@example.com', department: 'IT', role: 'Technician' },
      { name: 'Carol Lee', email: 'carol.lee@example.com', department: 'Administration', role: 'Manager' },
    ]);

    const devices = await Device.bulkCreate([
      { name: 'Oscilloscope A', type: 'Oscilloscope', serialNumber: 'SN-OSC-1001', status: 'available', location: 'Lab 1', purchaseDate: '2023-06-12', notes: 'Calibrated 2024-01-05' },
      { name: 'Data Logger X', type: 'Logger', serialNumber: 'SN-DL-2002', status: 'in-use', location: 'Lab 2', purchaseDate: '2022-11-03', notes: 'Requires new battery' },
      { name: 'Biopac Amp', type: 'Amplifier', serialNumber: 'SN-BA-3003', status: 'maintenance', location: 'Storage', purchaseDate: '2021-09-20', notes: 'Under maintenance' },
    ]);

    await Assignment.bulkCreate([
      { deviceId: devices[1].id, userId: users[0].id, assignedAt: '2025-11-20T09:30:00Z', returnedAt: null },
      { deviceId: devices[0].id, userId: users[2].id, assignedAt: '2025-10-05T14:00:00Z', returnedAt: '2025-10-10T16:00:00Z' },
    ]);

    console.log('Database seeded successfully');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await sequelize.close();
  }
}

seedDatabase();
