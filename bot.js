require('dotenv').config();
const Botkit = require('botkit');
const mongoose = require('mongoose');

const link = require('./models/link');
const logger = require('./lib/logger')();
const utils = require('./lib/utils')

const dbUrl = process.env.MONGODB_REMOTE_URL;

mongoose.connect(dbUrl);

const controller = Botkit.slackbot({
  debug: true,
});

controller.spawn({
  token: process.env.SLACK_API_TOKEN,
}).startRTM();

const { hears } = controller;

controller.on('ambient',function(bot,message) {
  var textMessage = message.text.replace("<","").replace(">","");
  var result = utils.matchUrl(textMessage)
  logger.info(`matched==> : ${result}`);
});

hears(['hello'], 'direct_message,direct_mention,mention', (bot, message) => {
  bot.reply(message, 'YO!');
});
