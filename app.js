const express = require('express');
const logMiddleware = require('./middleware/logMiddleware');
const shorturlRoutes = require('./routes/shorturl');
const { getURLByCode } = require('./services/urlService');

const app = express();

app.use(express.json());
app.use(logMiddleware);
app.use('/shorturls', shorturlRoutes);

app.get('/:shortcode', (req, res) => {
  try {
    const originalURL = getURLByCode(req.params.shortcode, req);
    res.redirect(originalURL);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('✅ Server running on http://localhost:3000');
});
