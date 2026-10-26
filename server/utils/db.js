import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let isUsingMemoryStore = false;

// In-Memory store for when MongoDB is not running locally
class MemoryStore {
  constructor() {
    this.dataFile = path.join(__dirname, '..', 'data', 'local_store.json');
    this.data = {
      cases: [],
      suspects: [],
      evidence: [],
      gameSessions: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        this.data = JSON.parse(raw);
      } else {
        const dir = path.dirname(this.dataFile);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        this.save();
      }
    } catch (e) {
      console.warn('Could not read local store, starting fresh', e.message);
    }
  }

  save() {
    try {
      const dir = path.dirname(this.dataFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.dataFile, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Could not persist local store', e.message);
    }
  }
}

export const memoryStore = new MemoryStore();

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_mystery_room';
  console.log(`[DB] Attempting MongoDB connection to: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500
    });
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
    isUsingMemoryStore = false;
    return { connected: true, mode: 'mongodb' };
  } catch (error) {
    console.warn(`[DB] MongoDB not detected or connection timed out (${error.message}).`);
    console.warn(`[DB] Running in resilient embedded file/memory mode. Cases will persist to server/data/local_store.json.`);
    isUsingMemoryStore = true;
    return { connected: false, mode: 'memory' };
  }
}

export function isMemoryMode() {
  return isUsingMemoryStore;
}
