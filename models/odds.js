var mongoose = require("../db/db.js");
const Schema = mongoose.Schema;

const Odds = new Schema({
  immeAvgHost: Number,
  immeAvgTie:Number,
  immeAvgGuest:Number,
  gameId: String
});

const OddsModel = mongoose.model("Odds", Odds);

module.exports = OddsModel;
