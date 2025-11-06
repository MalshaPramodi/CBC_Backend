import Recommendation from "../models/recommendation.js";

// @desc    Get all recommendations
// @route   GET /api/recommendations
// @access  Public
const getRecommendations = async (req, res) => {
  try {
    const recommendations = await Recommendation.find({});
    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getRecommendations };
