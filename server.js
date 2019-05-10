var express = require ("express");
var cheerio = require("cheerio");
var logger = require("morgan");
var axios = require("axios");
var mongoose = require("mongoose");
var db = require("./models");


var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);

app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "public/index.html"));
});




app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/sports").then(function (response) {
        var $ = cheerio.load(response.data);

        $("div.css-4jyr1y").each(function (i, element) {
            var result = {};
            result.url = $(element).children("a").attr("href");
            result.headline = $(element).children("a").children("h2.css-1dq8tca").text();
            result.summary = $(element).children("a").children("p.css-1echdzn").text();
            result.photo = $(element).find("img").attr("src");

            if (result.headline && result.url) {
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            }
        });
        res.sendFile(path.join(__dirname, "public/index.html"));
    });
});

app.get("/articles", function (req, res) {
    db.Article.find({saved: false})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.get("/saved", function ( req, res) {
    res.sendfile("./public/saved.html");
});

app.get("/articles/:id", function (req, res) {
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.put("/articles/:id", function (req, res) {
    db.Article.update({ _id: req.params.id }, { $set: { isSaved: true } })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});





app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});

// articles are coming back in the console log and they do appear when I refresh, they do not appear however when I click the scrape button.