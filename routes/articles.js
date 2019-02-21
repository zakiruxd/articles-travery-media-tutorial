const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");

//Bring in Models
let Article = require("../models/article");
let User = require("../models/user");

//Add Article Route
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("add-article", {
    title: "Add Article"
  });
});

// Add Submit POST Route
router.post(
  "/add",
  [
    check("title")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Title required"),
    // check("author")
    //   .isLength({ min: 1 })
    //   .trim()
    //   .withMessage("Author required"),
    check("body")
      .isLength({ min: 1 })
      .trim()
      .withMessage("Body required")
  ],
  (req, res, next) => {
    let article = new Article({
      title: req.body.title,
      author: req.body.author,
      body: req.body.body
    });

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      res.render("add-article", {
        article: article,
        errors: errors.mapped()
      });
    } else {
      article.title = req.body.title;
      article.author = req.user._id;
      article.body = req.body.body;

      article.save(err => {
        if (err) throw err;
        req.flash("success", "Article Added");
        res.redirect("/");
      });
    }
  }
);

//Get Single Article Route
router.get("/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    User.findById(article.author, (err, user) => {
      res.render("article", {
        article: article,
        author: user.name
      });
    });
  });
});

//Load Edit Form Route
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      req.flash("danger", "Not Authorized");
      return res.redirect("/");
    }
    res.render("edit-article", {
      article: article
    });
  });
});

// Update Submit POST Route
router.post("/edit/:id", (req, res) => {
  let article = {};
  article.title = req.body.title;
  // article.author = req.body.author;
  article.body = req.body.body;

  //This basically finds the right article ID
  let query = { _id: req.params.id };

  //Using the model Article already created from before in the ADD route
  // and updating it by .update. We pass in the query (the ID) and the new object
  Article.update(query, article, err => {
    if (err) {
      console.log(err);
      return;
    } else {
      req.flash("success", "Article Updated");
      res.redirect("/");
    }
  });
});

// Delete Article Route
router.delete("/:id", (req, res) => {
  if (!req.user._id) {
    res.statys(500).send();
  }

  let query = { _id: req.params.id };

  Article.findById(req.params.id, (err, article) => {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, err => {
        if (err) {
          console.log(err);
        }
        res.send("Success");
      });
    }
  });
});

//Access Control MIDDLEWARE
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash("danger", "Please log in");
    res.redirect("/users/login");
  }
}

module.exports = router;
