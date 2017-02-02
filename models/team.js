const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const teamSchema = new Schema({
  id: String,
  created_by: String,
  url: String,
  name: String,
  incoming_webhook: Schema.Types.Mixed,
  bot: Schema.Types.Mixed,
  token: String,
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
