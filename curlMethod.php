<?php
function curl_get_uri($uri, $method = 'GET', $calldata = NULL, $accept = 'application/json', $contentType = 'application/json')
{
        include('vars.php');
        
	$headers = array(
		'Accept: ' . $accept,
		'Content-Type: ' . $contentType
	);

	if (is_array($calldata)) {
		$calldata = json_encode($calldata);
	}
        
        if($intern) {
                $uri = $uri.'?intern=TIN';
        }
        
	$handle = curl_init();
	curl_setopt($handle, CURLOPT_URL, $uri);
	curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);

	switch ($method) {
		case 'GET':
			break;
		case 'POST':
			curl_setopt($handle, CURLOPT_POST, true);
			curl_setopt($handle, CURLOPT_POSTFIELDS, $calldata);
			break;
		case 'PUT':
			curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'PUT');
			curl_setopt($handle, CURLOPT_POSTFIELDS, $calldata);
			break;
		case 'DELETE':
			curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'DELETE');
			break;
	}

	$response = curl_exec($handle);
	$code = curl_getinfo($handle, CURLINFO_HTTP_CODE);

	if (empty($response) || empty($code)) {
		return $response ? $response : $code;
	}
        
	return $response;
}
?>
