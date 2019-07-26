$(document).ready(function () {

    // function displayArticles() {
    //     $.getJSON("/articles", function (data) {
    //         for (let i = 0; i < data.length; i++) {
    //             let artDiv = $("<div>")
    //             artDiv.attr("id", data[i]._id)
    //             artDiv.addClass("panel panel-default")

    //             let artHeading = $("<div class='panel-heading' ></div>")

    //             let artTitle = $("<h3 class='panel-title' ></h3>")

    //             let newArtTag = $("<a class='article-title'>");
    //             newArtTag.attr("target", "_blank")
    //             newArtTag.attr("href", `https://www.nytimes.com${data[i].url}`)
    //             newArtTag.text(data[i].headline)

    //             artTitle.append(newArtTag)
    //             artHeading.append(artTitle)
    //             artDiv.append(artHeading)
    //             artDiv.append(data[i].summary)
    //             if (data[i].isSaved) {
    //                 artTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-warning delete-button'>" + "Delete Article" + "</button>");
    //                 artTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-success note-button'>" + "Article Notes" + "</button>");
                    
    //             }
    //             else {
    //                 artTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-primary save-button'>" + "Save" + "</button>");
    //                 $("#articles").append(artDiv)

    //             }

    //         }

  

    //     });
    // }

    function getArticles() {
        $.getJSON("/articles").then(function (data) {
            $("#articles").empty();
            if (data && data.length) {
                showArticles(data);
            } else {
                alertEmpty();
            }
        });
    }

    function showArticles(articles) {
        for (var i = 0; i < articles.length; i++) {

            var articleCard = `<div class="card" data-id="${articles[i]._id}" ><div class="card-header"><h3><a class="article-link" target="_blank" href="${articles[i].url}">${articles[i].headline}</a></h3><h4><a class="btn btn-success save">Save Article</a><a class="btn btn-info notes">Article Notes</a></h4></div><div class="card-body"><div class='row'><div>${articles[i].summary}</div></div></div></div>`

            $("#articles").append(articleCard);
        }
    }

    function showNotes(notes, id) {

        $("#notes").empty();

        var input = "<h2 class='text-center'>Leave a Note</h2>";
        input += "<form>";
        input += "<input data-id='" + id + "' type='text' placeholder='note' class='note-input'></input>";
        input += "<button type='submit' class='submit-note'>Submit</button>";
        input += "</form>";


        $("#notes").append(input);

        for (var i = 0; i < notes.length; i++) {
            var noteCard = `<div class="card" data-id="${id}"><div class="card-body">${notes[i].text}</div></div></div>`

            $("#notes").append(noteCard);
        }
    }
    function alertEmpty() {
        var message = "<h4>Uh Oh. Looks like we don't have any new articles.</h4><div class='card-body text-center'><h4><a href='/saved' class='btn'>Go to Saved Articles</a></h4></div>";

        $("#articles").append(message);
    }

    $(document).on("click", ".note-button", function () {
        let thisId = $(this).attr("data-id");
        $.ajax({
            method: "GET",
            url: "/articles/" + thisId
        })
            .then(function (data) {
                console.log(data);

                $("#noteModalLabel").empty()
                $("#noteModalBody").empty()
                $("#noteModalLabel").append(data.headline + "<br> <textarea class='form-control' id='titleinput' rows='2' placeholder='Note Title'></textarea>")
                $("#noteModalBody").append("<textarea class='form-control' id='bodyinput' rows='6' placeholder='Note Body'></textarea>")
                $("#savenote").attr("data-id", data._id)
                if (data.note) {
                    $("#titleinput").val(data.note.title);
                    $("#bodyinput").val(data.note.body);
                }
                $("#noteModal").modal("show");
            });
    });



    $(document).on("click", "#scrape-button", function () {
        $.ajax({
            method: "GET",
            url: "/scrape"
        }).then(function (data) {
            displayArticles()
        });
    });

    $(document).on("click", ".scrape-new", function () {
        $.get("/scrape").then(function (data) {
            console.log(data);
            getArticles();
            location.reload();
        });
    });

    function getNotes(id) {
        $.get("/articles/" + id).then(function (data) {
            showNotes(data[0].note, id);
        });
    }

    $(document).on("click", ".delete-note", function () {
        $.ajax({
            method: "DELETE",
            url: "/note/delete"
        }).then(function (data) {

        });
    })
      $(".clear").on("click", function () {
        $("#articles").empty();
        alertEmpty();

        $.ajax({
            method: "DELETE",
            url: "/articles/clear"
        }).then(function (data) {

        });
    })

    getArticles();


})