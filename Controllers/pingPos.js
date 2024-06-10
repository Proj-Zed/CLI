const ping = require("ping");
const colors = require("colors");
const ProgressBar = require("progress");
const data = require("../data/data");
async function pingPos() {
  try {
    let onPOS = [];
    let offPOS = [];

    console.log("Checking all the POS".yellow);

    // Create a new progress bar instance
    const bar = new ProgressBar('Pinging IPs: :current/:total :percent [:bar] :etas'.green, {
      total: data.PosIp.length, // Set the total number of iterations
      width: 40, // Set the width of the progress bar
    });

    for (const pos of data.PosIp) {
      const result = await ping.promise.probe(pos.ip);

      if (result.alive) {
        onPOS.push({
          posNumber: pos.name,
          posIP: pos.ip,
          posBranch: pos.branch,
        });
      } else {
        offPOS.push({
          posNumber: pos.name,
          posIP: pos.ip,
          posBranch: pos.branch,
        });
      }
      //if(offPOS.length === 0) console.log("ALL POS is UP and Running!".green)
      // console.log(
      //   `Ping to ${pos.ip} was ${
      //     result.alive ? "successful".green : "unsuccessful".red
      //   }`
      // );

      // Update the progress bar
      bar.tick();
    }
    console.log("Done Checking".yellow);
    if (offPOS.length === 0) console.log("ALL POS is UP and Running!".green);
    if (offPOS.length !== 0) {
      // for (const notAlive of offPOS) {
      //   console.log("#############".yellow);
      //   console.log(`POS Number: ${notAlive.posNumber}`.red);
      //   console.log(`POS IP: ${notAlive.posIP}`.red);
      //   console.log(`POS Branch: ${notAlive.posBranch}`.red);
      // }
      console.table(offPOS)
    }
  } catch (error) {
    console.error(`Something Went Wrong.`.red, error);
  }
}
module.exports = pingPos;
