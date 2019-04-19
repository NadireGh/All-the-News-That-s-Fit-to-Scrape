var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// Routes

app.get("/scrape", function(req, res) {
    request("https://news.google.com/", function(error, response, html) {
      var $ = cheerio.load(html);
      $("h2.esc-lead-article-title").each(function(i, element) {
        var result = {};
        result.title = $(this).children("a").children("span").text();
        result.link = $(this).children("a").attr("href");
        var entry = new Article(result);
        entry.save(function(err, doc) {
          {unique: true}
          if (err) {
            console.log(err);
          }
          else {
            console.log(doc);
          }
        });
  
      });
    });
    res.redirect("/");
  });
  
  app.get("/articles", function(req, res) {
    Article.find({}, function(error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        res.json(doc);
      }
    });
  });
  
  app.get("/articles/:id", function(req, res) {
    Article.findOne({ "_id": req.params.id })
    .populate("note")
    .exec(function(error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        res.json(doc);
      }
    });
  });
  
  
  app.post("/articles/:id", function(req, res) {
    var newNote = new Note(req.body);
  
    newNote.save(function(error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
        .exec(function(err, doc) {
          if (err) {
            console.log(err);
          }
          else {
            res.send(doc);
          }
        });
      }
    });
  });
  //delete is not working
  app.delete("/delete/:id", function (req, res) {
    var id = req.params.id.toString();
    Note.remove({
      "_id": id
    }).exec(function (error, doc) {
      if (error) {
        console.log(error);
      }
      else {
        console.log("note deleted");
        res.redirect("/" );
      }
    });
  });
  
  app.listen(PORT, function() {
    console.log("App running on port 3000!");
  });