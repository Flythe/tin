<?php
/**
 * TIN Autocomplete proxy
 *
 * PHP proxy for remote autocomplete data call by tinScriptIncluder.js client.
 *
 * PHP version 5
 *
 * @package    Tin_Search
 * @author     Lennert Stock <ls@webwit.nl>
 * @copyright  2011 Theater Instituut Nederland
 */

$searchFragment = $_GET['query'];

$handle = curl_init();
curl_setopt($handle, CURLOPT_URL, 'http://test.searchtest.tin.nl/rest/search/autocomplete?term=' . urlencode($searchFragment) . '&rows=10');
curl_setopt($handle, CURLOPT_HTTPHEADER, array('Accept: application/json', 'Content-Type: application/json'));
curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);

$rawResponse = curl_exec($handle);
if (!$rawResponse) {
	exit;
}

$response = json_decode($rawResponse);
if (!$response) {
	exit;
}

$suggestions = array();
foreach ($response as $suggestion) {
	$suggestions["'" . $suggestion->term . "'"] = $suggestion->occurences;
}
arsort($suggestions);

echo "{query:'" . addslashes($searchFragment) . "', suggestions:[" . implode(',', array_keys($suggestions)) . "]}";
?>