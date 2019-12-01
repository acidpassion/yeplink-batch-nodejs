var mongoose = require('mongoose'), 

// DB_URL = 'mmongodb://crazyclass.vip:27017/yeplink'; 
DB_URL = 'mmongodb://localhost:27017/yeplink'; 

mongoose.connect(DB_URL,{ useNewUrlParser: true,useUnifiedTopology: true  }); 

mongoose.connection.on('connected', function () { 

console.log('Mongoose connection open to ' + DB_URL); }); 

mongoose.connection.on('error',function (err) { 

console.log('Mongoose connection error: ' + err); });

mongoose.connection.on('disconnected', function () { 

console.log('Mongoose connection disconnected'); }); 

module.exports = mongoose;