function deleteConfirm(pTitle, pDescription, callback) { //Dialog der vor dem Löschen von Einträgen aufgerufen wird. nachricht mit pTitle und pDescription wird angezeigt. falls auf "Löschen" geklickt wird, wird die übergebene Funktion "callback" aufgerufen. Dies ist in der Regel dann die Funktion, die das Element aus der DB löscht.
    swal({
        title: pTitle,
        text: pDescription,
        type: "error",
        showCancelButton: true,
        cancelButtonText: "Abbrechen",
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Löschen",
    }, function () {
        callback();
        /*stubegru.modules.alerts.alert({
            title: "Gelöscht!",
            text: "Der Eintrag wurde erfolgreich gelöscht",
            type: "success",
            timer: 2000
        });*/
    });
}