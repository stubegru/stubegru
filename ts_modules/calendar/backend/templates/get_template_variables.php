<?php
$BASE_PATH = getenv("BASE_PATH");
require_once "$BASE_PATH/modules/calendar/backend/templates/template_variables.php";

echo json_encode(getTemplateVariables());