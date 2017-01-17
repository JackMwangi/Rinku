const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const linkSchema = new Schema({
  url: String, // the extracted URL
  text: String, // the whole message
  user: String, // the user who posted the message
  channel: String, // the channel it wacleas posted to
  timestamp: Date // the timestamp of the posting
});

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
