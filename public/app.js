$(document).ready(function () {

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

    $(document).on("click", ".btn.save", function () {
        var article = $(this).parents(".card").data();

        $(this).parents(".card").remove();

        $.post("/articles/save/" + article.id).then(function () {
        })
    });


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

    $(document).on("click", ".submit-note", function (event) {
        event.preventDefault();

        let id = $(".note-input").data().id;
        let text = $(".note-input").val();
        $(".note-input").val("")

        $.post("/articles/" + id, { text: text }).then(function (data) {
            getNotes(id);
        }).catch(function (err) {
        });
    });



    $(document).on("click", "#scrape-button", function () {
        $.ajax({
            method: "GET",
            url: "/scrape"
        }).then(function (data) {
            getArticles();
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