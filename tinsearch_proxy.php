<?php
/**
 * TIN search proxy
 *
 * PHP proxy for remote search call by tinScriptIncluder.js client.
 *
 * PHP version 5
 *
 * @package    Tin_Search
 * @author     Lennert Stock <ls@webwit.nl>, Allard van Altena <support@flythe-ict.nl>
 * @copyright  2011 Theater Instituut Nederland
 */

include('vars.php');

////print_r($_GET); exit;
if (isset($_GET['query'])) {
	$searchFragment = $_GET['query'];
        if(isset($_GET['field'])) {
                $searchField = $_GET['field'];
        }
        if(isset($_GET['fq'])){
                $fq = $_GET['fq'].',source:adlib';
        } else {
                $fq = 'source:adlib';
        }

	$handle = curl_init();
	curl_setopt($handle, CURLOPT_URL, ($call = $host . 'rest/' . (isset($_GET['thesaurus']) ? 'thesaurus' : 'search') . '/autocomplete?term=' . urlencode($searchFragment) . '&rows=10'
                . (isset($searchField) ? ((strlen($searchField) > 0) ? '&field='.$searchField : '') : '')
                . (isset($fq) ? (strlen($fq) > 0 ? '&fq='.$fq : '') : '')));
	curl_setopt($handle, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json'));
	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
        //print_r($call);
	$rawResponse = curl_exec($handle);
	if (!$rawResponse) {
		exit;
	}
	//echo '<hr>' . $call . '<hr>';
	//echo htmlentities(file_get_contents($call));
	//echo '<pre>' . $rawResponse; exit;
	$response = json_decode($rawResponse);
	if (!$response) {
		exit;
	}

	$suggestions = array();
	$data = array();
	foreach ($response as $suggestion) {
		if (isset($suggestion->occurences)) {
			$suggestions['"' . addslashes($suggestion->term) . '"'] = $suggestion->occurences;
		} else if (isset($suggestion->title)) {
			$suggestions['"' . addslashes($suggestion->title) . '"'] = 1;
			$data[] = json_encode($suggestion);
		}
	}
	arsort($suggestions);

	echo "{query:'" . addslashes($searchFragment) . "', suggestions:[" . implode(',', array_keys($suggestions)) . "]" . (empty($data) ? '' : ", data:[" . implode(',',$data) . ']') . "}";
	exit;
}

if (isset($_GET['getthesaurus'])) {        
	$handle = curl_init();
        curl_setopt($handle, CURLOPT_URL, ($call = $host . 'rest/thesaurus/title/' . urlencode($_GET['getthesaurus'])));
	curl_setopt($handle, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json'));
	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
		
	$rawResponse = curl_exec($handle);
	echo $rawResponse;
	exit;
}

/*
 * Handle audio status "ping" from tinScriptIncluder.js
 */
if (isset($_GET['getstatus'])) {
     //echo "http://mediaserver.tin.nl/getstatus.php?q=" . urlencode($_GET['getstatus']);
     //exit;
     $status = file_get_contents("http://mediaserver.tin.nl/getstatus.php?q=" . urlencode($_GET['getstatus']) . (isset($_GET['noqueue']) ? '&noqueue=1' : '') );
     echo $status;
     exit;
}

/*
 * Handle search actions from tinScriptIncluder.js
 */
$poststr = '';
foreach ($_POST as $fldname => $fldval) {   
        if ($fldname == 'fq') {
			if($fldval != '') {
				$facet_fields = explode(',', $fldval);
						$poststr .= 'fq=';
						$i = 0;
				foreach ($facet_fields as $facet_field) {
						$addon = ',';
						
						if ($facet_field != '')
								$poststr .= urlencode($facet_field) . $addon;
						$i++;
				}
								
				$poststr .= 'source:adlib&';
			} else {
					$poststr .= 'fq=source:adlib&';
			}
	} else {
                if($fldval != '') {
                        $fldval = stripslashes($fldval);
                        $poststr .= str_replace('_', '.', $fldname) . '=' . urlencode($fldval) . '&';
                }
	}
}

$results = curl_get_uri($host . 'rest/search?' . $poststr . '&tagcloud=true' . ($intern ? '&intern=TIN' : ''));

if (!$intern) {
	$results = str_replace('"weburl"', '"weburlIntern"', $results);
	$results = str_replace('"weburlExtern"', '"weburl"', $results);
}

$results = str_replace($adlibEnglish, $adlibDutch, $results);

echo $results;

function curl_get_uri($uri, $method = 'GET', $data = NULL)
{
	$headers = array(
		'Accept: application/json',
		'Content-Type: application/json',
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

	if (empty($response) || empty($code)) {
		return false;
	}

	return $response;
}
?>
