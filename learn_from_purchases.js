import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/order.js";
import Recommendation from "./models/recommendation.js";

dotenv.config();

const MONGODB_URI = process.env.MONGO_DB_URI;
const MIN_SUPPORT = 0.01; // Minimum support threshold (1% of transactions)
const MIN_CONFIDENCE = 0.1; // Minimum confidence threshold (10%)

// --- APRIORI ALGORITHM IMPLEMENTATION ---

/**
 * Generates frequent itemsets from a list of transactions.
 * @param {string[][]} transactions - A list of transactions, where each transaction is an array of item names.
 * @param {number} minSupport - The minimum support threshold.
 * @returns {Map<string, number>} A map of frequent itemsets to their support count.
 */
function getFrequentItemsets(transactions, minSupport) {
  const numTransactions = transactions.length;
  const supportThreshold = numTransactions * minSupport;

  // 1. Get frequent individual items (C1 and L1)
  const itemCounts = new Map();
  for (const transaction of transactions) {
    for (const item of transaction) {
      itemCounts.set(item, (itemCounts.get(item) || 0) + 1);
    }
  }

  const frequentItems = new Map();
  for (const [item, count] of itemCounts.entries()) {
    if (count >= supportThreshold) {
      frequentItems.set(item, count);
    }
  }

  return frequentItems; // For this simplified version, we'll only find rules from single items.
  // A full Apriori implementation would continue to generate larger itemsets (C2, L2, C3, L3...)
}

/**
 * Generates association rules from frequent itemsets.
 * @param {string[][]} transactions - All transactions.
 * @param {Map<string, number>} frequentItems - Map of frequent items to their support.
 * @param {number} minConfidence - The minimum confidence threshold.
 * @returns {any[]} An array of recommendation rule objects.
 */
function generateAssociationRules(transactions, frequentItems, minConfidence) {
  const rules = [];
  const frequentItemKeys = Array.from(frequentItems.keys());

  for (let i = 0; i < frequentItemKeys.length; i++) {
    for (let j = 0; j < frequentItemKeys.length; j++) {
      if (i === j) continue;

      const antecedent = frequentItemKeys[i];
      const consequent = frequentItemKeys[j];

      let bothCount = 0;
      for (const transaction of transactions) {
        const transactionSet = new Set(transaction);
        if (transactionSet.has(antecedent) && transactionSet.has(consequent)) {
          bothCount++;
        }
      }

      const antecedentSupport = frequentItems.get(antecedent) || 0;
      if (antecedentSupport === 0) continue;

      const confidence = bothCount / antecedentSupport;

      if (confidence >= minConfidence) {
        rules.push({
          antecedents: antecedent,
          consequents: consequent,
          confidence: confidence,
        });
      }
    }
  }
  return rules;
}

// --- MAIN SCRIPT LOGIC ---

const learnFromPurchases = async () => {
  if (!MONGODB_URI) {
    console.error("Error: MONGO_DB_URI is not defined.");
    process.exit(1);
  }

  let connection;
  try {
    console.log("Connecting to the database...");
    connection = await mongoose.connect(MONGODB_URI, {});
    console.log("Database connected.");

    console.log("Fetching completed orders...");
    // Corrected query to be case-insensitive for 'delivered' and 'Delivered'
    const orders = await Order.find({
      $or: [{ status: "delivered" }, { status: "Delivered" }],
    });
    console.log(`Found ${orders.length} completed orders.`);

    if (orders.length === 0) {
      console.log("No completed orders to learn from. Exiting.");
      return;
    }

    const transactions = orders.map((order) =>
      order.orderedItems.map((item) => item.name)
    );

    console.log("Finding frequent purchase patterns...");
    const frequentItems = getFrequentItemsets(transactions, MIN_SUPPORT);
    console.log(`Found ${frequentItems.size} frequently purchased items.`);

    console.log("Generating new recommendation rules...");
    const newRules = generateAssociationRules(
      transactions,
      frequentItems,
      MIN_CONFIDENCE
    );
    console.log(`Generated ${newRules.length} new recommendation rules.`);

    if (newRules.length > 0) {
      console.log(
        "\n--- TEST MODE: The following new rules were found but NOT saved to the database. ---\n"
      );
      console.log(JSON.stringify(newRules, null, 2));
      console.log("\n--- TEST MODE: Your database was NOT modified. ---\n");

      // console.log('Clearing old recommendations from the database...');
      // await Recommendation.deleteMany({});
      // console.log('Old recommendations cleared.');

      // console.log('Saving new recommendations to the database...');
      // await Recommendation.insertMany(newRules.map(r => ({ antecedents: r.antecedents, consequents: r.consequents }))); // Save only the parts matching the schema
      // console.log('Successfully saved new recommendations.');
    } else {
      console.log(
        "No new rules met the minimum support and confidence thresholds. Database remains unchanged."
      );
    }
  } catch (error) {
    console.error("An error occurred during the learning process:", error);
  } finally {
    if (connection) {
      console.log("Closing database connection...");
      await mongoose.connection.close();
      console.log("Database connection closed.");
    }
  }
};

learnFromPurchases();
