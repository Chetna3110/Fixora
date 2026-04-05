const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

const IssueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Road', 'Water', 'Electricity', 'Sanitation', 'Other'],
    required: true
  },
  imageUrl: { type: String },
  location: { lat: Number, lng: Number, address: String },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },

  assignedGuild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild', default: null },
assignedGuildName: { type: String, default: '' },
  resolutionNote: { type: String, default: '' },

  assignedWorker: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
assignedWorkerName: { type: String, default: '' },
progressNote: { type: String, default: '' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Issue', IssueSchema);