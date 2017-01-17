require('dotenv').config();
const Botkit = require('botkit');
const logger = require('./lib/logger')();
const utils = require('./lib/utils')

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
