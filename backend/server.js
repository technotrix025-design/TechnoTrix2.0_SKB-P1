import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Route Imports
import emissionsRoutes from './routes/emissions.js';
import aiRoutes from './routes/ai.js';
import suppliersRoutes from './routes/suppliers.js';
import streamRoutes from './routes/stream.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/emissions', emissionsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/stream', streamRoutes);

app.get('/', (req, res) => {
  res.send('ESG Hackathon API is running with Supabase');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server Error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
