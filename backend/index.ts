import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { supabase } from './supabase/supa-client';

import userRoutes from './routes/auth.router';
import inventoryRoutes from './routes/inventory.router'

const app = express();
const PORT = 5000;

dotenv.config();

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,               
}));

app.use(express.json({limit: "10mb"}));
app.use(cookieParser());


(async () => {
  try {
    const response = await supabase.auth.getSession(); 
    console.log('✅ Supabase is connected and reachable.', response);
  } catch (error: any) {
    console.error('❌ Failed to connect to Supabase:', error.message);
  }
})();



app.use('/api/auth', userRoutes);
app.use('/api/inventory', inventoryRoutes);


app.get('/', (_req, res) => {
  res.send('Hello from Express + TypeScript (backend/)');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
