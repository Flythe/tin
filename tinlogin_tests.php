<?php

//$host = 'http://test.searchtest.tin.nl/';
$host = 'http://rest.tin.nl/';

run_tests();

function run_tests()
{
	global $host;

	//test_uri('Delete user', 'delete', $host . 'rest/users/44a953f9-0ef9-4ee8-9d6c-8228738104b5', 'DELETE');
	//exit;

	/* LIST ALL */
	//test_uri('List all users', 'list', $host . 'rest/users', 'GET');

	/* NEW USER */
	//test_uri('Add user', 'add', $host . 'rest/users', 'POST', '{"name":"lstest", "email":"ls@webwit.nl", "pw":"123"}', 'application/json');

	/* LIST ALL */
	test_uri('List all users', 'list', $host . 'rest/users', 'GET');

	/* LIST ALL */
	//test_uri('List all users', 'list', $host . 'rest/users', 'GET');

	/* LOGIN */
	list($code, $json) = test_uri('Login', 'login', $host . 'rest/users/login', 'POST', 'userid=' . urlencode('ls@webwit.nl') . '&pw=123', 'application/x-www-form-urlencoded');

	$login_details = json_decode($json);
	$id = $login_details->id;

	/* ADD ROLE */
	test_uri('Add role', 'addrole', $host . 'rest/users/' . $id . '/addrole', 'PUT', '"ROLE_EDITOR"', 'application/json');
	exit;
	/* SINGLE USER INFO */
	test_uri('Single user info', 'info', $host . 'rest/users/' . $id, 'GET');

	/* UPDATE USER */
	test_uri('Update user', 'update', $host . 'rest/users/' . $id, 'PUT', '{"name":"lstest2","email":"ls2@webwit.nl","pw":"456"}', 'application/json');

	/* SINGLE USER INFO */
	test_uri('Single user info', 'info', $host . 'rest/users/' . $id, 'GET');

	/* DELETE USER */
	test_uri('Delete user', 'delete', $host . 'rest/users/' . $id, 'DELETE');

	/* LIST ALL */
	test_uri('List all users', 'list', $host . 'rest/users', 'GET');

	/* OPENID */
	//$results = curl_get_uri($host . 'rest/users/loginOpenId', 'POST', 'userid=edwineve@yahoo.com');

	//echo '<pre>' . htmlentities($results) . '</pre>';
}

function test_uri($title, $cmd, $uri, $method = 'GET', $data = NULL, $contentType = 'application/xml')
{
	$results = curl_get_uri($uri, $cmd, $method, $data, $contentType);
	echo '<h3>' . $title . '</h3><pre>' . formatResults($results) . '</pre>';
	return $results;
}

function curl_get_uri($uri, $cmd, $method = 'GET', $data = NULL, $contentType = 'application/xml')
{
	$headers = array(
		'Accept: application/json',
		'Content-Type: ' . $contentType,
	);

	if (is_array($data)) {
		$data = json_encode($data);
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
			curl_setopt($handle, CURLOPT_POSTFIELDS, $data);
			break;
		case 'PUT':
			curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'PUT');
			curl_setopt($handle, CURLOPT_POSTFIELDS, $data);
			break;
		case 'DELETE':
			curl_setopt($handle, CURLOPT_CUSTOMREQUEST, 'DELETE');
			break;
	}

	$response = curl_exec($handle);
	$code = curl_getinfo($handle, CURLINFO_HTTP_CODE);

	if (empty($response)) {
		switch ($cmd) {
			case 'add':
				return array($code, $code == 201);
			case 'delete':
				return array($code, $code == 204);
			default:
				return array($code, NULL);
		}

		return $code;
	}

	return array($code, $response);

	//$_PUT  = array();
	//if($_SERVER['REQUEST_METHOD'] == 'PUT') {
	//    parse_str(file_get_contents('php://input'), $_PUT);
	//}
}

function formatResults($response)
{
	list($code, $json) = $response;

	$result = 'Response code: ' . $code . "\n";

	if (is_bool($json)) {
		return $result . ($json ? 'TRUE' : 'FALSE');
	}
	if (is_null($json)) {
		return $result;
	}

    $pos         = 0;
    $strLen      = strlen($json);
    $indentStr   = '  ';
    $newLine     = "\n";
    $prevChar    = '';
    $outOfQuotes = true;

    $result .= 'Response: ';

    for ($i=0; $i<=$strLen; $i++) {

        // Grab the next character in the string.
        $char = substr($json, $i, 1);

        // Are we inside a quoted string?
        if ($char == '"' && $prevChar != '\\') {
            $outOfQuotes = !$outOfQuotes;

        // If this character is the end of an element,
        // output a new line and indent the next line.
        } else if(($char == '}' || $char == ']') && $outOfQuotes) {
            $result .= $newLine;
            $pos --;
            for ($j=0; $j<$pos; $j++) {
                $result .= $indentStr;
            }
        }

        // Add the character to the result string.
        $result .= $char;

        // If the last character was the beginning of an element,
        // output a new line and indent the next line.
        if (($char == ',' || $char == '{' || $char == '[') && $outOfQuotes) {
            $result .= $newLine;
            if ($char == '{' || $char == '[') {
                $pos ++;
            }

            for ($j = 0; $j < $pos; $j++) {
                $result .= $indentStr;
            }
        }

        $prevChar = $char;
    }

    return $result;
}

?>