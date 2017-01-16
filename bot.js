require('dotenv').config();

const Botkit = require('botkit');
const mongoose = require('mongoose');

const link = require('./models/link');
const dbUrl = process.env.MONGODB_REMOTE_URL;

// DB Connection
mongoose.connect(dbUrl);

const controller = Botkit.slackbot({
  debug: true,
});

controller.spawn({
  token: process.env.SLACK_API_TOKEN,
}).startRTM();

const { hears } = controller;

hears(['hello'], 'direct_message,direct_mention,mention', (bot, message) => {
  bot.reply(message, 'YO!');
});
