const puppeteer = require("puppeteer");
let Game = require("./models/game.js");
let Odds = require("./models/odds");
// process.setMaxListeners(0);
require("events").EventEmitter.prototype._maxListeners = 1000;
const MAX_WAIT = 2000;
const IMAGE_QUALITY = 50;
(async () => {
  // Launch puppeteer in headless mode
  const browser = await puppeteer.launch({ headless: true });

  while (true) {
    // Get input data from DB
    console.time("batch");
    let today = new Date();
    today.setDate(today.getDate() - 1);
    let dateStr = today
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "");
    let games = await Game.find({ timeStamp: dateStr });
    if (games.length == 0) {
      break;
    }
    let promises = [];
    let data_to_insert = [];
    for (let input of games) {
      // Open a new browser page for every input
      await new Promise(resolve => setTimeout(resolve, 3000));
      let url = "http://op1.win007.com/oddslist/" + input.gameId + ".htm";
      promises.push(
        browser.newPage().then(async page => {
          try {
            await Promise.race([
              page.goto(url),
              new Promise(resolve => setTimeout(resolve, MAX_WAIT))
            ]);
            const data = await page.evaluate(() => {
              const tds = Array.from(document.querySelectorAll("tbody tr td"));
              return tds.map(td => td.innerText);
            });
            let index = data.indexOf("即时平均值");
            if (index >= 0) {
              var odds = new Odds({
                gameId: input.gameId,
                immeAvgHost: data[index + 1],
                immeAvgTie: data[index + 2],
                immeAvgGuest: data[index + 3]
              });
              await Odds.deleteOne({ gameId: input.gameId }, function(err) {
                if (err) {
                  console.log("Failed to delete with error: " + err);
                }
              });
              await odds.save(function(err, res) {
                if (err) {
                  console.log("Error:" + err);
                } else {
                  console.log("Res:" + res);
                }
              });
            }
          } catch (err) {
            console.log(err.toString());
            process.exit(0);
          }
          // Close page to free memory and save results to DB
          await page.close();
          // await output.save();
        })
      );
    }
    await Promise.all(promises);
    console.timeEnd("batch");
    process.exit(0);
  }
  await browser.close();
  console.log("Done!");
  process.exit(0);
})();
