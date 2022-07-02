const AppError = require("../error/AppError");
const Review = require("../models/Review");
const CampGround = require("../models/CampGround");

async function deletes(req, res, next) {
  const id = req.params.id;
  const reviewId = req.params.review_id;
  await Review.findByIdAndDelete(reviewId);
  await CampGround.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  req.flash("success", "Successfully deleted review");
  res.redirect(`/campgrounds/${id}`);
}

async function create(req, res, next) {
  const campGroundID = req.params.id;
  const campGround = await CampGround.findById(campGroundID);
  if (!campGround) throw new AppError("Campground not found", 404);
  const { review } = req.body;
  review.owner = req.user;
  const newReview = new Review(review);
  campGround.reviews.push(newReview);
  await newReview.save();
  await campGround.save();
  req.flash("success", "Successfully created new review");
  res.redirect(`/campgrounds/${campGround._id}`);
}

module.exports = { deletes, create };
