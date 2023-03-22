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
 *      - "postfix"                     : use custom postfix instead of INSTITUTION_MAIL_POSTFIX, use empty string here for no postfix
 *      - "attachment"                  : array with information to add an attachment to the mail
 *          - "attachment['name']"      : filename that should be set for the attachment
 *          - "attachment['content']"   : a string containing the file content
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

            $additional_headers = array(); //Additional headers are handled as array
            $additional_headers["From"] = getenv("INSTITUTION_NAME") . " <" . getenv("INSTITUTION_MAIL_ADDRESS") . ">";

            //Attachment
            if (isset($options) && isset($options["attachment"])) {
                if (empty($options["attachment"]["name"]) || empty($options["attachment"]["content"])) {
                    trigger_error("[stubegruMail] Attachment can't be processed because 'name' or 'content' property was not set. Continue sending mail without attachment!", E_USER_WARNING);
                } else {
                    $fileName = $options["attachment"]["name"];
                    $content = $options["attachment"]["content"];
                    $content = chunk_split(base64_encode($content));
                    $uid = md5(time()); // a random hash will be necessary to send mixed content

                    // header
                    $additional_headers["MIME-Version"] = "1.0";
                    $additional_headers["Content-Type"] = "multipart/mixed; boundary=\"$uid\"";

                    // message & attachment
                    $tempMessage = "--" . $uid . "\r\n";
                    $tempMessage .= "Content-type:text/html; charset=utf-8\r\n";
                    $tempMessage .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
                    $tempMessage .= $message . "\r\n\r\n";
                    $tempMessage .= "--" . $uid . "\r\n";
                    $tempMessage .= "Content-Type: application/octet-stream; name=\"" . $fileName . "\"\r\n";
                    $tempMessage .= "Content-Transfer-Encoding: base64\r\n";
                    $tempMessage .= "Content-Disposition: attachment; filename=\"" . $fileName . "\"\r\n\r\n";
                    $tempMessage .= $content . "\r\n\r\n";
                    $tempMessage .= "--" . $uid . "--";
                    $message = $tempMessage;
                }
            }

            return mail($to, $subject, $message, $additional_headers);
            break;

        case 'smtp':
            if (empty($myPHPMailer)) {
                $myPHPMailer = initPHPMailer();
            }
            //Recipients
            $myPHPMailer->setFrom(getenv("INSTITUTION_MAIL_ADDRESS"), getenv("INSTITUTION_NAME"));
            $myPHPMailer->addAddress($to);
            //Content
            $myPHPMailer->isHTML(true);
            $myPHPMailer->Subject = $subject;
            $myPHPMailer->Body    = $message;

            //attachment
            if (isset($options) && isset($options["attachment"])) {
                if (empty($options["attachment"]["name"]) || empty($options["attachment"]["content"])) {
                    trigger_error("[stubegruMail] Attachment can't be processed because 'name' or 'content' property was not set. Continue sending mail without attachment!", E_USER_WARNING);
                } else {
                    $fileName = $options["attachment"]["name"];
                    $content = $options["attachment"]["content"];
                    $myPHPMailer->addStringAttachment($content, $fileName);
                }
            }


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
    $myPHPMailer->SMTPAuth   = getenv("SMTP_AUTH");
    if (getenv("SMTP_AUTH")) {
        $myPHPMailer->Username   = getenv("SMTP_USERNAME");
        $myPHPMailer->Password   = getenv("SMTP_PASSWORD");
        $myPHPMailer->SMTPSecure = getenv("SMTP_SECURE"); //Enable implicit TLS encryption
    }
    $myPHPMailer->Port       = getenv("SMTP_PORT");
    $myPHPMailer->CharSet    = 'UTF-8';
    $myPHPMailer->Encoding   = 'base64';

    return $myPHPMailer;
}
