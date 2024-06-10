require("dotenv").config();
const sql = require("mssql");
const ProgressBar = require("progress");
const colors = require("colors");
const data = require("../../data/data");
const ping = require("ping");
async function branchTransaction(user, password, server, databaseName, date) {
  try {
    //TODO => Check ping first if !active return 0

    const bar = new ProgressBar(
      "Pinging IPs: :current/:total :percent [:bar] :etas".green,
      {
        total: 1, // Set the total number of iterations
        width: 40, // Set the width of the progress bar
      }
    );

    const checkPing = await ping.promise.probe(server);

    if (checkPing.alive) {
      //
      const config = {
        user: user,
        password: password,
        server: server,
        database: databaseName,
        options: {
          encrypt: false,
          //trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === "true",
        },
      };

      await sql.connect(config);

      //set the query
      const query = `SELECT 
    TransSalesEntry.[Line No_] AS LINE_NO, 
    TransSalesEntry.[Transaction No_] AS TRANSACTION_NO, 
    TransSalesEntry.[Trans_ Time] AS TRANS_TIME,
    TransSalesEntry.[Store No_] AS STORE, 
    TransSalesEntry.[POS Terminal No_] AS POS_NO, 
    TransSalesEntry.[Item No_] AS ITEM_CODE, 
    TransSalesEntry.[Receipt No_] AS RECEIPT_NO
FROM
    [NJTC$Trans_ Sales Entry$5ecfc871-5d82-43f1-9c54-59685e82318d] as TransSalesEntry
    LEFT JOIN [NJTC$Trans_ Sales Entry$32023a8f-d02e-4177-9139-cd4fee3464b6] as TransSalesEntryTwo
    ON TransSalesEntry.[Store No_] = TransSalesEntryTwo.[Store No_] 
    AND TransSalesEntry.[POS Terminal No_] = TransSalesEntryTwo.[POS Terminal No_]
    AND TransSalesEntry.[Transaction No_] = TransSalesEntryTwo.[Transaction No_]
    LEFT JOIN [NJTC$Transaction Header$5ecfc871-5d82-43f1-9c54-59685e82318d] TransactionHeader
    ON TransSalesEntry.[Store No_] = TransactionHeader.[Store No_]
    AND TransSalesEntry.[POS Terminal No_] = TransactionHeader.[POS Terminal No_]
    AND TransSalesEntry.[Transaction No_] = TransactionHeader.[Transaction No_]
    LEFT JOIN [NJTC$Transaction Header$32023a8f-d02e-4177-9139-cd4fee3464b6] TransactionHeaderTwo
    ON TransSalesEntry.[Store No_] = TransactionHeaderTwo.[Store No_]
    AND TransSalesEntry.[POS Terminal No_] = TransactionHeaderTwo.[POS Terminal No_]
    AND TransSalesEntry.[Transaction No_] = TransactionHeaderTwo.[Transaction No_]
    LEFT JOIN [NJTC$Trans_ Payment Entry$5ecfc871-5d82-43f1-9c54-59685e82318d] as TransPayment
    ON TransSalesEntry.[Store No_] = TransPayment.[Store No_] 
    AND TransSalesEntry.[POS Terminal No_] = TransPayment.[POS Terminal No_]
    AND TransSalesEntry.[Transaction No_] = TransPayment.[Transaction No_]
    LEFT JOIN [NJTC$Trans_ Payment Entry$32023a8f-d02e-4177-9139-cd4fee3464b6] as TransPaymentTwo
    ON TransSalesEntry.[Store No_] = TransPaymentTwo.[Store No_] 
    AND TransSalesEntry.[POS Terminal No_] = TransPaymentTwo.[POS Terminal No_]
    AND TransSalesEntry.[Transaction No_] = TransPaymentTwo.[Transaction No_]
    LEFT JOIN [NJTC$Trans_ Sales Entry Status$5ecfc871-5d82-43f1-9c54-59685e82318d] AS TransSalesEntryStatus
    ON TransSalesEntry.[Store No_] = TransSalesEntryStatus.[Store No_] 
    AND TransSalesEntry.[POS Terminal No_] = TransSalesEntryStatus.[POS Terminal No_]
    AND TransSalesEntry.[Transaction No_] = TransSalesEntryStatus.[Transaction No_]
    AND TransSalesEntry.[Line No_] = TransSalesEntryStatus.[Line No_]
WHERE
    TransSalesEntry.[Date] = @Date
GROUP BY
   TransSalesEntry.[Line No_],
   TransSalesEntry.[Transaction No_],
   TransSalesEntry.[Trans_ Time],
   TransSalesEntry.[Store No_],
   TransSalesEntry.[POS Terminal No_],
   TransSalesEntry.[Item No_],
   TransSalesEntry.[Receipt No_]
ORDER BY
TRANS_TIME`;

      const request = new sql.Request();
      //request.input("Store", sql.NVarChar, store);
      request.input("Date", sql.Date, date);
      const result = await request.query(query);

      await sql.close();
      return result.recordset.length;
      
    } else {
      await sql.close();
      return 0;
    }
  } catch (error) {
    console.log("Something Went Wrong" + error);
    await sql.close();
    return 0;
  }
}

async function countAllTransactionInBranches(date) {
  try {
    const formatter = new Intl.NumberFormat("en-US");
    // Progress bar for processing results
    const processProgressBar = new ProgressBar(
      "Processing Branches: :current/:total :percent [:bar] :etas".green,
      {
        total: data.branchIp.length, // Set the total number of iterations
        width: 40, // Set the width of the progress bar
      }
    );

    let count = 0;
    let branchArr = [];
    for (const branch of data.branchIp) {
      const resultCount = await branchTransaction(
        branch.user,
        branch.password,
        branch.ip,
        branch.databaseName,
        date
      );

      count += resultCount;
      branchArr.push({
        Branch: branch.branch,
        TransactionCount: resultCount,
      });
      processProgressBar.tick();
    }
    console.table(branchArr);
    console.log(
      "Total Transaction Count of all Branches: " +
        formatter.format(count).toString().yellow
    );
  } catch (error) {
    console.log("\n" + error.toString().red);
  }
}

module.exports = countAllTransactionInBranches;
