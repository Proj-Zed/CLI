const colors = require("colors");
const ProgressBar = require("progress");
const data = require("../data/data");

async function checkBranch(){
    try {
        const getBranchData = new ProgressBar(
            "Gettings All Branch Data: :current/:total :percent [:bar] :etas".green,
            {
              total: data.branchIp.length, // Set the total number of iterations
              width: 40, // Set the width of the progress bar
            }
          );
            
        for(const pos of data.branchIp){
            getBranchData.tick();
        }
        console.log()
        console.table(data.branchIp);
        console.log()
    } catch (error) {
        console.log(`Something Went Wrong ${error}`.red);
    }
}

module.exports = checkBranch;