<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="nl" xml:lang="nl">
    <head>
    	<title>TIN Zoekmachine</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
		<meta name="description" content="TIN Zoekmachine" />
		<meta name="keywords" content="tin theater instituut nederland adlib zoeken zoekmachine lucene solr jquery" />
		<link href="css/tinsearch.css" rel="stylesheet" type="text/css" media="screen" />
        <script type="text/javascript" src="jquery/jquery-1.6.2.min.js"></script>
		<script type="text/javascript" src="js/tinlogin.js"></script>
        <style type="text/css" media="screen, projection">
        	body, html { margin: 0; padding: 0; font-family: Verdana,Arial,Helvetica,sans-serif; }
        	html { overflow-y: scroll }
			#tinActivate {
				width: 540px;
				margin: 20px auto;
				padding: 20px;
				border: 1px solid #CCC;
				background: #FCFCFC;
				background-image: -moz-linear-gradient(top,#FFFFFF,#F9F9F9);
				background-image: -webkit-gradient(linear,left top,left bottom,from(#FFFFFF),to(#F9F9F9));
				filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr=#FFFFFF,endColorStr=#F9F9F9);
				-moz-border-radius: 3px;
				-webkit-border-radius: 3px;
				border-radius: 3px;
				list-style: none;
			}
			#tinActivate h1 {
				padding: 0 0 0 130px;
				font-size: 1.8em;
				font-family: "Times New Roman";
				font-weight: bold;
				font-style: italic;
				color: #A02383;
			}
			#tinActivate h1 span {
				color: #000;
			}
			#tinDemosLoginForm,
			#tinActivate ul {
				padding: 20px 0;
				border: 1px solid #CCC;
				background: #FCFCFC;
				background-image: -moz-linear-gradient(top,#FFFFFF,#F9F9F9);
				background-image: -webkit-gradient(linear,left top,left bottom,from(#FFFFFF),to(#F9F9F9));
				filter: progid:DXImageTransform.Microsoft.Gradient(startColorStr=#FFFFFF,endColorStr=#F9F9F9);
				-moz-border-radius: 3px;
				-webkit-border-radius: 3px;
				border-radius: 3px;
				list-style: none;
			}
			#tinDemosLoginForm {
				padding: 1em 0 2em;
			}
			#tinActivate p {
				margin: 0 auto;
				font-size: 1em;
				padding: 0 2em 1.4em;
				text-align: center;
			}
			#tinDemosLoginForm td {
				font-size: .833em;
			}
			#tinDemosLoginForm label {
				padding: 0 1em 0 2em;
			}
			#tinActivate div.tinDemosPasswordError {
				color: #800000;
				margin: 0 0 20px 90px;
			}
			#tinActivate li {
				padding: .5em 0;
			}
			#tinActivate a.tinButton {
				color: #5A447A;
				font-size: .833em;
				font-weight: bold;
				margin: 0 90px;
			}
			#tinActivate a.tinButton:hover,
			#tinActivate a.tinButton:active {
				color: #641F45;
			}
			#tinActivate li#tinDemosComboWrapper {
				padding-top: 2em;
				padding-bottom: 2em;
			}
			#tinActivate li#tinDemosUserLoginWrapper {
				border-top: dotted 1px #ccc;
				position: relative;
				padding: 1em 20px;
			}
			#tinActivate li#tinDemosUserLoginWrapper strong {
				float: left;
				font-size: .833em;
				padding-top: 1em;
				font-weight: normal;
				text-indent: 85px;
				color: #333;
			}
			#tinDemosLoginFormSubmit {
				 margin-top: 1em;
				 padding: 0 1em;
				 height: 27px;
				 cursor: pointer;
			}
		</style>
    </head>
    <body>
		<div id="tinActivate">
			<h1>TIN <span>account activeren</span></h1>
<?php
$host = 'http://rest.tin.nl/';

function curl_get_uri($uri, $cmd, $method = 'GET', $data = NULL, $accept = 'application/json', $contentType = 'application/xml')
{
	echo $data . '<br />';
	$headers = array(
		'Accept: ' . $accept,
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
			case 'activate':
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

if (!isset($_GET['code']) || !strlen($_GET['code'])) {
	echo '<p>Ongeldige activering.</p>';
	exit;
}

list($code, $json) = curl_get_uri($host . 'rest/users/activate', 'activate', 'PUT', urlencode($_GET['code']), 'application/json', 'application/json');

echo 'code: ' . $code . '<br />';
echo 'json: ' . $json . '<br />';
?>
		</div>
    </body>
</html>
