const config = require("../Utils/config");
const sql = require("mssql");
const colors = require("colors");
const ProgressBar = require("progress");
async function connectAndQuery() {
  try {
    // Progress bar for executingSqlConnect
    const executingSqlConnect = new ProgressBar(
      "Executing SQL Connection: [:bar] :percent :etas".green,
      {
        total: 1,
        width: 40,
      }
    );

    await sql.connect(config);

    executingSqlConnect.tick(); // Mark As the Connection is done

    //Progress Bar for Checking the store

    const storeArray = [
      "VPM",
      "VGN",
      "CYN",
      "BAN",
      "TAG",
      "SVE",
      "NAR",
      "LOG",
      "BGD",
      "BTC",
    ];

    const storeProgressBar = new ProgressBar(
      "Gettings All Stores: :current/:total :percent [:bar] :etas".green,
      {
        total: storeArray.length, // Set the total number of iterations
        width: 40, // Set the width of the progress bar
      }
    );

    for (const store of storeArray) {
      storeProgressBar.tick();
    }

    let resultArray = [];

    const gettingTheDate = new ProgressBar(
      "Getting Yesterday Date: [:bar] :percent :etas".green,
      {
        total: 1,
        width: 40,
      }
    );
    // Get the current date and subtract one day
    let currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1);

    // Format the date as YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split("T")[0];
    //console.log(`Querying for date: ${formattedDate}`);
    gettingTheDate.tick();

    // Progress bar for query execution
    const queryProgressBar = new ProgressBar(
      "Executing query: [:bar] :percent :etas".green,
      {
        total: 1, // We only have one query execution
        width: 40,
      }
    );

    const sqlQuery = `
            WITH LatestRecords AS (
                SELECT 
                    No_, [Store No_], [Posting Date], [Posted Date], 
                    [Sales Amount], [VAT Amount], [Total Discount], 
                    [Line Discount], [Discount Total Amount], [Income], [Expenses],
                    ROW_NUMBER() OVER (PARTITION BY [Store No_] ORDER BY [Posting Date] DESC) AS RowNum
                FROM 
                    [NJTC$Posted Statement$5ecfc871-5d82-43f1-9c54-59685e82318d]
                WHERE 
                    [Store No_] IN (${storeArray
                      .map((store) => `'${store}'`)
                      .join(", ")}) 
                    AND [Posting Date] = @formattedDate
            )
            SELECT *
            FROM LatestRecords
            WHERE RowNum = 1;
        `;

    const request = new sql.Request();
    request.input("formattedDate", sql.Date, formattedDate);
    const result = await request.query(sqlQuery);

    queryProgressBar.tick();

    const finalResult = result.recordset;

    // Progress bar for processing results
    const processProgressBar = new ProgressBar(
      "Processing stores: :current/:total :percent [:bar] :etas".green,
      {
        total: finalResult.length, // Set the total number of iterations
        width: 40, // Set the width of the progress bar
      }
    );

    for (const record of finalResult) {
      resultArray.push(record["Store No_"]);

      processProgressBar.tick();
    }
    // Progress bar for filtering missing posts
    const filterProgressBar = new ProgressBar(
      "Filtering stores: :current/:total :percent [:bar] :etas".green,
      {
        total: storeArray.length, // Set the total number of iterations
        width: 40, // Set the width of the progress bar
      }
    );

    const missingPost = [];
    for (const store of storeArray) {
      if (!resultArray.includes(store)) {
        missingPost.push(store);
      }
      filterProgressBar.tick(); // Update the progress bar
    }
   if(missingPost.length !== 0){
    console.table(finalResult)
    console.log()
    console.log(`Posted Count: ${finalResult.length}`.green);
    console.log(`Posted Date: ${formattedDate}`.green);
    console.log(`Missing Posted Branch/'s: ${missingPost.join(", ")}`.red);

   }else{

    console.table(finalResult)
    console.log()
    console.log(`Posted Count: ${finalResult.length}`.green);
    console.log(`Posted Date: ${formattedDate}`.green);
   }

  } catch (error) {
    console.error("Database connection failed: ", error);
  } finally {
    await sql.close();
  }
}

module.exports = connectAndQuery;
