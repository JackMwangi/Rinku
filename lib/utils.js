const Link = require('../models/link');

const logger = require('./logger')();
const linkify = require('linkifyjs');
const mongoose = require('mongoose');

const dbUrl = process.env.MONGODB_REMOTE_URL;

mongoose.connect(dbUrl);

const saveToDb = (linksObj, message) => {
  if (linksObj.length) {
    var link = new Link({
      urls: linksObj,
      text: message.text.replace("<","").replace(">",""),
      user: message.user,
      channel: message.channel,
      timestamp: message.ts
    });

    link.save( (err) => {
      if (err) {
        logger.warn(`Saving operation failed`);
      } else {
        logger.info(`Saving operation succeeded`);
      }
    });
  } else {
    logger.info(`The message posted had no links`);
  }
};

module.exports = {
  matchUrl(message) {
    var textMessage = message.text.replace("<","").replace(">","");
    var linksObj = linkify.find(textMessage);
    saveToDb(linksObj, message);
  },
};
