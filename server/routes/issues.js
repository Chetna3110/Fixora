const express = require('express');
const router = express.Router();
const Issue = require('../models/Issue');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;
  if (!token) return res.status(401).json({ message: 'No token, access denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// CREATE an issue
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, category, imageUrl, location } = req.body;
    const issue = new Issue({
      title,
      description,
      category,
      imageUrl,
      location,
      reportedBy: req.user.id
    });
    await issue.save();
    res.status(201).json({ message: 'Issue reported successfully', issue });
  } catch (err) {
    console.log('ISSUE ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET all issues
router.get('/', async (req, res) => {
  try {
    const issues = await Issue.find()
      .populate('reportedBy', 'name email')
      .populate('assignedWorker', 'name email')
      .populate('resolvedBy', 'name');
    res.json(issues);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPVOTE — one upvote per user per issue
router.put('/:id/upvote', authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const userId = req.user.id;
    const alreadyUpvoted = issue.upvotedBy.includes(userId);

    if (alreadyUpvoted)
      return res.status(400).json({ message: 'You have already upvoted this issue' });

    issue.upvotedBy.push(userId);
    issue.upvotes = issue.upvotedBy.length;
    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE issue status — role based
router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reportedBy', 'name email')
      .populate('assignedWorker', 'name');

    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    const { status, resolutionNote, progressNote } = req.body;
    const role = req.user.role;

    // ── ADMIN: full access
    if (role === 'admin') {
      const updateData = { status };
      if (resolutionNote !== undefined) updateData.resolutionNote = resolutionNote;
      if (progressNote !== undefined) updateData.progressNote = progressNote;
      if (status === 'Resolved') {
        updateData.resolvedBy = req.user.id;
        updateData.resolvedAt = new Date();
      }
      const updated = await Issue.findByIdAndUpdate(req.params.id, updateData, { new: true })
        .populate('reportedBy', 'name email')
        .populate('assignedWorker', 'name')
        .populate('resolvedBy', 'name');
      return res.json(updated);
    }

    // ── WORKER: can only update assigned issues to "In Progress"
    if (role === 'worker') {
      const isAssigned =
        issue.assignedWorker?._id?.toString() === req.user.id ||
        issue.assignedWorker?.toString() === req.user.id;

      if (!isAssigned)
        return res.status(403).json({ message: 'You are not assigned to this issue' });

      if (status === 'Resolved')
        return res.status(403).json({ message: 'Workers cannot resolve issues. Only admin can.' });

      if (status && status !== 'In Progress')
        return res.status(403).json({ message: 'Workers can only set status to In Progress' });

      const updateData = {};
      if (status) updateData.status = status;
      if (progressNote !== undefined) updateData.progressNote = progressNote;

      const updated = await Issue.findByIdAndUpdate(req.params.id, updateData, { new: true })
        .populate('reportedBy', 'name email')
        .populate('assignedWorker', 'name');
      return res.json(updated);
    }

    // ── USER: no status update access
    return res.status(403).json({ message: 'Access denied' });

  } catch (err) {
    console.log('STATUS ERROR:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ASSIGN worker to issue — admin only
router.put('/:id/assign-worker', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Only admin can assign workers' });

    const { workerId, workerName } = req.body;

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { assignedWorker: workerId, assignedWorkerName: workerName },
      { new: true }
    ).populate('reportedBy', 'name email')
     .populate('assignedWorker', 'name');

    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ADD comment to an issue
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text required' });

    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ message: 'Issue not found' });

    issue.comments.push({
      user: req.user.id,
      userName: req.user.name,
      text
    });

    await issue.save();
    res.json(issue);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;