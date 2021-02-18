
const db = require('./db.js').db

var config = {
  BOT_TOKEN: process.env.BOT_API,
  db: db
};

module.exports = config;
