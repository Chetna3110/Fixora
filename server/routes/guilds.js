const express = require('express');
const router = express.Router();
const Guild = require('../models/Guild');
const Issue = require('../models/Issue');
const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Helper — check & award badges
const checkBadges = async (guild) => {
  const badges = [];
  const memberCount = guild.members.length;
  const resolved = guild.resolvedCount;

  if (memberCount >= 5 && !guild.badges.find(b => b.name === 'Community Starter'))
    badges.push({ name: 'Community Starter', icon: '🌱' });
  if (memberCount >= 20 && !guild.badges.find(b => b.name === 'Growing Strong'))
    badges.push({ name: 'Growing Strong', icon: '💪' });
  if (resolved >= 10 && !guild.badges.find(b => b.name === 'Problem Solvers'))
    badges.push({ name: 'Problem Solvers', icon: '🔧' });
  if (resolved >= 50 && !guild.badges.find(b => b.name === 'City Heroes'))
    badges.push({ name: 'City Heroes', icon: '🦸' });
  if (resolved >= 100 && !guild.badges.find(b => b.name === 'Legendary Guild'))
    badges.push({ name: 'Legendary Guild', icon: '👑' });

  if (badges.length > 0) {
    guild.badges.push(...badges);
    await guild.save();
  }
};

// GET all guilds (leaderboard sorted)
router.get('/', async (req, res) => {
  try {
    const guilds = await Guild.find()
      .populate('leader', 'name email')
      .populate('members', 'name')
      .sort({ resolvedCount: -1 });
    res.json(guilds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single guild
router.get('/:id', async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id)
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate('pendingRequests', 'name email');
    if (!guild) return res.status(404).json({ message: 'Guild not found' });
    res.json(guild);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create guild
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, category, icon } = req.body;
    if (!name || !description)
      return res.status(400).json({ message: 'Name and description required' });

    const existing = await Guild.findOne({ name });
    if (existing)
      return res.status(400).json({ message: 'Guild name already taken' });

    const guild = new Guild({
      name, description, category, icon: icon || '🏰',
      leader: req.user.id,
      members: [req.user.id]
    });

    await guild.save();
    res.status(201).json(guild);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST apply to join guild
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    const isMember = guild.members.includes(req.user.id);
    const isPending = guild.pendingRequests.includes(req.user.id);
    const isLeader = guild.leader.toString() === req.user.id;

    if (isMember || isLeader)
      return res.status(400).json({ message: 'Already a member' });
    if (isPending)
      return res.status(400).json({ message: 'Already applied' });

    guild.pendingRequests.push(req.user.id);
    await guild.save();
    res.json({ message: 'Application sent! Wait for leader approval.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT approve/reject join request (leader only)
router.put('/:id/requests/:userId', auth, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (guild.leader.toString() !== req.user.id)
      return res.status(403).json({ message: 'Only leader can approve requests' });

    const { action } = req.body; // 'approve' or 'reject'
    guild.pendingRequests = guild.pendingRequests.filter(
      id => id.toString() !== req.params.userId
    );

    if (action === 'approve') {
      guild.members.push(req.params.userId);
      await checkBadges(guild);
    }

    await guild.save();
    const updated = await Guild.findById(req.params.id)
      .populate('leader', 'name email')
      .populate('members', 'name email')
      .populate('pendingRequests', 'name email');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST send chat message
router.post('/:id/chat', auth, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    const isMember = guild.members.includes(req.user.id) ||
      guild.leader.toString() === req.user.id;
    if (!isMember)
      return res.status(403).json({ message: 'Only members can chat' });

    guild.chat.push({ user: req.user.id, userName: req.user.name, text: req.body.text });
    // Keep last 100 messages only
    if (guild.chat.length > 100) guild.chat = guild.chat.slice(-100);
    await guild.save();
    res.json(guild.chat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT assign issue to guild
router.put('/:id/assign-issue/:issueId', auth, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    const isMember = guild.members.includes(req.user.id) ||
      guild.leader.toString() === req.user.id;
    if (!isMember)
      return res.status(403).json({ message: 'Only members can assign issues' });

    await Issue.findByIdAndUpdate(req.params.issueId, { assignedGuild: req.params.id, assignedGuildName: guild.name });
    res.json({ message: 'Issue assigned to guild' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE leave guild
router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const guild = await Guild.findById(req.params.id);
    if (!guild) return res.status(404).json({ message: 'Guild not found' });

    if (guild.leader.toString() === req.user.id)
      return res.status(400).json({ message: 'Leader cannot leave. Transfer leadership first.' });

    guild.members = guild.members.filter(id => id.toString() !== req.user.id);
    await guild.save();
    res.json({ message: 'Left guild successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;