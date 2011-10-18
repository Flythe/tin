<?php

//$host = 'http://test.searchtest.tin.nl/';
$host = 'http://rest.tin.nl/';

function curl_get_uri($uri, $cmd, $method = 'GET', $data = NULL, $contentType = 'application/xml')
{
	$headers = array(
		'Accept: application/json',
		'Content-Type: ' . $contentType
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
	}

	return array($code, $response);

	//$_PUT  = array();
	//if($_SERVER['REQUEST_METHOD'] == 'PUT') {
	//    parse_str(file_get_contents('php://input'), $_PUT);
	//}
}

if (isset($_POST) && isset($_POST['action'])) {
	switch ($_POST['action']) {
		case 'login':
			if (!isset($_POST['emailaddress']) || !isset($_POST['password'])) {
				return;
			}
			list($code, $json) = curl_get_uri($host . 'rest/users/login', 'login', 'POST', 'userid=' . urlencode($_POST['emailaddress']) . '&pw=' . urlencode($_POST['password']), 'application/x-www-form-urlencoded');

			$jsonObj = json_decode($json);
			if ($jsonObj->result) {
	            setcookie('emailaddress', $_POST['emailaddress'], time() + 60*60*24*365);
	            setcookie('id',$jsonObj->id, time() + 60*60*24*365);
	            setcookie('password', $_POST['password'], time() + 60*60*24*365);
			}

			echo $json;
			exit;
		case 'changeP':
			/* UPDATE USER */
			list($code, $json) = curl_get_uri($host . 'rest/users/' . $_POST['id'], 'update', 'PUT', '{"pw":' . json_encode($_POST['newpassword']) . '}', 'application/json');

			if ($code == 204) {
				echo '{"error":null,"result":true,"changedpw":true}';
			} else {
				echo $json;
			}
			exit;
		case 'put':
			$userdata = array('nameFirst' => 'name', 'nameLast' => 'surname', 'emailaddress' => 'email', 'password' => 'pw', 'address' => 'address', 'postalcode' => 'zipCode', 'city' => 'city', 'phone' => 'phone');

			$json = array();
			foreach ($userdata as $fieldin => $fieldout) {
				$json[] = '"' . $fieldout . '":' . json_encode($_POST[$fieldin]);
			}

			$json = '{' . implode($json, ',') . '}';
			list($code, $jsonreturned) = curl_get_uri($host . 'rest/users/', 'add', 'POST', $json, 'application/json');

			if ($jsonreturned === true) {
	            //setcookie('emailaddress', $_POST['emailaddress'], time() + 60*60*24*365);
	            //setcookie('id',$jsonObj->id, time() + 60*60*24*365);
	            //setcookie('password', md5($_POST['password']), time() + 60*60*24*365);

				echo '{"error":null,"result":true,"registered":true}';
			} else if ($code == 400) {
				echo '{"error":' . json_encode($jsonreturned) . ',"result":false,"registered":false}';
			}
			exit;
		case 'requestP':
			exit;
	}
}

if (isset($_GET) && isset($_GET['action'])) {
	switch ($_GET['action']) {
		case 'info':
			list($code, $json) = curl_get_uri($host . 'rest/users/' . $_GET['id'], 'info', 'GET', null, 'application/xml');
			echo $json;
			exit;
	}
}
?>