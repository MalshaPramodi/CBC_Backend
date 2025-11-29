// import fs from "fs";
// import path from "path";
// import csv from "csv-parser";
// import { fileURLToPath } from "url";

// // Since we are using ES Modules, __dirname is not available directly.
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const getAnalyticsSummary = async (req, res) => {
//   try {
//     const monthlySales = {};
//     const productQuantities = {};
//     // Correctly resolve the path to the CSV file from the project root
//     const filePath = path.join(__dirname, "../../data/cleaned2_orders.csv");

//     fs.createReadStream(filePath)
//       .pipe(csv())
//       .on("data", (row) => {
//         try {
//           // Calculate monthly sales
//           const orderDate = new Date(row["Order Date"]);
//           if (isNaN(orderDate)) return; // Skip if date is invalid

//           const month = orderDate.toLocaleString("default", { month: "short" });
//           const salesYear = orderDate.getFullYear();
//           // Group by a more robust key like 'Jan-2023'
//           const monthYear = `${month}-${salesYear}`;

//           const orderValue = parseFloat(row["Order Value"]);
//           if (isNaN(orderValue)) return; // Skip if value is invalid

//           if (monthlySales[monthYear]) {
//             monthlySales[monthYear] += orderValue;
//           } else {
//             monthlySales[monthYear] = orderValue;
//           }

//           // Calculate product quantities
//           const cleanedItem = row["Cleaned_Item"];
//           if (cleanedItem) {
//             const qty = parseInt(row["Qty"], 10);
//             if (!isNaN(qty)) {
//               if (productQuantities[cleanedItem]) {
//                 productQuantities[cleanedItem] += qty;
//               } else {
//                 productQuantities[cleanedItem] = qty;
//               }
//             }
//           }
//         } catch (e) {
//           console.error("Error processing row:", row, e);
//         }
//       })
//       .on("end", () => {
//         // Format monthly sales for the chart, and sort them chronologically
//         const salesData = Object.keys(monthlySales)
//           .map((key) => ({
//             name: key,
//             sales: monthlySales[key],
//           }))
//           .sort((a, b) => {
//             const [aMonth, aYear] = a.name.split("-");
//             const [bMonth, bYear] = b.name.split("-");
//             const aDate = new Date(`${aMonth} 1, ${aYear}`);
//             const bDate = new Date(`${bMonth} 1, ${bYear}`);
//             return aDate - bDate;
//           });

//         // Get top 5 selling products
//         const topProducts = Object.keys(productQuantities)
//           .map((key) => ({ name: key, value: productQuantities[key] }))
//           .sort((a, b) => b.value - a.value)
//           .slice(0, 5);

//         res.json({
//           salesData,
//           topProducts,
//         });
//       });
//   } catch (error) {
//     console.error("Error getting analytics summary:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// A temporary controller to test the API endpoint with dummy data.

// import { spawn } from "child_process";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const getAnalyticsSummary = async (req, res) => {
//   const pythonExecutable = "python";

//   const pythonScriptPath = path.join(
//     __dirname,
//     "../../business_analytics/business_analytics.py"
//   );

//   console.log(
//     `Attempting to execute: ${pythonExecutable} ${pythonScriptPath} --json`
//   );

//   const pythonProcess = spawn(pythonExecutable, [pythonScriptPath, "--json"]);

//   let dataString = "";
//   let errorString = "";

//   pythonProcess.stdout.on("data", (data) => {
//     dataString += data.toString();
//   });

//   pythonProcess.stderr.on("data", (data) => {
//     errorString += data.toString();
//   });

//   // This event handles errors in the spawning of the process itself.
//   pythonProcess.on("error", (spawnError) => {
//     console.error("Failed to start Python process:", spawnError);
//     res.status(500).json({
//       message: `Failed to start Python process with command '${pythonExecutable}'. Is Python installed correctly and in your system's PATH?`,
//       error: spawnError.message,
//     });
//   });

//   pythonProcess.on("close", (code) => {
//     console.log(`Python script exited with code ${code}.`);

//     if (errorString) {
//       console.error(`Python script stderr:\n${errorString}`);
//     }

//     if (code !== 0) {
//       return res.status(500).json({
//         message:
//           "Error executing analytics script. See backend logs for details.",
//         error: errorString,
//       });
//     }

//     // If the script exits successfully but there's no data, it's an issue.
//     if (!dataString.trim()) {
//       console.error(
//         "Python script ran successfully but produced no output to stdout."
//       );
//       return res.status(500).json({
//         message: "Analytics script returned no data.",
//         error: errorString || "The script produced no output.",
//       });
//     }

//     console.log(`Raw output from Python script:\n${dataString}`);

//     try {
//       const analyticsData = JSON.parse(dataString);
//       console.log("Successfully parsed analytics data.");
//       res.json(analyticsData);
//     } catch (err) {
//       console.error("Error parsing JSON from Python script:", err);
//       res.status(500).json({
//         message:
//           "Failed to parse analytics data. The script may have produced non-JSON output.",
//         rawOutput: dataString,
//       });
//     }
//   });
// };

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAnalyticsSummary = async (req, res) => {
  const pythonExecutable = "python";
  // The directory where the python script is located.
  const scriptDir = path.join(__dirname, "../../business_analytics/");
  // The name of the script to run.
  const pythonScript = "business_analytics.py";

  console.log(
    `Executing analytics script: ${path.join(scriptDir, pythonScript)}`
  );

  // Execute the script. We set the 'cwd' (Current Working Directory) to the
  // script's own directory. This is crucial because the Python script reads/
  // writes files using relative paths (e.g., 'data/cleaned_orders.csv').
  const pythonProcess = spawn(pythonExecutable, [pythonScript], {
    cwd: scriptDir,
  });

  let jsonData = "";
  let errorData = "";

  // The script prints the final JSON to its standard output.
  pythonProcess.stdout.on("data", (data) => {
    jsonData += data.toString();
  });

  // Any errors or logs from the script will come through standard error.
  pythonProcess.stderr.on("data", (data) => {
    errorData += data.toString();
  });

  // Handle errors in starting the process itself.
  pythonProcess.on("error", (spawnError) => {
    console.error("Failed to start Python process:", spawnError);
    return res.status(500).json({
      message: `Failed to start Python process. Is '${pythonExecutable}' in your PATH?`,
      error: spawnError.message,
    });
  });

  // The script has finished.
  pythonProcess.on("close", (code) => {
    console.log(`Python script exited with code ${code}.`);

    if (errorData) {
      console.error(`Python script stderr:\n${errorData}`);
    }

    // If the script exited with an error code, it failed.
    if (code !== 0) {
      return res.status(500).json({
        message: "An error occurred during analytics processing.",
        error: errorData, // The error from the script is the most useful info.
      });
    }

    // If the script succeeded but produced no data, something is wrong.
    if (!jsonData.trim()) {
      return res.status(500).json({
        message: "Analytics script ran successfully but returned no data.",
        error: errorData || "Script produced no stdout output.", // Include stderr if available
      });
    }

    // Try to parse the JSON data we received.
    try {
      const analyticsData = JSON.parse(jsonData);
      console.log("Successfully received and parsed analytics data.");
      res.status(200).json(analyticsData);
    } catch (err) {
      console.error("Error parsing JSON from Python script:", err);
      res.status(500).json({
        message: "Failed to parse the data from the analytics script.",
        rawOutput: jsonData,
      });
    }
  });
};
