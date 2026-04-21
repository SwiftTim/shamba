require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('../src/config/db');

async function seed() {
    try {
        console.log('Seeding database...');

        // Clear existing data
        await db.query('TRUNCATE users, fields, field_updates CASCADE');

        const adminHash = await bcrypt.hash('admin123', 10);
        const agentHash = await bcrypt.hash('agent123', 10);

        // Create Admin
        const { rows: admins } = await db.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ('Admin User', 'admin@smartseason.com', $1, 'admin') RETURNING id",
            [adminHash]
        );

        // Create Agent
        const { rows: agents } = await db.query(
            "INSERT INTO users (name, email, password_hash, role) VALUES ('David Field', 'agent@smartseason.com', $1, 'agent') RETURNING id",
            [agentHash]
        );

        const adminId = admins[0].id;
        const agentId = agents[0].id;

        // Create Fields
        await db.query(
            `INSERT INTO fields (name, crop_type, planting_date, current_stage, assigned_agent_id, last_updated_at)
       VALUES 
       ('North Plot A', 'Wheat', '2024-03-01', 'growing', $1, NOW()),
       ('West Vineyard', 'Grapes', '2024-01-15', 'harvested', $1, NOW() - INTERVAL '10 days'),
       ('East Hill', 'Maize', '2024-04-05', 'planted', $1, NOW() - INTERVAL '8 days'),
       ('South Barn Field', 'Soybeans', '2024-02-20', 'ready', NULL, NOW())`,
            [agentId]
        );

        console.log('Seed completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    }
}

seed();
