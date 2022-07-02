const express = require("express");
const methedOverride = require("method-override");
const path = require("path");
const { router: campgroundRoute } = require("./routes/campgrounds");
const { router: reviewRoute } = require("./routes/reviews");
const { router: userRoute } = require("./routes/users");
const mongoose = require("mongoose");
const morgan = require("morgan");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/User");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

let dbUrl;
if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
  dbUrl = process.env.LOCAL_MONGO_URL;
} else {
  dbUrl = process.env.MONGO_URL;
}

const app = express();
app.listen("3000", () => {
  console.log("Successully listening on port 3000");
});

//  .connect("mongodb://localhost:27017/yelp-camp")

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Successfully connected to MongoDB");
  })
  .catch((e) => {
    console.log("there was an issue connecting to the MongoDB database", e);
  });

const sessionConfig = {
  secret: "keyboard cat",
  store: MongoStore.create({ mongoUrl: dbUrl, touchAfter: 24 * 3600 }),
  resave: false,
  saveUninitialized: true,
  name: "sessionId",
  cookie: {
    expires: Date.now() + 1000 + 60 * 60 * 24 * 7,
    maxAge: 1000 + 60 * 60 * 24 * 7,
    httpOnly: true,
    // secure: true,
  },
};

app.use(mongoSanitize());
app.use(methedOverride("_method"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("tiny"));
app.use(express.static(path.join(__dirname, "public")));
app.set("trust proxy", 1);
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/cloudie/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.engine("ejs", ejsMate);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

//  Routes
app.use("/", userRoute);
app.use("/campgrounds", campgroundRoute);
app.use("/campgrounds/:id/reviews", reviewRoute);

app.get("/makeuser", async (req, res) => {
  const user = new User({
    email: "sherwainwilliamson@yahoo.com",
    username: "sherwain",
  });
  const newUser = await User.register(user, "lavenda");
  res.send(newUser);
});

// catchall for routes that dont match any of our routes
app.all("*", (err, req, res, next) => {
  next(new AppError("Page Not Found", 404));
});

//  Universal error handler
app.use((err, req, res, next) => {
  const defaultMessage = "Something went wrong";
  const { status = 500 } = err;
  if (!err.message) err.message = defaultMessage;
  req.flash("error", err.message);
  res.status(status).render("error/error", { err });
});
