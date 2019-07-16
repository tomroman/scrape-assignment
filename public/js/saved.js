$(document).ready(function () {

    function load() {
        $.getJSON("/articles/saved").then(function (data) {
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

            var articleCard = `<div class="card" data-id="${articles[i]._id}" ><div class="card-header"><h3><a class="article-link" target="_blank" rel="noopener noreferrer" href="${articles[i].url}">${articles[i].headline}</a></h3><h4><a class="btn btn-danger delete">Delete From Saved</a><a class="btn btn-info notes">Article Notes</a></h4></div><div class="card-body"><div class='row'><div>${articles[i].summary}</div></div></div></div>`

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
        var message = "<h4>Uh Oh. Looks like we don't have any saved articles.</h4><div class='card-body text-center'><h4><a href='/'>Browse Articles</a></h4></div>";

        $("#articles").append(message);
    }

    $(document).on("click", ".btn.delete", function () {
        var article = $(this).parents(".card").data();
        $(this).parents(".card").remove();

        $.post("/articles/unsave/" + article.id).then(function () {
            load();
        })
    });

    $(".clear").on("click", function () {
        $.ajax({
            method: "DELETE",
            url: "/articles/clear"
        }).then(function (data) {
            $("#articles").empty();
            alertEmpty();
        });
    })

    $(document).on("click", ".submit-note", function (event) {
        event.preventDefault();

        var id = $(".note-input").data().id;
        var text = $(".note-input").val();
        $(".note-input").val("")

        $.post("/articles/" + id, { text: text }).then(function (data) {
            getNotes(id);
        }).catch(function (err) {
        });
    });

    $(document).on("click", ".btn.notes", function () {
        var article = $(this).parents(".card").data();
        getNotes(article.id);
    });

    function getNotes(id) {
        $.get("/articles/" + id).then(function (data) {
            showNotes(data[0].note, id);
        });
    }

    load();
});