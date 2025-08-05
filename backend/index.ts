import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';

import { supabase } from './supabase/supa-client';

import userRoutes from './routes/auth.router';
import inventoryRoutes from './routes/inventory.router';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Supabase Session Check
(async () => {
  try {
    const response = await supabase.auth.getSession();
    console.log(' Supabase is connected and reachable.', response);
  } catch (error: any) {
    console.error(' Failed to connect to Supabase:', error.message);
  }
})();

// API Routes
app.use('/api/auth', userRoutes);
app.use('/api/inventory', inventoryRoutes);



// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');

  app.use(express.static(frontendPath));

  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });
}

// Root
app.get('/', (_req: Request, res: Response) => {
  res.send('Hello from Express + TypeScript (backend/)');
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
