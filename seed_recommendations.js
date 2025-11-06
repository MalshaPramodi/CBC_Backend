import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import Recommendation from "./models/recommendation.js";

// --- Configure environment variables ---
dotenv.config();

// --- Replicate __dirname functionality in ES Modules ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Define constants ---
const MONGODB_URI = process.env.MONGO_DB_URI;
const RECOMMENDATIONS_JSON_PATH = path.join(
  __dirname,
  "../cbc-frontend/public/recommendations.json"
);

const seedDatabase = async () => {
  if (!MONGODB_URI) {
    console.error(
      "Error: MONGO_DB_URI is not defined in your environment variables."
    );
    process.exit(1);
  }

  let connection;
  try {
    console.log("Connecting to database...");
    connection = await mongoose.connect(MONGODB_URI, {});
    console.log("Database connected successfully.");

    console.log(`Reading recommendations from: ${RECOMMENDATIONS_JSON_PATH}`);
    const recommendationsData = JSON.parse(
      fs.readFileSync(RECOMMENDATIONS_JSON_PATH, "utf8")
    );
    console.log(
      `Found ${recommendationsData.length} recommendations in the JSON file.`
    );

    console.log("Clearing existing recommendations from the database...");
    await Recommendation.deleteMany({});
    console.log("Existing recommendations cleared.");

    console.log("Inserting new recommendations into the database...");
    await Recommendation.insertMany(recommendationsData);
    console.log("Successfully seeded the database with new recommendations.");
  } catch (error) {
    console.error("An error occurred during the seeding process:", error);
  } finally {
    if (connection) {
      console.log("Closing database connection...");
      await mongoose.connection.close();
      console.log("Database connection closed.");
    }
  }
};

seedDatabase();
