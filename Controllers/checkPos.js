const colors = require("colors");
const ProgressBar = require("progress");
const data = require("../data/data");

async function checkPos(){
    try {
        const getPosData = new ProgressBar(
            "Gettings All POS Data: :current/:total :percent [:bar] :etas".green,
            {
              total: data.PosIp.length, // Set the total number of iterations
              width: 40, // Set the width of the progress bar
            }
          );

        for(const pos of data.PosIp){
            getPosData.tick();
        }
        console.log()
        console.table(data.PosIp);
        console.log()
    } catch (error) {
        console.log(`Something Went Wrong ${error}`.red);
    }
}

module.exports = checkPos;