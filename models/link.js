const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

const linkSchema = new Schema({
  urls: Array,
  text: String,
  user: String,
  channel_id: String,
  channel_name: String,
  team: String,
  timestamp: Date,
});

linkSchema.plugin(mongoosePaginate);

const Link = mongoose.model('Link', linkSchema);

module.exports = Link;
