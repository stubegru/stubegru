export default class DailyNewsService{


    // delete(dailyNewsId) {
    //     deleteConfirm("Nachricht löschen", "Soll die Nachricht wirklich gelöscht werden?", function () {
    //         $.ajax({
    //             type: "POST",
    //             dataType: "json",
    //             url: `${stubegru.constants.BASE_URL}/modules/daily_news/delete_message.php`,
    //             data: {
    //                 id: dailyNewsId
    //             },
    //             success: function (data) {
    //                 stubegru.modules.alerts.alert({
    //                     text: data.message,
    //                     type: data.status,
    //                 });
    //                 getMessages();
    //             }
    //         });
    //     });
    // }
    
    // moveToWiki(id) { //Nachricht löschen
    //     deleteConfirm("In Wiki Artikel umwandeln?", "Soll diese Tagesaktuelle Info wirklich in einen Wiki Artikel umgewandelt werden? Die Tagesaktuelle Info wird dadurch gelöscht.", function () {
    //         $.ajax({
    //             type: "POST",
    //             dataType: "json",
    //             url: `${stubegru.constants.BASE_URL}/modules/daily_news/move_to_wiki.php`,
    //             data: {
    //                 id: id
    //             },
    //             success: function (data) {
    //                 setTimeout(() => { //use short timeout to let the deleteConfirm alert close before showing the new alert
    //                     if (data.status == "success") {
    //                         data.message += `<br> <a href="${stubegru.constants.BASE_URL}?view=wiki_show_article&artikel=${data.articleId}">Zum neuen Wiki Artikel</a>`;
    //                     }
    
    //                     stubegru.modules.alerts.alert({
    //                         title: "Umwandlung in Wiki Artikel",
    //                         type: data.status,
    //                         text: data.message,
    //                         html: true,
    //                         mode: "alert"
    //                     });
    
    //                     if (data.status == "success") { getMessages(); }
    //                 }, 500);
    //             },
    //             error: function (data) {
    //                 data = data.responseJSON;
    //                 setTimeout(() => {
    //                     stubegru.modules.alerts.alert({
    //                         type: data.status,
    //                         text: data.message,
    //                     });
    //                 }, 500);
    //             }
    //         });
    //     });
    // }

    // getMessages() { //Nachrichten aus der DB anzeigen
    //     $.ajax({
    //         type: "POST",
    //         dataType: "json",
    //         url: `${stubegru.constants.BASE_URL}/modules/daily_news/get_messages.php`,
    //         success: async function (data) {
    //             $("#message_container").html("");
    //             for (let currentMessage of data) {
    //                 let priorityClass = currentMessage.prioritaet == 1 ? "panel-danger" : "panel-default";
    //                 let container = new Date(currentMessage.beginn).getTime() > new Date().getTime() ? "#future_message_container" : "#message_container";
    //                 let currentEnd = formatDate(currentMessage.ende, "DD.MM.YYYY");
    //                 const text = await stubegru.modules.wiki.wikiUtils.handleWikiWords(currentMessage.inhalt);
    
    //                 $(container).append(`
    //                 <div class="panel ${priorityClass}">
    //                     <div class="panel-heading">
    //                         <h4 class="panel-title">
    //                             <a  href="#collapseMessage${currentMessage.id}" data-toggle="collapse">
    //                                 ${currentMessage.titel}
    //                             </a>
    //                         </h4>
    //                     </div>
    //                     <div id="collapseMessage${currentMessage.id}" class="panel-collapse collapse" aria-expanded="false">
    //                           <div class="panel-body">
    //                             <p>${text}</p>
    //                             <hr>
    //                             <span class="pull-right">
    //                                 <button class="btn btn-default permission-MOVE_TO_WIKI permission-required" onclick="moveToWiki(${currentMessage.id})">
    //                                     <i class="fas fa-share-square"></i>&nbsp; Ins Wiki schieben
    //                                 </button>
    //                                 <button class="btn btn-primary permission-DAILY_NEWS_WRITE permission-required" onclick="showMessageModal(${currentMessage.id})">
    //                                     <i class="fas fa-pencil-alt"></i>&nbsp; Bearbeiten
    //                                 </button>
    //                                 <button class="btn btn-danger permission-DAILY_NEWS_WRITE permission-required" onclick="deleteMessage(${currentMessage.id})">
    //                                     <i class="fas fa-times"></i>&nbsp; Löschen
    //                                 </button>
    //                             </span>
    //                         </div>
    //                         <div class="panel-footer">
    //                             Wird angezeigt bis: ${currentEnd} 
    //                             <span class="pull-right">
    //                                 Zuletzt geändert: ${currentMessage.erfassungsdatum}
    //                             </span>
    //                         </div>
    //                     </div>
    //                 </div>`);
    //             }
    //             stubegru.modules.userUtils.updateAdminElements();
    //         }
    //     });
    // }
    // sendMessage() { //wird aufgerufen über form-action
    //     $.ajax({
    //         type: "POST",
    //         dataType: "json",
    //         url: `${stubegru.constants.BASE_URL}/modules/daily_news/save_message.php`,
    //         data: {
    //             title: $('#nachricht_titel').val(),
    //             text: CKEDITOR.instances.dailyNewsEditor.getData(),
    //             start: $('#beginn_nachricht').val(),
    //             end: $('#ende_nachricht').val(),
    //             priority: $('#nachricht_prioritaet').prop("checked"),
    //             id: $('#nachricht_id').val()
    //         },
    //         success: function (data) {
    //             stubegru.modules.alerts.alert({
    //                 title: "Tagesaktuelle Info",
    //                 text: data.message,
    //                 type: data.status
    //             });
    //             getMessages(); //Nachrichten aus DB anzeigen
    //             $("#meditor").modal('hide'); //Modal ausblenden
    //             resetMessageForm();
    //         }
    //     });
    // }

}