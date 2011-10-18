<!DOCTYPE html>
<html>
    <head>
    	<title>TIN Recensiebeheer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        <link href="css/detail.css" rel="stylesheet" type="text/css" media="screen" />
        <script type="text/javascript" src="jquery/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/tinlogin.js"></script>
        <script type="text/javascript">
        	$(function()
			{
				$('#tinLogin').tinLogin({
					login: function() {
						window.location.reload();
					},
					logout: function() {
						window.location.reload();
					}
				});

				$('div.tinReviewAuthor button').live('click', function() {

					if ($(this).hasClass('tinReviewApprove')) {
						var review = $(this).parent().parent();
						id = review.attr('id');
						alert(id);
					}
					if ($(this).hasClass('tinReviewEdit')) {
						var review = $(this).parent().parent();
						id = review.attr('id');
						alert(id);
						var content = $('div.tinReviewContent', review);
					}
					if ($(this).hasClass('tinReviewSave')) {
						alert(id);
						review.html(review.data('html'));
					}
					if ($(this).hasClass('tinReviewCancel')) {
						alert(id);
						review.html(review.data('html'));
					}
					if ($(this).hasClass('tinReviewDelete')) {
						alert(id);
					}
				});
			});
		</script>
    </head>
    <body>
    	<div id="tinLogin"></div>
    	<div id="container_detail_wrapper">
<?php
//$host = 'http://test.searchtest.tin.nl/';
$host = 'http://rest.tin.nl/';

date_default_timezone_set('Europe/Amsterdam');

function curl_get_uri($uri, $method = 'GET', $data = NULL, $accept = 'application/json', $contentType = 'application/json')
{
	$headers = array(
		'Accept: ' . $accept,
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

	if (empty($response) || empty($code)) {
		return $response ? $response : $code;
	}

	return $response;
}

function displayReview($review)
{
	echo '<div class="tinReview" id="' . $review->id . '">'
		. '<div class="tinReviewBlockDisplay">'
			. '<div class="tinReviewApprove"><input type="checkbox" name="tinReviewApprove[]" value="' . $review->id . '" /></div>'
			. '<div class="tinReviewRating">' . str_repeat('<span class="tinReviewStar">*</span>', (int)$review->rating) . '</div>'
			. '<div class="tinReviewTitle">' . $review->title . '</div>'
			. '<div class="tinReviewContent">' . $review->content . '</div>'
			. '<div class="tinReviewAuthor">' . $review->sender . ' | ' . date('d-m-Y | H:i', strtotime($review->created))
				. ' | <button class="tinReviewApprove">Goedkeuren</button> <button class="tinReviewEdit">Bewerken</button> <button class="tinReviewDelete">Verwijderen</button></div>'
			. '</div>'
		. '</div>'
		. '<div class="tinReviewBlockEdit">'
			. 'Waardering: <input type="radio" name="reviewRating" value="1" />1 <input type="radio" name="reviewRating" value="2" />2 <input type="radio" name="reviewRating" value="3" />3 <input type="radio" name="reviewRating" value="4" />4 <input type="radio" name="reviewRating" value="5" />5<br />'
			. 'Titel: <input type="text" name="reviewTitle" size="40" maxlength="80" /><br />'
			. '<textarea name="reviewContent" rows="6" cols="70">' . $review->content . '</textarea><br />'
			. '<button class="tinReviewSave">Opslaan</button> <button class="tinReviewCancel">Annuleren</button>'
		. '</div>';
}

$loggedIn = false;
$isEditor = false;
if (isset($_COOKIE['emailaddress']) && isset($_COOKIE['password'])) {
	$json = curl_get_uri($host . 'rest/users/login', 'POST', $x = 'userid=' . urlencode($_COOKIE['emailaddress']) . '&pw=' . urlencode($_COOKIE['password']), 'application/json', 'application/x-www-form-urlencoded');
	//echo $json;
	$jsonObj = json_decode($json);
	if ($jsonObj->result) {
		$loggedIn = $jsonObj;
		if ($loggedIn->roles && in_array('ROLE_EDITOR', $loggedIn->roles)) {
			$isEditor = true;
		}
	}
}

if (!$isEditor) {
	exit;
}

if ($loggedIn) {
	$user = curl_get_uri($host . 'rest/users/' . $loggedIn->id, 'GET');
	$fullname = false;
	if ($user && ($user = json_decode($user))) {
		if ($user->name) {
			$fullname = trim($user->name);
		}
		if ($user->surname) {
			$fullname = trim(($fullname ? $fullname . ' ' : '') . $user->surname);
		}
	}
	if (isset($_POST['reviewSubmit']) && isset($_POST['reviewContent'])) {
		$reviewTitle = trim($_POST['reviewTitle']);
		if (!strlen($reviewTitle)) {
			$reviewErrors[] = 'U heeft geen titel opgegeven.';
		}

		$reviewContent = trim($_POST['reviewContent']);
		if (!strlen($reviewContent)) {
			$reviewErrors[] = 'U heeft geen recensie opgegeven.';
		}

		$reviewRating = isset($_POST['reviewRating']) ? trim($_POST['reviewRating']) : 0;
		$reviewRating = (int)$reviewRating;
		if ($reviewRating < 1 || $reviewRating > 5) {
			$reviewRating = 0;
		}

		if (empty($reviewErrors)) {
			$json = curl_get_uri($host . 'rest/reviews', 'POST',
				$x = '{"rating":' . $reviewRating .','
				. '"title":' . json_encode($reviewTitle).','
				. '"content":' . json_encode($reviewContent).','
				. ($fullname ? '"sender":' . json_encode($fullname).',' : '')
				. '"senderId":' . json_encode($loggedIn->id).','
				. '"objectId":' . json_encode($record['id']).','
				. '"type":' . json_encode($record['type']).'}'
			);
			echo $x . '<hr />';
			echo $json;
		}
	}
}

echo '<div id="tinReviewsAdmin"><h3>Recensies in de wachtrij:</h3>';
$reviewsSimpleXml = false;
if (($reviewsXml = curl_get_uri('http://rest.tin.nl/rest/reviews', 'GET', null, 'application/xml', 'application/xml')) && strlen($reviewsXml)) {
	$reviewsSimpleXml = simplexml_load_string($reviewsXml, 'SimpleXMLElement');
}
$reviewCount = 0;
if ($reviewsSimpleXml && $reviewsSimpleXml->review) {
	$reviews = array();
	if (!is_array($reviewsSimpleXml->review) && $reviewsSimpleXml->review->created < $reviewsSimpleXml->review->lastmodified) {
		$reviews[] = $reviewsSimpleXml->review;
	}
	foreach ($reviewsSimpleXml->review as $review) {
		if ($review->created >= $review->lastmodified) {
			$reviews[] = $review;
		}
	}
	foreach ($reviews as $review) {
		$reviewCount++;
		displayReview($review);
	}

	echo '<br /><div class="tinReviewsArrow"><img src="images/arrupleft.gif" /></div><button>Goedkeuren</button> <button>Bewerken</button> <button>Verwijderen</button>';
	//SimpleXMLElement Object ( [review] => SimpleXMLElement Object ( [content] => Dit is een test. [created] => 2011-09-19T10:03:17.231+02:00 [id] => 95fe86d6-aec8-4c07-9a35-aded46b5ba01 [lastmodified] => 2011-09-19T10:03:17.231+02:00 [objectId] => 88e0138b-5cd0-3348-82c6-b7958118c064 [rating] => 0 [sender] => lstest [senderId] => 882bce78-d20c-4edd-8b7f-2e71ccef1c2d [title] => Test review [type] => ChoiceCollect ) )
}
if (!$reviewCount) {
	echo '<div class="divReviewsNone">Er staan geen recensies in de wachtrij.</div>';
}
echo '</div>';
?>
		</div>
    </body>
</html>
