const express = require('express');
const router = express.Router();
const { User } = require('../database/models');

router.get('/', async (req, res) => {
  const user = await User.findByPk(req.session.user.id);
  res.json(user);
});

router.put('/', async (req, res) => {
  const user = await User.findByPk(req.session.user.id);

  await user.update(req.body);

  res.json({ message: 'Profile updated' });
});

module.exports = router;