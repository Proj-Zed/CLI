const sql = require("mssql");
const rl = require("./Utils/readLine");
const colors = require('colors')
/* Controllers */
const connectAndQuery = require("./Controllers/checkPostedStatements");
const pingPos = require("./Controllers/pingPos");
const checkPos = require("./Controllers/checkPos");
const checkBranch = require("./Controllers/checkBranch");
const HOtransactions = require('./Controllers/CheckTransactions/HO.Transaction')
const branchTransaction = require('./Controllers/CheckTransactions/BRANCH.Transaction')
const posTransactions = require('./Controllers/CheckTransactions/POS.Transaction')


/** Check Transaction */
async function  askTransactionOption()  {

  console.log();
  console.log("Choose an Option: ".yellow);
  console.log();
  console.log("1. HO".brightGreen);
  console.log("2. Branch".brightGreen);
  console.log("3. POS".brightGreen);
  console.log("4. Back".grey);
  console.log();

  rl.question("Enter your choice: ".yellow, async (answer) => {
    const option = parseInt(answer, 10);
      switch (option) {
        case 1:
          //TODO => HO Transaction Function Here
          await HOtransactions("2024-06-07")
          askTransactionOption()
          break;
        case 2:
          //TODO => Branch Transaction Function Here
          await branchTransaction("2024-06-07")
          askTransactionOption()
          break;
        case 3:
          //TODO => POS Transaction Function Here
          await posTransactions.posTransactionCount("2024-06-07")
          askTransactionOption()
          break;
        case 4:
          askOption()
          break;
        default:
          console.log("Invalid option. Please try again.".red);
          askTransactionOption()
          break;
      }
  })

}

function askOption() {
  console.log();
  console.log("Choose an option:".yellow);
  console.log();
  console.log("1. Say hello world".brightBlue);
  console.log("2. Ping IP".brightBlue);
  console.log("3. Check Posted Statements".brightBlue);
  console.log("4. Check POS Record/Data".brightBlue);
  console.log("5. Check Branch Record/Data".brightBlue);
  console.log("6. Check Transactions (Total)".brightBlue);
  console.log("7. Check Missing Transaction".brightBlue);
  console.log("0. Close program".red);
  console.log();

  rl.question("Enter your choice: ", async (answer) => {
    const option = parseInt(answer, 10);

    switch (option) {
      case 1:
        console.log("Hello, World!".green);
        askOption();
        break;
      case 2:
        await pingPos();
        askOption();
        break;
      case 3:
        await connectAndQuery();
        askOption();
        break;
      case 4:
        await checkPos();
        askOption();
        break;
      case 5:
        await checkBranch();
        askOption();
        break;
      case 6:
        askTransactionOption();
        break;
      case 0:
        rl.close();
        break;
      default:
        console.log("Invalid option. Please try again.".red);
        askOption();
        break;
    }
  });
}

askOption();

sql.on("error", (err) => {
  console.error("SQL error: ", err);
});
