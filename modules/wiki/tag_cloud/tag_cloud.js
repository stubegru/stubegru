//TagCloud Laden
function updateTagCloud() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/wiki/tag_cloud/wiki_get_tags.php`,
        success: function (tagList) {
            $("#tagCloud").html("");
            for (const tag of tagList){
                let html = `<a type='button' class='btn btn-default btn-sm tagCloud' href='${stubegru.constants.BASE_URL}?view=wiki_show_tag&tagId=${tag.id}'>${tag.name}</a>`;
                $("#tagCloud").append(html);
            }
        }
    });
}

updateTagCloud();