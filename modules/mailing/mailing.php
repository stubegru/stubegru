<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$BASE_PATH = getenv("BASE_PATH");

require "$BASE_PATH/modules/mailing/PHPMailer/src/Exception.php";
require "$BASE_PATH/modules/mailing/PHPMailer/src/PHPMailer.php";
require "$BASE_PATH/modules/mailing/PHPMailer/src/SMTP.php";

/**
 * @param string $to Recipient of the mail. Following RFC2822 (http://www.faqs.org/rfcs/rfc2822)
 * @param string $subject Subject of the mail
 * @param string $message Content of the mail (plain text or HTML)
 * @param array $options stubegru specific options
 *      - "postfix"             : use custom postfix instead of INSTITUTION_MAIL_POSTFIX, use empty string here for no postfix
 *      - "additional_headers"  : additional headers array for using the PHP mail() function
 *      - "additional_params"   : additional params string for using the PHP mail() function
 * 
 * @return boolean Wether sending the mail was successful or not
 */
function stubegruMail($to, $subject, $message, $options = [])
{
    //Add postfix
    if (isset($options["postfix"])) {
        $message .= "<br>" . $options["postfix"];
    } else {
        $message .= "<br>" . getenv("INSTITUTION_MAIL_POSTFIX");
    }

    $mailMethod = getenv(("MAIL_METHOD"));
    switch ($mailMethod) {
        case 'nomail':
            break;

        case 'phpmail':

            $additional_headers = "";
            if (isset($options["additional_headers"])) {
                $additional_headers = $options["additional_headers"];
            }

            $additional_params = "";
            if (isset($options["additional_params"])) {
                $additional_params = $options["additional_params"];
            }

            return mail($to, $subject, $message, $additional_headers, $additional_params);
            break;

        case 'smtp':
            $myPHPMailer = initPHPMailer();
            //Recipients
            $myPHPMailer->setFrom(getenv("INSTITUTION_MAIL_ADDRESS"), getenv("INSTITUTION_NAME"));
            $myPHPMailer->addAddress($to);
            //Content
            $myPHPMailer->isHTML(true);
            $myPHPMailer->Subject = $subject;
            $myPHPMailer->Body    = $message;
            $myPHPMailer->send();
            break;

        default:
            throw new Exception("stubegruMail() was used but no valid MAIL_METHOD was configured in .htaccess file. For more information see: https://github.com/stubegru/stubegru/wiki/htaccess");
            break;
    }
}

function initPHPMailer()
{
    $myPHPMailer = new PHPMailer(true);
    //$myPHPMailer->SMTPDebug = SMTP::DEBUG_SERVER; //Enable verbose debug output
    $myPHPMailer->isSMTP();
    $myPHPMailer->Host       = getenv("SMTP_HOST");
    $myPHPMailer->SMTPAuth   = true;
    $myPHPMailer->Username   = getenv("SMTP_USERNAME");
    $myPHPMailer->Password   = getenv("SMTP_PASSWORD");
    $myPHPMailer->SMTPSecure = getenv("SMTP_SECURE"); //Enable implicit TLS encryption
    $myPHPMailer->Port       = getenv("SMTP_PORT");
    $myPHPMailer->CharSet    = 'UTF-8';
    $myPHPMailer->Encoding   = 'base64';

    return $myPHPMailer;
}
