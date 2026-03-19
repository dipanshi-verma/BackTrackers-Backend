// server.js
require('dotenv').config();
const express   = require('express');
const cors      = require('cors');
const path      = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes  = require('./routes/authRoutes');
const lostRoutes  = require('./routes/lostRoutes');
const foundRoutes = require('./routes/foundRoutes');
const userRoutes  = require('./routes/userRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── DB ────────────────────────────────────────────────────────────
connectDB(process.env.MONGO_URI);

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/lost-items',  lostRoutes);
app.use('/api/found-items', foundRoutes);
app.use('/api/users',       userRoutes);   // admin only

app.get('/', (req, res) => res.send('Backend is running ✅'));

// ── Error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
