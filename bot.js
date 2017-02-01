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
    redirectUri: process.env.OAUTH_REDIRECT_URI,
    scopes: ['bot', 'incoming-webhook', 'commands', 'channels:read'],
  }
);

controller.setupWebserver(process.env.PORT, (err, webserver) => {
  controller.createWebhookEndpoints(controller.webserver);
  controller.webserver.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  controller.createOauthEndpoints(controller.webserver, (err, req, res) => {
    if (err) {
      res.status(500).send(`ERROR: ${err}`);
    } else {
      res.send('Success');
    }
  });

  controller.webserver.get('/links', (req, res) => {
    const teamId = req.query.teamId;

    utils.getTeamLinks(teamId, (links) => {
      res.send(links);
    });
  });
});

// just a simple way to make sure we don't
// connect to the RTM twice for the same team
const _bots = {};
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
    logger.error(`Error occurred: ${err}`);
  }

  // connect all teams with bots up to slack!
  teams.map((team) => {
    if (team.bot) {
      const bot = controller.spawn(team).startRTM((err) => {
        if (err) {
          logger.error(`Error connecting bot to Slack: ${err}`);
        } else {
          trackBot(bot);
        }
      });
    }
  });
});
