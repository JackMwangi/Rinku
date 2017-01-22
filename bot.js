require('dotenv').config();
const Botkit = require('botkit');
const utils = require('./lib/utils');
const logger = require('./lib/logger')();

const mongoStorage = require('botkit-storage-mongo')({ mongoUri: process.env.MONGODB_REMOTE_URL });

const controller = Botkit.slackbot({
  debug: false,
  storage: mongoStorage,
}).configureSlackApp(
  {
    clientId: process.env.APP_CLIENT_ID,
    clientSecret: process.env.APP_CLIENT_SECRET,
    scopes: ['bot'],
  }
);

controller.setupWebserver(3000, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver);

  controller.createOauthEndpoints(controller.webserver, (err, req, res) => {
    if (err) {
      res.status(500).send(`ERROR: ${err}`);
    } else {
      res.send('Success!');
    }
  });
});

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
var _bots = {};
function trackBot(bot) {
  _bots[bot.config.token] = bot;
}

controller.on('create_bot', (bot, config) => {
  if (_bots[bot.config.token]) {
    // already online! do nothing.
  } else {
    bot.startRTM((err) => {
      if (!err) {
        trackBot(bot);
      }

      bot.startPrivateConversation({ user: config.createdBy }, (err, convo) => {
        if (err) {
          logger.warn(`Error starting private conversation: ${err}`);
        } else {
          convo.say('I am a bot that has just joined your team');
          convo.say('You must now /invite me to a channel so that I can be of use!');
        }
      });
    });
  }
});

controller.on('ambient', (bot, message) => {
  utils.matchUrl(message);
});

controller.hears(['hello'], 'direct_message,direct_mention,mention', (bot, message) => {
  bot.reply(message, 'YO!');
});

controller.storage.teams.all((err, teams) => {
  if (err) {
    throw new Error(err);
  }

  // connect all teams with bots up to slack!
  for (const team in teams) {
    if (teams[team].bot) {
      const bot = controller.spawn(teams[team]).startRTM((err) => {
        if (err) {
          logger.warn(`Error connecting bot to Slack: ${err}`);
        } else {
          trackBot(bot);
        }
      });
    }
  }
});
