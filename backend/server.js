import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import clientRoutes from './routes/clients.routes.js';
import visitRoutes from './routes/visits.routes.js';
import reportRoutes from "./routes/reports.routes.js";
import userRoutes from "./routes/users.routes.js";



dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/visit', visitRoutes);
app.use("/api/reports", reportRoutes);
app.use("/reports", express.static("reports"));
app.use("/api/users", userRoutes);

app.get('/', (req, res) => res.send('✅ SkyNet API en funcionamiento'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
