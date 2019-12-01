var GameFilter = require("./models/gameFilter.js");
/** * 插入 */

function insert() {
  var user = new GameFilter({
    panKou:['1','2']
  });
  user.save(function(err, res) {
    if (err) {
      console.log("Error:" + err);
    } else {
      console.log("Res:" + res);
    }
  });
}

function getGameFilters(){
  GameFilter.find(function(err, docs) {
    console.log(docs);
  });
}
getGameFilters();
