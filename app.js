const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { check, validationResult } = require("express-validator/check");
const flash = require("connect-flash");
const session = require("express-session");
const config = require("./config/database");
const passport = require("passport");

//Connect to mongoose
mongoose.connect(config.database);
let db = mongoose.connection;

//Check connection
db.once("open", () => {
  console.log("Connected to mongoDB");
});
//Check for DB Errors
db.on("error", err => {
  console.log(err);
});

//Init App
const app = express();

//Bring in Models
let Article = require("./models/article");

//Load view engine
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug"); //Setting it to pug

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//Set Public Folder
app.use(express.static(path.join(__dirname, "public")));

//Express Session Middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true
  })
);

//Express Messages Middleware
app.use(require("connect-flash")());
app.use(function(req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Passport Config
require("./config/passport")(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//Logout
app.get("*", (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

//
// ROUTES ROUTES ROUTES
//
//

//Home Page Route
app.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Articles",
        articles: articles
      });
    }
  });
});

//Article Route Files
let articles = require("./routes/articles");
app.use("/articles", articles);

//User Route Files
let users = require("./routes/users");
app.use("/users", users);

//Listener
app.listen(3000, function() {
  console.log("Server has started on port 3000");
});
