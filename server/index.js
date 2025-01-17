import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import { createServer } from 'http';
import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';


// Import routes
import productRoutes from './routes/products.js';
import stageRoutes from './routes/stages.js';
import leadSourceRoutes from './routes/leadSources.js';
import userRoutes from './routes/users.js';
import leadRoutes from './routes/leads.js';
import authRoutes from './src/routes/auth.routes.js';
import customUmrahRoutes from './routes/customUmrah.js';
import invoiceRoutes from './routes/invoices.js';
import branchRoutes from './routes/branches.js';
import webhookRoutes from './routes/webhookRoutes.js';
import dashboardRoutes from './routes/dashboard.js';
import reportsRoutes from './routes/reports.js';

// Initialize dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: tempDir
}));

// Routes
app.use('/api', authRoutes);
app.use('/api', leadRoutes);
app.use('/api', productRoutes);
app.use('/api', stageRoutes);
app.use('/api', leadSourceRoutes);
app.use('/api', userRoutes);
app.use('/api', customUmrahRoutes);
app.use('/api', invoiceRoutes);
app.use('/api', branchRoutes);
app.use('/api', webhookRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

// Store io instance on app
app.io = io;

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app; 