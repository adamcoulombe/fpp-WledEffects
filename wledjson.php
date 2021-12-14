<?php // create a new cURL resource

if($_GET["action"]=='get_models'){
    $ch = curl_init();

    // set URL and other appropriate options
    curl_setopt($ch, CURLOPT_URL, "http://192.168.10.196/api/models");
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_exec($ch);
    curl_close($ch);
}



?>