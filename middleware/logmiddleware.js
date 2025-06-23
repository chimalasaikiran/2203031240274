const fs = require('fs');
const path = require('path');

const logStream = fs.createWriteStream(path.join(__dirname, '../logs.txt'), { flags: 'a' });

const logMiddleware = (req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url} from ${req.headers['user-agent']}\n`;
  logStream.write(logEntry);
  next();
};

module.exports = logMiddleware;
