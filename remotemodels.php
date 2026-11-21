<?php
/**
 * Return the overlay-model list of one of the FPP players configured in
 * Multisync.  The "ip" parameter is validated against an allow-list built
 * from trusted local data before it is ever used in a URL, so a caller
 * cannot turn this page into a request to localhost, a LAN device or a
 * cloud metadata endpoint.  Every outbound call is also time-bounded and
 * never follows redirects.
 */

/**
 * Hosts this plugin is allowed to query: the Multisync systems saved by the
 * plugin's own settings page plus FPP's authoritative Multisync system list.
 */
function wledEffectsAllowedHosts($settings)
{
    $allowed = array();

    // The players the operator selected on this plugin's Settings tab.
    $cfgFile = $settings['configDirectory'] . '/plugin.fpp-WledEffects.json';
    if (is_file($cfgFile)) {
        $cfg = json_decode(@file_get_contents($cfgFile), true);
        if (is_array($cfg) && isset($cfg['systems']) && is_array($cfg['systems'])) {
            foreach ($cfg['systems'] as $host) {
                if (is_string($host) && $host !== '') {
                    $allowed[$host] = true;
                }
            }
        }
    }

    // FPP's own Multisync players (read locally, with a hard timeout).
    $ctx = stream_context_create(array(
        'http' => array(
            'method' => 'GET',
            'timeout' => 3,
            'ignore_errors' => true,
        ),
    ));
    $json = @file_get_contents('http://localhost/api/fppd/multiSyncSystems', false, $ctx);
    if ($json !== false) {
        $systems = json_decode($json, true);
        if (is_array($systems) && isset($systems['systems']) && is_array($systems['systems'])) {
            foreach ($systems['systems'] as $sys) {
                if (is_array($sys) && isset($sys['address']) && is_string($sys['address']) && $sys['address'] !== '') {
                    $allowed[$sys['address']] = true;
                }
            }
        }
    }

    return array_keys($allowed);
}

/**
 * A bare host[:port] only - no scheme, path, userinfo, query, whitespace or
 * control characters.  IPv6 literals must be enclosed in [brackets].
 */
function wledEffectsValidHostSyntax($host)
{
    if (!is_string($host) || $host === '' || strlen($host) > 253) {
        return false;
    }
    if (preg_match('/[\s\/\?\#@\\\\]/', $host) || preg_match('/[\x00-\x1f\x7f]/', $host)) {
        return false;
    }
    // Hostname or IPv4, with an optional numeric port.
    if (preg_match('/^[A-Za-z0-9](?:[A-Za-z0-9._-]{0,251}[A-Za-z0-9])?(?::[0-9]{1,5})?$/', $host)) {
        return true;
    }
    // Bracketed IPv6 literal, with an optional numeric port.
    if (preg_match('/^\[[0-9A-Fa-f:]+\](?::[0-9]{1,5})?$/', $host)) {
        return true;
    }
    return false;
}

/**
 * Refuse addresses that can only be this device or a link-local/metadata
 * endpoint, even if they somehow appear in the allow-list.  LAN addresses
 * (10/8, 192.168/16, 172.16/12, IPv6 ULA) are legitimate Multisync peers.
 */
function wledEffectsIsInternalAddress($host)
{
    $bare = $host;
    if (preg_match('/^\[([^\]]+)\](?::[0-9]+)?$/', $bare, $m)) {
        $bare = $m[1];
    } else {
        $bare = preg_replace('/:[0-9]+$/', '', $bare);
    }

    if (strcasecmp($bare, 'localhost') === 0 || preg_match('/\.localhost$/i', $bare)) {
        return true;
    }

    $packed = @inet_pton($bare);
    if ($packed === false) {
        return false; // a hostname; the allow-list is the control for those
    }
    if (strlen($packed) == 4) {
        $b = unpack('C4', $packed);
        return ($b[1] == 127 || $b[1] == 0 || ($b[1] == 169 && $b[2] == 254));
    }
    if (strlen($packed) == 16) {
        if ($packed === str_repeat("\0", 16) || $packed === str_repeat("\0", 15) . "\x01") {
            return true;
        }
        return (ord($packed[0]) & 0xfe) == 0xfc; // fe80::/10 link-local
    }
    return false;
}

$ip = isset($_GET['ip']) ? trim($_GET['ip']) : '';

if (!wledEffectsValidHostSyntax($ip) || wledEffectsIsInternalAddress($ip) ||
    !in_array($ip, wledEffectsAllowedHosts($settings), true)) {
    echo json_encode(array('error' => 'Host is not an allowed Multisync player'));
    exit;
}

$url = 'http://' . $ip . '/api/models';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_HEADER, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, false);
curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 3);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);
$data = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
curl_close($ch);

if (!$data) {
    echo json_encode(array('error' => 'Domain Not Found'));
} else {
    if ($httpcode == 200) {
        echo substr($data, $header_size);
    } else { // eg. 404
        echo json_encode(array('error' => 'Model API not accessible or supported'));
    }
}
?>
