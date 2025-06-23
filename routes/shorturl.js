const express = require('express');
const router = express.Router();
const { addURL, getStatsByCode } = require('../services/urlService');

// POST /shorturls
router.post('/', (req, res) => {
  const { url, validity, shortcode } = req.body;

  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  try {
    const result = addURL(url, validity, shortcode);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET/shorturls
router.get('/:code', (req, res) => {
    try {
      const stats = getStatsByCode(req.params.code);
      res.json(stats);
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  });

module.exports = router;
