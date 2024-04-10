<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$BASE_PATH = getenv("BASE_PATH");

require "$BASE_PATH/modules/mailing/PHPMailer/src/Exception.php";
require "$BASE_PATH/modules/mailing/PHPMailer/src/PHPMailer.php";
require "$BASE_PATH/modules/mailing/PHPMailer/src/SMTP.php";
$INCLUDED_IN_SCRIPT = true;
require_once "$BASE_PATH/utils/database_without_auth.php";
require_once "$BASE_PATH/utils/constants.php";

$institutionName = isset($constants["CUSTOM_CONFIG"]["institutionName"]) ? $constants["CUSTOM_CONFIG"]["institutionName"] : "Stubegru";
$institutionMail = isset($constants["CUSTOM_CONFIG"]["institutionMailAddress"]) ? $constants["CUSTOM_CONFIG"]["institutionMailAddress"] : "nobody@example.com";

/**
 * @param string $to Recipient of the mail. Following RFC2822 (http://www.faqs.org/rfcs/rfc2822)
 * @param string $subject Subject of the mail
 * @param string $message Content of the mail (plain text or HTML)
 * @param array $options stubegru specific options
 *      - "replyTo"                     : array with reply to address
 *          - "replyTo['name']"         : Name of reply to
 *          - "replyTo['address']"      : Mail address fo reply to
 *      - "postfix"                     : use custom postfix instead of INSTITUTION_MAIL_POSTFIX, use empty string here for no postfix
 *      - "attachment"                  : array with information to add an attachment to the mail
 *          - "attachment['name']"      : filename that should be set for the attachment
 *          - "attachment['content']"   : a string containing the file content
 * 
 * @return boolean Wether sending the mail was successful or not
 */
function stubegruMail($to, $subject, $message, $options = [])
{
    global $institutionMail, $institutionName, $constants;

    try {


        //Add postfix
        $defaultPostfix = loadStubegruMailtemplate("default_mail_postfix.html");

        if (isset($options["postfix"])) {
            $message .= "<br>" . $options["postfix"];
        } else {
            $message .= "<br>" . $defaultPostfix;
        }

        $fileName = "";

        $mailMethod = getenv(("MAIL_METHOD"));
        switch ($mailMethod) {
            case 'nomail':
                break;

            case 'phpmail':

                $additional_headers = array(); //Additional headers are handled as array
                $additional_headers["From"] = $institutionName . " <" . $institutionMail . ">";
                $additional_headers["Content-type"] = "text/html; charset=utf-8";

                //set optional reply to
                if (isset($options) && isset($options["replyTo"])) {
                    if (empty($options["replyTo"]["name"]) || empty($options["replyTo"]["address"])) {
                        trigger_error("[stubegruMail] ReplyTo could not be set because name or address was not set correctly!", E_USER_WARNING);
                    } else {
                        $additional_headers["Reply-To"] = $options["replyTo"]["name"]  . '<' . $options["replyTo"]["address"] . '>';
                    }
                }

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

                $status = mail($to, $subject, $message, $additional_headers);
                if ($status != true) {
                    throw new Exception("PHP's mail() function failed", 1);
                }
                break;

            case 'smtp':
                if (empty($myPHPMailer)) {
                    $myPHPMailer = initPHPMailer();
                }
                //Recipients
                $myPHPMailer->setFrom($institutionMail, $institutionName);

                //set optional reply to
                if (isset($options) && isset($options["replyTo"])) {
                    if (empty($options["replyTo"]["name"]) || empty($options["replyTo"]["address"])) {
                        trigger_error("[stubegruMail] ReplyTo could not be set because name or address was not set correctly!", E_USER_WARNING);
                    } else {
                        $myPHPMailer->addReplyTo($options["replyTo"]["address"], $options["replyTo"]["name"]);
                    }
                }

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



                $status = $myPHPMailer->send();
                if ($status != true) {
                    throw new Exception($myPHPMailer->ErrorInfo, 1);
                }

                break;

            default:
                throw new Exception("stubegruMail() was used but no valid MAIL_METHOD was configured in .htaccess file. For more information see: https://github.com/stubegru/stubegru/wiki/htaccess");
                break;
        }

        //log mail
        $loggedInUserId = isset($_SESSION["id"]) ? $_SESSION["id"] : "0";
        logMail($to, $subject, $fileName, "OK", $loggedInUserId, $mailMethod);

    } catch (\Throwable $th) {
        //temporary catch error to log mail, then throw error again
        $loggedInUserId = isset($_SESSION["id"]) ? $_SESSION["id"] : "0";
        logMail($to, $subject, $fileName, $th->getMessage(), $loggedInUserId, $mailMethod);
        throw $th;
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


function loadStubegruMailtemplate($name)
{
    global $BASE_PATH;
    //@ suppresses the warning if the file is not found
    $mailText = @file_get_contents("$BASE_PATH/custom/mail_templates/$name");
    if ($mailText === false) {
        //use default mail template if no custom template was found
        $mailText = file_get_contents("$BASE_PATH/mail_templates/$name");
    }

    if ($mailText === false) {
        throw new Exception("Could not load Mailtemplate '$name'", 1);
    }

    $mailText = replaceDefaultPlaceholders($mailText);
    return $mailText;
}

function extractMailSubject($templateRaw, $templateName)
{
    $dom = new DOMDocument;
    @$dom->loadHTML($templateRaw); //The @ suppresses any (HTML format) warnings
    foreach ($dom->getElementsByTagName('meta') as $node) {
        $name = $node->getAttribute('name');
        $content = $node->getAttribute('content');
        if ($name == "subject") {
            return $content;
        }
    }
    trigger_error("No subject found in the mail template '$templateName'. Make sure to set the meta tag: &lt;meta name='subject' content='mySubject'&gt;", E_USER_WARNING);
    return "";
}

/**
 * Replace constants and custom_config values in curly brackets: {placeholder} => value
 */
function replaceDefaultPlaceholders($templateRaw)
{
    global $constants;

    foreach ($constants as $key => $value) {
        if (is_string($value)) {
            $templateRaw = str_replace("{" . $key . "}", $value, $templateRaw);
        }
    }
    foreach ($constants["CUSTOM_CONFIG"] as $key => $value) {
        if (is_string($value)) {
            $templateRaw = str_replace("{" . $key . "}", $value, $templateRaw);
        }
    }
    return $templateRaw;
}

function logMail($recipient, $subject, $attachmentName, $status, $initiator, $mailMethod)
{
    global $dbPdo;
    $insertStatement = $dbPdo->prepare("INSERT INTO `mail_log`(`recipient`, `subject`, `attachmentName`, `status`, `initiator`, `mailMethod`) VALUES (:recipient, :subject, :attachmentName, :status, :initiator, :mailMethod);");
    $insertStatement->bindValue(':recipient', $recipient);
    $insertStatement->bindValue(':subject', $subject);
    $insertStatement->bindValue(':attachmentName', $attachmentName);
    $insertStatement->bindValue(':status', $status);
    $insertStatement->bindValue(':initiator', $initiator);
    $insertStatement->bindValue(':mailMethod', $mailMethod);
    $insertStatement->execute();
}
