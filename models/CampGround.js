const mongoose = require("mongoose");
const Review = require("./Review");
const User = require("./User");
const { required } = require("joi");

const opts = { toJSON: { virtuals: true } };

const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const CampGroundSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: [ImageSchema],
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    geometry: {
      type: {
        type: String, // Don't do `{ location: { type: String } }`
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: Review,
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: User,
    },
  },
  opts
);

CampGroundSchema.virtual("properties.popupText").get(function () {
  return `<h3>${this.title}</h3><br>$${this.price}/night<br><a href="/campgrounds/${this._id}">View this Campground</a>`;
});

CampGroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

const CampGround = mongoose.model("CampGround", CampGroundSchema);

module.exports = CampGround;
