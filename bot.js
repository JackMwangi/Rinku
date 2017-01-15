if (!process.env.token) {
  process.exit(1);
}

const Botkit = require('botkit');

const controller = Botkit.slackbot({
  debug: true,
});

controller.spawn({
  token: process.env.token,
}).startRTM();

// here starts the action ---

const { hears } = controller;

hears(['hello'], 'direct_message,direct_mention,mention', (bot, message) => {
  bot.reply(message, 'YO!');
});
