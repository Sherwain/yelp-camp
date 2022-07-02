const AppError = require("../error/AppError");
const CampGround = require("../models/CampGround");
const Review = require("../models/Review");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });
const {
  campGroundSchema,
  reviewSchema,
} = require("../models/validation_schema/validation_schema");

function wrapAsync(func) {
  return function (req, res, next) {
    func(req, res, next).catch((e) => next(e));
  };
}

async function validateCampGround(req, res, next) {
  req.body.campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  req.body.campground.geometry = await getGeometryData(
    req.body.campground.location
  );
  const { error } = campGroundSchema.validate(req.body);
  if (error) {
    console.log(error);
    const message = error.details.map((detail) => detail.message).join("\n");
    throw new AppError(message, 400);
  } else {
    next();
  }
}

function validateReview(req, res, next) {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const message = error.details.map((detail) => detail.message).join("\n");
    throw new AppError(message, 400);
  } else {
    next();
  }
}

function isLoggedin(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.origURL = req.originalUrl;
    req.flash("error", "You must be logged in!");
    return res.redirect("/login");
  }
  next();
}

async function isAuthor(req, res, next) {
  const campground = await CampGround.findById(req.params.id).populate(
    "creator"
  );

  if (req.user && campground.creator.equals(req.user._id)) {
    return next();
  }
  req.session.origURL = req.originalUrl;
  req.flash(
    "error",
    "You must be the owner of this camground to perform this action!"
  );
  res.redirect(`/campgrounds/${campground._id}`);
}

async function isCreaterOfReview(req, res, next) {
  const { id, review_id } = req.params;
  const review = await Review.findById(review_id);
  if (req.user && review.owner.equals(req.user._id)) {
    return next();
  }
  req.flash(
    "error",
    "You must be the owner of this review to perform this action!"
  );
  res.redirect(`/campgrounds/${id}`);
}

async function getCurrentCampground(req, id) {
  let currentCampground;
  if (req.session.campground) {
    currentCampground = req.session.campground;
    console.log(
      "Old campground retrieved from session",
      req.session.campground
    );
  } else {
    currentCampground = await CampGround.findById(id);
  }
  return currentCampground;
}

async function getGeometryData(location) {
  const geoData = await geocodingClient
    .forwardGeocode({
      query: location,
      limit: 1,
    })
    .send();
  return geoData.body.features[0].geometry;
}

module.exports = {
  wrapAsync,
  validateCampGround,
  validateReview,
  isLoggedin,
  isAuthor,
  isCreaterOfReview,
  getCurrentCampground,
  getGeometryData,
};
