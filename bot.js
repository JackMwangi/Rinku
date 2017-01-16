require('dotenv').config();

const Botkit = require('botkit');

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
