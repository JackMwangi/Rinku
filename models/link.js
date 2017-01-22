const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const linkSchema = new Schema({
  urls: Array, // the extracted URLs
  text: String, // the whole message
  user: String, // the user who posted the message
  channel: String, // the channel it was posted to
  team: String, // the team the message was posted to
  timestamp: Date, // the timestamp of the posting
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
