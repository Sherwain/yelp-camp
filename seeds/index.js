const mongoose = require("mongoose");
const CampGround = require("../models/Campground");
const cities = require("./cities");
const { descriptors, places } = require("./seed_helpers");

if (process.env.NODE_ENV != "PROD") {
  require("dotenv").config();
}

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((e) => {
    console.log("there was an issue connecting to the MongoDB database", e);
  });

function getSample(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function purgeB() {
  await CampGround.deleteMany({});
}

async function seedBD() {
  await purgeB();
  for (let i = 0; i <= 500; i++) {
    const rand = Math.floor(Math.random() * 1000);
    const camp = new CampGround({
      title: `${getSample(descriptors)} ${getSample(places)}`,
      // image: "https://images.unsplash.com/photo-1465188162913-8fb5709d6d57",
      images: [
        {
          url: "https://res.cloudinary.com/cloudie/image/upload/v1656560692/yelp-camp/sexgakg0bppbq1xbghgf.jpg",
          filename: "yelp-camp/sexgakg0bppbq1xbghgf",
        },
        {
          url: "https://res.cloudinary.com/cloudie/image/upload/v1656560692/yelp-camp/xjljhrwlrarlnyoyytip.webp",
          filename: "yelp-camp/xjljhrwlrarlnyoyytip",
        },
      ],
      price: Math.floor(Math.random() * 1000) + 100,
      description: getSample(descriptors),
      location: `${cities[rand].city}, ${cities[rand].state}`,
      geometry: {
        type: "Point",
        coordinates: [cities[rand].longitude, cities[rand].latitude],
      },
      creator: "62c0831be0924cd933f284ec",
    });
    await camp.save();
  }
}

seedBD().then(() => mongoose.connection.close());
