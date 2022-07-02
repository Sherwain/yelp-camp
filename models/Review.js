const mongoose = require("mongoose");
const User = require("./User");

const ReviewSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: User,
  },
});

const Review = mongoose.model("Review", ReviewSchema);

module.exports = Review;
