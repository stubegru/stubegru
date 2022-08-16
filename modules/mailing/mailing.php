<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/utils/auth_and_database.php";

require "$BASE_PATH/modules/mailing/PHPMailer/src/Exception.php";
require "$BASE_PATH/modules/mailing/PHPMailer/src/PHPMailer.php";
require "$BASE_PATH/modules/mailing/PHPMailer/src/SMTP.php";

/**
 * @param string $to Recipient of the mail. Following RFC2822 (http://www.faqs.org/rfcs/rfc2822)
 * @param string $subject Subject of the mail
 * @param string $message Content of the mail (plain text or HTML)
 * @param array|string $additional_headers see https://www.php.net/manual/de/function.mail.php
 * @param string $additional_params see https://www.php.net/manual/de/function.mail.php
 * @param array $options stubegru specific options
 *      - "postfix"     : use custom postfix instead of INSTITUTION_MAIL_POSTFIX, use empty string here for no postfix
 * 
 * @return boolean Wether sending the mail was successful or not
 */
function stubegruMail($to, $subject, $message, $additional_headers = [], $additional_params = "", $options = [])
{
    //Add postfix
    if (isset($options["postfix"])) {
        $message .= $options["postfix"];
    } else {
        $message .= getenv("INSTITUTION_MAIL_POSTFIX");
    }

    $mailMethod = getenv(("MAIL_METHOD"));
    switch ($mailMethod) {
        case 'phpmail':
            return mail($to, $subject, $message, $additional_headers, $additional_params);
            break;

        case 'smtp':
            echo "send mail using PHPMailer";
            //Create an instance; passing `true` enables exceptions
            $myPHPMailer = new PHPMailer(true);

            try {
                //Server settings
                //$myPHPMailer->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
                $myPHPMailer->isSMTP();                                            //Send using SMTP

                $myPHPMailer->Host       = getenv("SMTP_HOST");                     //Set the SMTP server to send through
                $myPHPMailer->SMTPAuth   = true;                                   //Enable SMTP authentication
                $myPHPMailer->Username   = getenv("SMTP_USERNAME");                    //SMTP username
                $myPHPMailer->Password   = getenv("SMTP_PASSWORD");                             //SMTP password
                $myPHPMailer->SMTPSecure = getenv("SMTP_SECURE");           //Enable implicit TLS encryption
                $myPHPMailer->Port       = getenv("SMTP_PORT");                                   //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

                //Recipients
                $myPHPMailer->setFrom('from@example.com', 'Mailer');
                $myPHPMailer->addAddress('joe@example.net', 'Joe User');     //Add a recipient
                $myPHPMailer->addAddress('ellen@example.com');               //Name is optional
                $myPHPMailer->addReplyTo('info@example.com', 'Information');
                $myPHPMailer->addCC('cc@example.com');
                $myPHPMailer->addBCC('bcc@example.com');

                //Content
                $myPHPMailer->isHTML(true);                                  //Set email format to HTML
                $myPHPMailer->Subject = 'Here is the subject';
                $myPHPMailer->Body    = 'This is the HTML message body <b>in bold!</b>';
                $myPHPMailer->AltBody = 'This is the body in plain text for non-HTML mail clients';

                $myPHPMailer->send();
                echo 'Message has been sent';
            } catch (Exception $e) {
                echo "Message could not be sent. Mailer Error: {$myPHPMailer->ErrorInfo}";
            }
            break;

        default:
            throw new Exception("stubegruMail() was used but no valid MAIL_METHOD was configured in .htaccess file. For more information see: https://github.com/stubegru/stubegru/wiki/htaccess");
            break;
    }
}

stubegruMail("","","");
