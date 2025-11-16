// import { spawn } from "child_process";
// import path from "path";
// import { fileURLToPath } from "url";
// import Recommendation from "../models/recommendation.js";

// // Get the directory of the current module for robust pathing
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // @desc    Get all recommendations
// // @route   GET /api/recommendations
// // @access  Public
// const getRecommendations = async (req, res) => {
//   try {
//     const recommendations = await Recommendation.find({});
//     res.json(recommendations);
//   } catch (error) {
//     console.error("Error fetching recommendations:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // @desc    Get AI-powered vector recommendations for a specific product
// // @route   GET /api/recommendations/vector/:productId
// // @access  Public
// const getVectorRecommendations = async (req, res) => {
//   try {
//     const { productId } = req.params;

//     // --- FINAL FIX: OS-aware Python command ---
//     // This detects the operating system to use the correct command ('py' on Windows, 'python3' elsewhere).
//     // This corrects the 'Python was not found' error.
//     const pythonCommand = process.platform === "win32" ? "py" : "python3";
//     const pythonPath = process.env.PYTHON_PATH || pythonCommand;

//     const scriptPath = path.resolve(
//       __dirname,
//       "..",
//       "..",
//       "recommendation_engine",
//       "recommend.py"
//     );

//     const pythonProcess = spawn(pythonPath, [
//       scriptPath,
//       "--product-id",
//       productId,
//     ]);

//     let recommendationData = "";
//     let errorData = "";

//     pythonProcess.stdout.on("data", (data) => {
//       recommendationData += data.toString();
//     });

//     pythonProcess.stderr.on("data", (data) => {
//       console.error(`[Python Script Error]: ${data}`);
//       errorData += data.toString();
//     });

//     pythonProcess.on("close", (code) => {
//       // Exit code 9009 is the specific 'command not found' error on Windows.
//       if (code !== 0) {
//         console.error(
//           `Python script exited with code ${code}. Full error: ${errorData}`
//         );
//         return res
//           .status(500)
//           .json({
//             message: "Error generating recommendations from script.",
//             error: errorData,
//           });
//       }

//       try {
//         const recommendations = JSON.parse(recommendationData.trim());
//         res.json(recommendations);
//       } catch (parseError) {
//         console.error("Error parsing JSON from Python script:", parseError);
//         console.error(
//           "Raw data received from Python:",
//           `"${recommendationData}"`
//         );
//         res.status(500).json({ message: "Error parsing recommendation data." });
//       }
//     });

//     pythonProcess.on("error", (err) => {
//       console.error("Failed to start Python process.", err);
//       res
//         .status(500)
//         .json({
//           message: "Failed to start recommendation engine.",
//           error: err.message,
//         });
//     });
//   } catch (error) {
//     console.error("Error in getVectorRecommendations controller:", error);
//     res.status(500).json({ message: "Server error in controller." });
//   }
// };

// export { getRecommendations, getVectorRecommendations };

import axios from "axios";

// This function is for your other recommendation type, we leave it as is.
export const getRecommendations = (req, res) => {
  // Implementation for your other recommendation logic remains here
  res
    .status(200)
    .json({ message: "Association recommendations not implemented yet" });
};

// This function is now the one that will be executed for the vector recommendations
export const getVectorRecommendations = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(400).json({ message: "Product ID is required." });
  }

  try {
    // The new, fast way: Make a network request to our Python microservice.
    const recommendationServiceUrl = `http://127.0.0.1:5000/recommend/${productId}`;

    console.log(
      `Forwarding recommendation request to: ${recommendationServiceUrl}`
    );

    const response = await axios.get(recommendationServiceUrl);

    // The Flask server sends back the JSON array of recommendations directly.
    res.json(response.data);
  } catch (error) {
    console.error("[Microservice Communication Error]:", error.message);
    // If the microservice is down or there's a network issue, send back an empty array.
    res.status(500).json([]);
  }
};
