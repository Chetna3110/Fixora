process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.NODE_OPTIONS = '--tls-min-v1.0';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ── Routes
const authRoutes = require('./routes/auth');
const issueRoutes = require('./routes/issues');
const contactRoutes = require('./routes/contact');
const guildRoutes = require('./routes/guilds');

app.use('/api/auth', authRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/guilds', guildRoutes);

// ── MongoDB
mongoose.connect(process.env.MONGO_URI, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  tlsAllowInvalidHostnames: true,
  serverSelectionTimeoutMS: 5000,
  family: 4
})
.then(() => console.log('✅ MongoDB Connected!'))
.catch(err => console.log('❌ MongoDB Error:', err.message));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));