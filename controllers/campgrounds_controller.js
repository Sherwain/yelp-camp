const CampGround = require("../models/CampGround");
const AppError = require("../error/AppError");
const { cloudinary } = require("../util/cloudinary");
const { getCurrentCampground } = require("../util/helper");

async function index(req, res, next) {
  const campGrounds = await CampGround.find({});
  if (!campGrounds) throw new AppError("Campground not found", 404);
  delete req.session.campground;
  res.render("campgrounds/index", { campGrounds });
}

async function update(req, res, next) {
  const id = req.params.id;
  const { campground } = req.body;

  const campgrounOld = await getCurrentCampground(req, id);
  campground.images.push(...campgrounOld.images);
  const campGroundNew = await CampGround.findByIdAndUpdate(id, campground, {
    new: true,
    runValidators: true,
  });
  if (!campGroundNew) throw new AppError("Campground not found", 404);
  req.session.campground = campGroundNew;
  req.flash("success", "Successfully updated campground");
  res.redirect(`/campgrounds/${campGroundNew._id}`); //resource/route
}

async function edit(req, res, next) {
  const id = req.params.id;
  const campGround = await CampGround.findById(id);
  if (!campGround) throw new AppError("Campground not found", 404);
  req.session.campground = campGround;
  res.render("campgrounds/edit", { campGround });
}

function news(req, res) {
  res.render("campgrounds/new");
}

async function show(req, res, next) {
  const id = req.params.id;
  const campGround = await CampGround.findById(id)
    .populate("reviews")
    .populate({ path: "reviews", populate: { path: "owner" } })
    .populate("creator", "username");
  if (!campGround) throw new AppError("Campground not found", 404);
  req.session.campground = campGround;
  res.render("campgrounds/show", { campGround });
}

async function deletes(req, res, next) {
  const id = req.params.id;
  await CampGround.findByIdAndDelete(id);
  delete req.sesion.campground;
  req.flash("success", "Successfully deleted campground");
  res.redirect("/campgrounds");
}

async function create(req, res, next) {
  const { campground } = req.body;
  console.log(campground);
  const newCampGround = new CampGround(campground);
  newCampGround.creator = req.user;
  req.session.campground = await newCampGround.save();
  req.flash("success", "Successfully created a new campground");
  res.redirect(`/campgrounds/${newCampGround._id}`);
}

async function deleteImages(req, res, next) {
  const { id } = req.params;
  const { deleteImages = [] } = req.body;
  // await CampGround.updateOne({
  //   $pull: { images: { filename: { $in: deleteImages } } },
  // });
  const newCampground = await CampGround.findByIdAndUpdate(
    id,
    {
      $pull: { images: { filename: { $in: deleteImages } } },
    },
    {
      new: true,
      runValidators: true,
    }
  );
  for (let filename of deleteImages) cloudinary.uploader.destroy(filename);
  req.session.campground = newCampground;
  res.render("campgrounds/show", { campGround: newCampground });
}

module.exports = {
  index,
  update,
  edit,
  news,
  show,
  deletes,
  create,
  deleteImages,
};
