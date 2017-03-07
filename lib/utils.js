const Link = require('../models/link');
const Team = require('../models/team');
const logger = require('./logger')();
const linkify = require('linkifyjs');
const mongoose = require('mongoose');
const request = require('superagent');
const metascraper = require('metascraper');
const async = require('async');

const dbUrl = process.env.MONGODB_REMOTE_URL;

const connectionOptions = {
  server: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000,
    },
  },
  replset: {
    socketOptions: {
      keepAlive: 300000,
      connectTimeoutMS: 30000,
    },
  },
};

mongoose.connect(dbUrl, connectionOptions);

const saveToDb = (listOfLinks, message) => {
  if (listOfLinks.length) {
    const teamId = message.team;

    Team.findOne({ id: teamId }, (err, team) => {
      if (err) {
        logger.warn(`Error finding team: ${err}`);
      } else {
        const token = team.bot.token;
        const url = `https://slack.com/api/channels.list?token=${token}`;

        request
          .get(url)
          .set('Accept', 'application/json')
          .end((err, res) => {
            if (err) {
              logger.warn(`Error getting list of channels: ${err}`);
            } else {
              const listOfChannels = res.body.channels;
              let channelName = '';

              listOfChannels.map((channel) => {
                if (channel.id === message.channel) {
                  channelName = channel.name;
                }
              });

              const link = new Link({
                urls: listOfLinks,
                text: message.text.replace('<', '').replace('>', ''),
                user: message.user,
                channel_id: message.channel,
                channel_name: channelName,
                team: message.team,
                timestamp: message.ts * 1000
              });

              link.save((error) => {
                if (error) {
                  logger.warn('Saving operation failed');
                } else {
                  logger.info('Saving operation succeeded');
                }
              });
            }
          });
      }
    });
  } else {
    logger.info('The message posted had no links');
  }
};

module.exports = {
  matchUrl(message) {
    const textMessage = message.text.replace('<', '').replace('>', '');
    const listOfLinks = linkify.find(textMessage);
    function mapScrape(linkObj, done) {
      metascraper.scrapeUrl(linkObj.value).then((metadata) => {
        metadata.url = linkObj.value;
        done(null, metadata);
      });
    }
    async.map(listOfLinks, mapScrape, (err, results) => {
      saveToDb(results, message);
    });
  },

  getTeamLinks(teamId, page, limit, callback) {
    Link.paginate({ team: teamId }, { page: parseInt(page), limit: parseInt(limit) }, (err, links) => {
      callback(links);
    });
  },

  getTeamLinksByChannel(teamId, channelName, page, limit, callback) {
    Link.paginate({ team: teamId, channel_name: channelName }, { page: parseInt(page), limit: parseInt(limit)}, (error, channelLinks) => {
      callback(channelLinks);
    });
  },

  getChannelNames(teamId, callback) {
    Link.find({ team: teamId}).distinct('channel_name', function(error, channelNames) {
      return callback(channelNames);
    });
  }
};
