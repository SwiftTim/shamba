# SmartSeason Field Monitoring System

SmartSeason is an intelligent field monitoring and crop tracking application designed for farm coordinators (Admins) and field agents. It streamline the monitoring process by providing real-time updates and automated health status calculations.

## 🚀 Features

- **Role-Based Access Control**: Secure JWT authentication for Admins and Field Agents.
- **Dynamic Field Tracking**: Monitor growth stages (Planted, Growing, Ready, Harvested).
- **Intelligent Status Engine**: Fields are automatically flagged as **"At Risk"** if no updates are received within 7 days.
- **Interactive Dashboards**: 
  - **Admin**: Oversight of all fields, agent assignments, and team management.
  - **Agent**: Specialized view of assigned tasks and quick update forms.
- **Team Management**: Admins can add new agents and reassign fields instantly.

## 🛠️ Technical Stack

- **Frontend**: React 18, Vite, Tailwind CSS (v4), Axios, Lucide Icons.
- **Backend**: Node.js, Express, JWT, Bcrypt.
- **Database**: PostgreSQL (Relational).

## 📊 Status Logic
The field status is a computed value based on the latest data:
- **Completed**: The crop has reached the `Harvested` stage.
- **At Risk**: The current stage is not harvested, but the last sync was more than 7 days ago, suggesting a gap in monitoring.
- **Active**: The crop is within its growing cycle and receiving regular updates.

## 🛠️ Setup Instructions

### 1. Database
Create a PostgreSQL database and run the schema:
```bash
psql -d shamba_db -f backend/migrations/init.sql
```

### 2. Configuration
Create a `.env` in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/shamba_db
JWT_SECRET=your_secure_secret
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Installation
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Run
```bash
# Start Backend
cd backend && npm run dev

# Start Frontend
cd frontend && npm run dev
```

## 🔑 Demo Credentials
- **Admin**: `admin@smartseason.com` / `admin123`
- **Agent**: `agent@smartseason.com` / `agent123`

---
*Developed as part of the Full Stack Developer Technical Assessment.*
