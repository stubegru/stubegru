<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";
require_once "$BASE_PATH/modules/mailing/mailing.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/constants.php";
permissionRequest("USER_WRITE");
?>

<head>
    <title>Stubegru Mailing System | Test Utilities</title>
</head>

<body>

    <style>
        table,
        th,
        td {
            border: 1px solid black;
            text-align: left;
            min-width: 200px;
        }

        .alert-danger {
            background-color: lightcoral;
            padding: 20px;
            margin: 20px 0px;
        }
        .alert-success {
            background-color: greenyellow;
            padding: 20px;
            margin: 20px 0px;
        }
    </style>

    <h1>Stubegru Mailing System</h1>

    <h3>Mailversand testen</h3>
    Empfänger: <input type="mail" id="addr" placeholder="Mailadresse" value="<?php echo $constants["CUSTOM_CONFIG"]["adminMail"] ?>">
    <button id="testMail">Testmail senden</button>
    <br>

   
        <?php

        if (isset($_GET["testmail"])) {
            try {
                stubegruMail($_GET["testmail"], "Testmail Stubegru", "Dies ist ein Test");
                echo "<div class='alert-success'>Testmail erfolgreich versendet...</div>";
            } catch (\Throwable $th) {
                echo "<div class='alert-danger'>";
                echo ($th->getMessage());
                echo "</div>";
            }
        }

        ?>
    



    <h3>Aktuelle Konfiguration: </h3>
    <table>
        <tr>
            <th>Name</th>
            <th>Wert</th>
        </tr>

        <?php
        $vars = array("MAIL_METHOD", "SMTP_HOST", "SMTP_AUTH", "SMTP_USERNAME", "SMTP_SECURE", "SMTP_PORT");

        foreach ($vars as $var) {
            $value = getenv($var);
            echo "<tr><td>$var</dh><td>$value</td></tr>";
        }
        ?>

    </table>
    <br>
    Werte für <b>MAIL_METHOD</b>:
    <hr>
    <b>"phpmail"</b> : Use PHP's classic mail() function (not recommended but easy)
    <br> <b>"smtp"</b> : Use an external smtp server. Make sure to specify SMTP settings (recommended)
    <br> <b>"nomail"</b> : Never send mails (usefull for demo instances)
    <br>
    <br>
    Werte für <b>SMTP_SECURE</b>:
    <hr>
    <b>"ssl"</b> : SMTPS (implicit TLS normally on port 465)
    <br> <b>"tls"</b> : STARTTLS (explicit TLS normally on port 587)
    <br><br><i>Wird <b>SMTP_AUTH</b> auf den Wert 0 gesetzt, wird der SMTP_SECURE Parameter ignoriert und keine Authentifizierung verwendet.</i>
    <br>
    <br>
    <br>
    <hr>
    Weitere Infos zur .htaccess Konfiguration unter: <a href="https://github.com/stubegru/stubegru/wiki/htaccess">https://github.com/stubegru/stubegru/wiki/htaccess</a>


    <script>
        document.getElementById("testMail").addEventListener("click", () => {
            let addr = document.getElementById("addr").value;
            window.location.href = window.location.href.split("?")[0] + `?testmail=${addr}`;
        });
    </script>

</body>