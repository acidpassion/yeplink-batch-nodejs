var mongoose = require('../db/db.js');
const Schema = mongoose.Schema;
 
const Game = new Schema({
  gameType: String,
  gameTime: String,
  gameStatus: String,
  gameHost:String,
  score:String,
  gameGuest:String,
  halfScore:String,
  yaPan:String,
  rate:String,
  gameId:String,
  timeStamp:String
});

const GameModel = mongoose.model('Game', Game);

module.exports = GameModel;