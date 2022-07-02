const express = require("express");
const multer = require("multer");
const router = express.Router();
const { storage } = require("../util/cloudinary");
const upload = multer({ storage });
const campgroundsController = require("../controllers/campgrounds_controller");
const {
  wrapAsync,
  validateCampGround,
  isLoggedin,
  isAuthor,
} = require("../util/helper");
const {
  campGroundSchema,
} = require("../models/validation_schema/validation_schema");

// Update campground endpoint
router.put(
  "/:id",
  isLoggedin,
  isAuthor,
  upload.array("images", 8),
  validateCampGround,
  wrapAsync(campgroundsController.update)
);

// endpoint to display form to edit Campground
router.get("/:id/edit", wrapAsync(campgroundsController.edit));

// Displays the form to create a new CampGround
router.get("/new", isLoggedin, campgroundsController.news);

// Display the deatils of Campground
router.get("/:id", wrapAsync(campgroundsController.show));

// Delete Campground Endpoint
router.delete(
  "/:id",
  isLoggedin,
  isAuthor,
  wrapAsync(campgroundsController.deletes)
);

//delete images
router.delete(
  "/:id/images/delete",
  isLoggedin,
  isAuthor,
  wrapAsync(campgroundsController.deleteImages)
);

//Dispplay all campgrounds endpoint
router.get("/", wrapAsync(campgroundsController.index));

// create campground endpoint
router.post(
  "/",
  isLoggedin,
  upload.array("images", 8),
  validateCampGround,
  wrapAsync(campgroundsController.create)
);

module.exports = { router };
