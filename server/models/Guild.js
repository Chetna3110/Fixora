const mongoose = require('mongoose');

const GuildSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Road', 'Water', 'Electricity', 'Sanitation', 'General'],
    default: 'General'
  },
  icon: { type: String, default: '🏰' },
  leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  resolvedCount: { type: Number, default: 0 },
  chat: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    userName: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
  }],
  badges: [{
    name: String,
    icon: String,
    awardedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Guild', GuildSchema);