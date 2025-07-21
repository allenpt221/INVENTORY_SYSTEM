import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { supabase } from './supabase/supa-client';

import userRoutes from './routes/auth.router';
import inventoryRoutes from './routes/inventory.router'

const app = express();
const PORT = 5000;

dotenv.config();

app.use(express.json());
app.use(cookieParser());


(async () => {
  const { data, error } = await supabase.from('authentication').select('*');
  if (error) {
    console.error('Supabase error:', error.message);
  } else {
    console.log('Supabase connected. Sample data:', data);
  }
})();


app.use('/auth', userRoutes);
app.use('/inventory', inventoryRoutes);


app.get('/', (_req, res) => {
  res.send('Hello from Express + TypeScript (backend/)');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
