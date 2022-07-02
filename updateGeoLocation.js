const CampGround = require("./models/CampGround");
const mongoose = require("mongoose");
const app = express();

app.listen("3000", () => {
  console.log("Successully listening on port 3000");
});

mongoose
  .connect("mongodb://localhost:27017/yelp-camp")
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((e) => {
    console.log("there was an issue connecting to the MongoDB database", e);
  });

const allCampgrounds = CampGround.find({});
