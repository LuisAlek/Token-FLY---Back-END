import mongoose from 'mongoose';
import { env } from '../../../config/env';

export async function connectMongo(): Promise<void> {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 12_000,
  });
  console.log('[TokenFLY] MongoDB Atlas conectado.');
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
}
