import mongoose from "mongoose";

const recommendationSchema = new mongoose.Schema({
  antecedents: {
    type: String,
    required: true,
  },
  consequents: {
    type: String,
    required: true,
  },
});

const Recommendation = mongoose.model("Recommendation", recommendationSchema);

export default Recommendation;
