$(document).ready(function () {

    function displayArticles() {
        $.getJSON("/articles", function (data) {
            for (let i = 0; i < data.length; i++) {
                let artDiv = $("<div>")
                artDiv.attr("id", data[i]._id)
                artDiv.addClass("panel panel-default")

                let artHeading = $("<div class='panel-heading' ></div>")

                let artTitle = $("<h3 class='panel-title' ></h3>")

                let newArtTag = $("<a class='article-title'>");
                newArtTag.attr("target", "_blank")
                newArtTag.attr("href", `https://www.nytimes.com${data[i].url}`)
                newArtTag.text(data[i].headline)

                artTitle.append(newArtTag)
                artHeading.append(artTitle)
                artDiv.append(artHeading)
                artDiv.append(data[i].summary)
                if (data[i].isSaved) {
                    artTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-warning delete-button'>" + "Delete Article" + "</button>");
                    artTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-success note-button'>" + "Article Notes" + "</button>");
                    
                }
                else {
                    artTitle.append("<button data-id='" + data[i]._id + "' class='btn btn-primary save-button'>" + "Save" + "</button>");
                    $("#articles").append(artDiv)

                }

            }
        });
    }
    displayArticles()

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


})