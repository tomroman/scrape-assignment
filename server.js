let express = require ("express");
let cheerio = require("cheerio");
let logger = require("morgan");
let axios = require("axios");
let mongoose = require("mongoose");
let db = require("./models");




let PORT = process.env.PORT || 3000;

let app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

let MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI);






app.get("/scrape", function (req, res) {
    axios.get("https://www.nytimes.com/section/sports").then(function (response) {
        let $ = cheerio.load(response.data);

        $("div.css-4jyr1y").each(function (i, element) {
            let result = {}
            result.url =  $(element).children("a").attr("href");
            result.headline = $(element).children("a").children("h2.css-1dq8tca").text();
            result.summary = $(element).children("a").children("p.css-1echdzn").text();
            result.photo = $(element).find("img").attr("src");

           
                db.Article.create(result)
                    .then(function (dbArticle) {
                        console.log(dbArticle);
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            
        });
        res.sendFile(path.join(__dirname, "public/index.html"));
    });
    res.send("Scrape Complete");
});

app.get("/articles", function (req, res) {
    db.Article.find({saved: false})
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
})

app.get("/saved", function ( req, res ) {
    res.sendfile("./public/saved.html");
});

app.get("/articles/saved", function (req, res) {
    db.Article.find({ saved: true }).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});

app.post("/articles/save/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: true } }, { new: true }).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});

app.post("/articles/unsave/:id", function (req, res) {
    db.Article.findOneAndUpdate({ _id: req.params.id }, { $set: { saved: false } }, { new: true }).then(function (dbArticle) {
        res.json(dbArticle);
    }).catch(function (err) {
        res.json(err);
    });
});


app.delete("/articles/clear", function (req, res) {
    db.Article.deleteMany({}, function (err) {
        console.log(err);
    });
    db.Note.deleteMany({}, function (err) {
        console.log(err);
    });
})


app.get("/articles/:id", function (req, res) {
    db.Article.find({ _id: req.params.id })
        .populate("note")
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