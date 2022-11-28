$("#institutionName").html(stubegru.constants.APPLICATION_NAME);
let logoPath = stubegru.constants["BASE_URL"] + stubegru.constants["LOGO"];
$("#loginLogo").attr("src", logoPath);


const logoutParam = getParam("logout");
if (logoutParam == "true") {
    stubegru.modules.alerts.alert({
        title: "Logout erfolgreich!",
        type: "success"
    });
}


function doLogin() {

    $("#loginButton").html(`<i class="fas fa-circle-notch fa-spin"></i>`);
    const urlParam = getParam("triggerUrl");
    let triggerUrl = urlParam ? decodeURIComponent(urlParam) : stubegru.constants.BASE_URL;

    $.ajax({
        type: "POST",
        dataType: "json",
        url: `${stubegru.constants.BASE_URL}/modules/login/login_service.php`,
        data: {
            username: $('#user').val(),
            password: $('#password').val()
        },
        success: function (data) {
            if (data.status == "success") {
                window.location.href = triggerUrl;
            } else {
                $("#loginButton").html(`Login`);
                stubegru.modules.alerts.alert({
                    title: "Uppps...",
                    text: "Falsches Passwort oder falscher Nutzername",
                    type: "error",
                    mode: "toast"
                });
            }
        },
        error: function (data) {
            stubegru.modules.alerts.alert({
                title: "Fehler beim Anmelden",
                text: "Es ist ein Serverfehler aufgetreten. Bitte wende dich an den Administrator",
                type: "error"
            });
        }
    });
}