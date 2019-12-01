"use strict";

const puppeteer = require("puppeteer");
const tabletojson = require("tabletojson");
let Game = require("./models/game.js");
let GameFilter = require("./models/gameFilter");
let d = new Date();
let data_to_insert = [];
let today = new Date();
let start = Date.now();
let filter = [];
today.setDate(today.getDate() - 1);
let dateStr = today
  .toISOString()
  .slice(0, 10)
  .replace(/-/g, "");
console.log(dateStr);

run()
  .then(() => console.log("Done"))
  .catch(error => console.log(error));

async function run() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://bf.win007.com/football/hg/Over_" + dateStr + ".htm");

  await extractedEvaluateCall(page);
  await browser.close();
}

async function extractedEvaluateCall(page) {
  const body = await page.evaluate(({}) => {
    const tds = document.querySelector("#table_live").innerHTML;
    return tds;
  }, {});
  let table = "<table>" + body + "</table>";
  let length = locations("EuropeOdds", table).length;
  console.log("EuropeOdds count:" + length);
  let indices = locations("EuropeOdds", table);
  const converted = tabletojson.convert(table);
  let length2 = converted[0].length;
  console.log(length2);
  let gameData = [];
  for (let i = 1; i <= length2 - 1; i++) {
    if (converted[0][i][1] != undefined) {
      // converted[0].splice(i,1);
      gameData.push(converted[0][i]);
    }
  }
  await GameFilter.find(function(err, docs) {
    filter = docs[0].panKou;
  });
  console.log("Length after remove not related: " + gameData.length);
  for (let i = 0; i <= indices.length - 1; i++) {
    let data = {};
    data["gameId"] = table.substring(indices[i] + 11, indices[i] + 18);
    data["data"] = gameData[i];
    if (!filter.includes(data["data"]["7"])) continue;
    var game = new Game({
      gameType: data["data"]["0"],
      gameTime: data["data"]["1"],
      gameStatus: data["data"]["2"],
      gameHost: data["data"]["3"],
      score: data["data"]["4"],
      gameGuest: data["data"]["5"],
      halfScore: data["data"]["6"],
      yaPan: data["data"]["7"],
      rate: data["data"]["8"],
      gameId: data["gameId"],
      timeStamp: dateStr
    });
    data_to_insert.push(game);
  }
  Game.deleteMany({ timeStamp: dateStr }, function(err) {
    if (err) {
      console.log("Failed to delete with error: " + err);
    }
  });
  Game.insertMany(data_to_insert, function(err, res) {
    if (err) {
      console.log("Error:" + err);
    } else {
      var end = Date.now();
      console.log("用时: " + (end - start) / 1000 + "秒");
      process.exit(0);
    }
  });
}

function locations(substring, string) {
  var a = [],
    i = -1;
  while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
  return a;
}
