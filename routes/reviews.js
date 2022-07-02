const express = require("express");
const router = express.Router({ mergeParams: true });
const reviewsController = require("../controllers/reviews_controller");
const {
  wrapAsync,
  validateReview,
  isLoggedin,
  isCreaterOfReview,
} = require("../util/helper");

// delete review for a campground
router.delete(
  "/:review_id",
  isLoggedin,
  isCreaterOfReview,
  wrapAsync(reviewsController.deletes)
);

//create review for campground endpoint
router.post(
  "/",
  isLoggedin,
  validateReview,
  wrapAsync(reviewsController.create)
);

module.exports = { router };
