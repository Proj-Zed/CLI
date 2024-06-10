require("dotenv").config();
const sql = require("mssql");
const ProgressBar = require("progress");
const colors = require("colors");
const data = require("../../data/data");
const ping = require("ping");

//To Check the ip if its alive
async function pingPOS(ip) {
  try {
    //console.log(ip)
    const result = await ping.promise.probe(ip);
    if (result.alive) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error.toString().red);
    return false;
  }
}

exports.posTransaction = async (server, databaseName, date) => {
  try {
    const config = {
      user: process.env.DB_POS_USER,
      password: process.env.DB_POS_PASSWORD,
      server: server,
      database: databaseName,
      options: {
        encrypt: false,
      },
    };

    await sql.connect(config);

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

    request.input("Date", sql.Date, date);

    const result = await request.query(query);

    await sql.close();

    return result.recordset.length;
  } catch (error) {
    console.log(error.toString().red);
    await sql.close();
    return 0;
  }
};

exports.posTransactionCount = async (date) => {
  const allPos = data.PosIp;

  let banCount = 0;
  let vpmCount = 0;
  let sveCount = 0;
  let narCount = 0;
  let btcCount = 0;
  let logCount = 0;
  let vgnCount = 0;
  let cynCount = 0;
  let bgdCount = 0;
  let tagCount = 0;

  let posOffline = [];
  let output = [];
  const processProgressBar = new ProgressBar(
    "Processing POS: :current/:total :percent [:bar] :etas".green,
    {
      total: allPos.length, // Set the total number of iterations
      width: 40, // Set the width of the progress bar
    }
  );
  for (const pos of allPos) {
    if (pingPOS(pos.ip) === false) {
      //TODO => Push the offline pos into posOffline array {IP: , Branch: }
      //If pos is offline
      console.log(pos.ip);
    } else {
      //TODO => if the POS is online check the transactions then add to the count
      if (pos.branch === "BAN") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        banCount += result;
      } else if (pos.branch === "VPM") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        vpmCount += result;
      } else if (pos.branch === "SVE") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        sveCount += result;
      } else if (pos.branch === "BTC") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        btcCount += result;
      } else if (pos.branch === "LOG") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        logCount += result;
      } else if (pos.branch === "VGN") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        vgnCount += result;
      } else if (pos.branch === "CYN") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        cynCount += result;
      } else if (pos.branch === "BGD") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        bgdCount += result;
      } else if (pos.branch === "TAG") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        tagCount += result;
      } else if (pos.branch === "NAR") {
        const result = await this.posTransaction(
          pos.ip,
          pos.databaseName,
          date
        );
        narCount += result;
      } else {
        console.log("ERROR DETECTING BRANCH".red);
      }
    }
    processProgressBar.tick();
  }
  output.push(
    {
      BranchName: "BAN",
      TransactionCount: banCount,
    },
    {
      BranchName: "VPM",
      TransactionCount: vpmCount,
    },
    {
      BranchName: "SVE",
      TransactionCount: sveCount,
    },
    {
      BranchName: "NAR",
      TransactionCount: narCount,
    },
    {
      BranchName: "BTC",
      TransactionCount: btcCount,
    },
    {
      BranchName: "LOG",
      TransactionCount: logCount,
    },
    {
      BranchName: "VGN",
      TransactionCount: vgnCount,
    },
    {
      BranchName: "CYN",
      TransactionCount: cynCount,
    },
    {
      BranchName: "BGD",
      TransactionCount: bgdCount,
    },
    {
      BranchName: "TAG",
      TransactionCount: tagCount,
    }
  );

  const overAllTotalCount =
    banCount +
    vpmCount +
    sveCount +
    narCount +
    btcCount +
    logCount +
    vgnCount +
    cynCount +
    bgdCount +
    tagCount;

  if (posOffline.length !== 0) {
    console.log("List of pos Offline");
    console.table(posOffline);
    console.table(output);
  } else {
    console.table(output);
    console.log("Total Transaction Count in all POS: " + overAllTotalCount.toString().yellow)
  }
};
