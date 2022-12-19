<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://".$_GET["ip"]."/api/models");
curl_setopt($ch, CURLOPT_HEADER, true);  
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$data = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);

curl_close($ch);
if (!$data) {
  echo json_encode(array('error'=>'Domain Not Found'));
}
else {

  if ($httpcode == 200) {
    $body = substr($data, $header_size);
    echo $body;
  } else { // eg. 404
    echo json_encode(array('error'=>'Model API not accessible or supported'));
  }
}
?>