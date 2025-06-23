const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const filePath = path.join(__dirname, '../storage/urls.json');
let urls = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
const saveURLs = () => {
  fs.writeFileSync(filePath, JSON.stringify(urls, null, 2));
};
// Generate a 6-character unique code
const generateShortcode = () => uuidv4().slice(0, 6);
function addURL(originalURL, validity, customCode = null) {
  const now = new Date();
  const expiry = new Date(now.getTime() + (validity || 30) * 60000); // default = 30 minutes
  let shortcode = customCode || generateShortcode();
  if (customCode && urls.some(entry => entry.shortcode === customCode)) {
    throw new Error('Custom shortcode already in use');
  }
  // Keep generating until a unique random code is found
  while (!customCode && urls.some(entry => entry.shortcode === shortcode)) {
    shortcode = generateShortcode();
  }

  const newEntry = {
    shortcode,
    originalURL,
    createdAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    clicks: 0,
    clickData: []
  };

  urls.push(newEntry);
  saveURLs();

  return {
    shortLink: `http://localhost:3000/${shortcode}`,
    expiry: newEntry.expiresAt
  };
}

function getURLByCode(code, req) {
  // Reload fresh data
  urls = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];

  const entry = urls.find(e => e.shortcode === code);
  if (!entry) throw new Error('Shortcode not found');

  const now = new Date();
  if (new Date(entry.expiresAt) < now) {
    throw new Error('Short URL expired');
  }

  // Track click
  entry.clicks += 1;
  entry.clickData.push({
    timestamp: now.toISOString(),
    source: req.get('referer') || 'direct',
    location: 'India' // Hardcoded for now
  });

  // Save updated list
  fs.writeFileSync(filePath, JSON.stringify(urls, null, 2));
  return entry.originalURL;
}

function getStatsByCode(code) {
  urls = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];

  const entry = urls.find(e => e.shortcode === code);
  if (!entry) throw new Error('Shortcode not found');

  return {
    shortcode: entry.shortcode,
    originalURL: entry.originalURL,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt,
    clicks: entry.clicks,
    clickHistory: entry.clickData
  };
}

module.exports = {
  addURL,
  getURLByCode,
  getStatsByCode 
};
