<?php
// Reset is a destructive action: refuse anything that is not a POST so a
// plain page load (or a link from another site) cannot delete the settings.
if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(array('Status' => 'Error', 'Message' => 'POST required'));
    exit;
}

$cfgFile = $settings['configDirectory'] . "/plugin.fpp-WledEffects.json";

if (file_exists($cfgFile)) {
    unlink($cfgFile);
}

echo json_encode(array('Status' => 'OK'));
?>
