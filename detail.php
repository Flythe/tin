<?php
include('vars.php');

date_default_timezone_set('Europe/Amsterdam');

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

function showPoster($record)
{
        include('vars.php');
        
        $affiches = array();
        
	if (!isset($record['affiche'])) {
		return $affiches;
	}
	if (!is_array($record['affiche'])) {
		$record['affiche'] = array($record['affiche']);
	}
        
        foreach ($record['affiche'] as $e) {
                array_push($affiches, '<img src="' . $e . '" class="affiche" />');
        }

	return $affiches;
}

function displayReview($review)
{
        include('vars.php');
        
        $data->review->rating = str_repeat('<span class="tinReviewStar">*</span>', (int)$review->rating);
        $data->review->title = $review->title;
        $data->review->content = $review->content;
        $data->review->sender = $review->sender;
        $data->review->date = $review->created;
}

function list_characters1($characters)
{
        print_r('in');
        include('vars.php');
        
	echo '<dt>Characters</dt><dd>';
	foreach ($characters as $ch) {
		if (!empty($ch['characters.performer'])) {
			if (!empty($ch['characters.performer_function'])) {
				echo ucfirst($ch['characters.performer_function']) . ': ';
				unset($ch['characters.performer_function']);
			}
			$ch_link_start = $ch_link_end = '';
			if (!empty($ch['characters.performer.lref'])) {
				$ch_link_start = '<a href="detail.php?person=' . $ch['characters.performer.lref'] . '">';
				$ch_link_end = '</a>';
				unset($ch['characters.performer.lref']);
			}
			echo $ch_link_start . $ch['characters.performer'] . $ch_link_end . '<br />';
			unset($ch['characters.performer']);
		}
		foreach ($ch as $k => $ch_detail) {
			if (!empty($ch_detail)) {
				echo ucfirst(str_replace('characters.', '', $k)) . ': ' . $ch_detail . '<br />';
			}
		}
	}
}

function list_characters2($characters)
{
        print_r('in');
        include('vars.php');
        
	echo '<dt>Characters</dt><dd>';

	if (isset($characters['description'])) {

		$characters = array($characters);
	}

	echo '<table cellpadding="3" cellspacing="0" class="characters">';
	$odd = false;
	$first = 'first ';
	foreach ($characters as $ch) {

		echo '<tr class="' . $first . 'character ' . ($odd ? 'odd' : 'even') . '">';
		$first = '';
		//echo '<pre>';var_dump($ch); echo '#'; continue;

		echo '<td class="character_img" valign="top">';
		if (!empty($ch['image']) && $intern) {
			echo '<img src="' . $ch['image'] . '">';
			unset($ch['image']);
		} else if(!empty($ch['image'])) {
                        echo '<img src="' . $stdImg . '">';
			unset($ch['image']);
                }
		echo '</td>';
		if (!empty($ch['performer'])) {
			$ch_link_start = $ch_link_end = '';
			if (!empty($ch['performerid'])) {
				$ch_link_start = '<a href="detail.php?person=' . $ch['performerid'] . '">';
				$ch_link_end = '</a>';
				unset($ch['performerid']);
			}
			echo '<td class="performer_name" valign="top">' . $ch_link_start . $ch['performer'] . $ch_link_end . '</td>';
			unset($ch['performer']);
			if (!empty($ch['function'])) {
				echo '<td class="performer_function" valign="top">' . ucfirst($ch['function']) . '</td>';
				unset($ch['function']);
			}
		}

		echo '<td class="character_name" valign="top">';
		if (!empty($ch['name'])) {
			echo $ch['name'];
			unset($ch['name']);
		}
		echo '</td>';

		$details = array();
		foreach ($ch as $k => $ch_detail) {
			if (!empty($ch_detail)) {
				$details[] = ucfirst($k) . ': ' . $ch_detail . '<br />';
			}
		}
		if (count($details)) {
			echo '<td class="character_details" valign="top">' . implode('&nbsp;| ', $details) . '</td>';
		}
		echo '</tr>';
		$odd = !$odd;
	}
	echo '</table>';
}

function disp_media($element, $parentKey = false, $isList = false)
{
        include('vars.php');
        
        $media = array();
        
        if(!empty($element) && '' != $element) {
                foreach ($element as $e) {
                        //webexcluded, intern gebruik
                        if(($e['webExclusion'] == true && $intern) || $e['webExclusion'] == false) {
                                if($e['photo']) {
                                        array_push($media, '<img src="' . $e['url'] . '" class="adlibimg" />');
                                } elseif($e['video']) {
                                        array_push($media, '<script type="text/javascript">initPlayer("' . str_replace('?webExclusion=true', '', $e['url'].'.flv') . '", "350", "Videofragment");</script>');
                                } elseif($e['audio']) {
                                        array_push($media, '<script type="text/javascript">initPlayer("' . str_replace('?webExclusion=true', '', $e['url'].'.mp3') . '", "24", "Geluidsfragment");</script>');
                                }
                        //webexcluded, geen intern gebruik
                        } elseif ($e['webExclusion'] == true && !$intern) {
                                array_push($media, '<img src="' . $e['url'] . '" class="adlibimg" />');
                        }
                }
        }
        
        return $media;
}

function list_node($node, $data, $parentKey = false, $isList = false)
{
	foreach ($node as $k => $element) {
		if(!empty($element) && '' != $element){
                        if (is_array($element)) {
                                if ($parentKey === 'Edit') {
                                        $data->edit = $element['edit.date'] . ' ' . $element['edit.time'] . ' by ' . $element['edit.name'] . ' from ' . $element['edit.source'];
                                } elseif ($k === 'value') {
                                        list_node($element, $data, $k, true);
                                } elseif ($k === 'character') {
                                        list_characters1($element);
                                } elseif ($k === 'characters') {
                                        list_characters2($element);
                                } elseif ($k === 'material') {
                                        $data->material->label = display_label($k);

                                        $materials = array();
                                        foreach ($element as $e) {
                                                $materials[] = '<a href="detail.php?object=' . $e . '">' . $e . '</a>';
                                        }
                                        
                                        $data->material->materials = implode(', ', $materials);
                                } elseif ($isList) {
                                        $data->value->label = display_label($parentKey);
                                        list_node($element, $data, $k);
                                } else {
                                        $data->leftover->label = display_label($k);
                                        list_node($element, $data, $k);
                                }
                        } else {
                                if ($isList) {
                                        $data->noarraylist->data = $element;
                                } else {
                                        $data->noarraynolist->label = display_label($k);
                                        $data->noarraynolist->data = $element;
                                }
                        }
                }
	}
}

function display_label($label)
{
	//return $label;
	$label = ucfirst(str_replace(array('.', '_'), ' ', $label));
	switch ($label) {
		case 'Edit':
			return 'Edits';
		case 'Input date':
			return 'Input by';
		default:
			return $label;
	}
}



//start working
$loggedIn = false;
$isEditor = false;

//get loggedin user data
if (isset($_COOKIE['emailaddress']) && isset($_COOKIE['password'])) {
	$json = curl_get_uri($host . 'rest/users/login', 'POST', $x = 'userid=' . urlencode($_COOKIE['emailaddress']) . '&pw=' . urlencode($_COOKIE['password']), 'application/json', 'application/x-www-form-urlencoded');
	echo $json;
	$jsonObj = json_decode($json);
	if ($jsonObj->result) {
		$loggedIn = $jsonObj;
		if ($loggedIn->roles && in_array('ROLE_EDITOR', $loggedIn->roles)) {
			$isEditor = true;
		}
	}
}

$xmluri = false;

//select right source
if (isset($_GET['apiuri'])) {
	$xmluri = str_replace('http://172.16.1.20/catalogus/', 'http://catalogus.tin.nl/', urldecode($_GET['apiuri']));
} elseif (isset($_GET['production'])) {
	$xmluri = $host . 'rest/productions/' . (int)$_GET['production'];
} elseif (isset($_GET['person'])) {
	$xmluri = $host . 'rest/people/' . (int)$_GET['person'];
} elseif (isset($_GET['object'])) {
	$xmluri = $host . 'rest/object/' . (int)$_GET['object'];
} elseif (isset($_GET['collection'])) {
	$xmluri = $host . 'rest/collection/' . (int)$_GET['collection'];
} else {
	exit();
}

$data = new stdClass();
print_r(curl_get_uri($xmluri));
//start selecting
if (($jsonStr = curl_get_uri($xmluri)) && ($record = json_decode($jsonStr, true))) {        
	if (isset($record['input.date']) || isset($record['input.time']) || isset($record['input.name']) || isset($record['input.source'])) {
		$data->input_date = $record['input.date'] . ' ' . $record['input.time'] . ' by ' . $record['input.name'] . ' from ' . $record['input.source'];
	}

	if (isset($record['company']) && isset($record['company.lref'])) {
		$data->company = '<a href="detail.php?person=' . $record['company.lref'] . '">' . $record['company'] . '</a>';
	}

	if (!empty($record['title'])) {
		$data->title = $record['title'];
	}

	if (!empty($record['companies'])) {
		$companies = array();
		foreach ($record['companies'] as $company) {
			$companies[] = '<a href="detail.php?person=' .$company['id'] . '">' .$company['title'] . '</a>';
		}
		$data->companies = implode(', ', $companies);
	}
        
        if(!empty($record['media'])) {
                $data->images = disp_media($record['media']);
        }

	$data->affiches = showPoster($record);

	if (!empty($record['characters'])) {
		$data->characters = $record['characters'];
	}

	list_node($record, $data);

	/*if (!empty($record['id'])) {
		$reviewErrors = array();
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

		$morelikethis_xml = file_get_contents($host . 'solr/select/?q=id:' . $record['id'] . '&version=2.2&start=0&rows=10&indent=on&mlt=true&mlt.fl=title,pdfcontent,notes&mlt.mindf=1&mlt.mintf=1');
		if (strlen($morelikethis_xml)) {
			$morelikeSimpleXml = simplexml_load_string($morelikethis_xml, 'SimpleXMLElement');
			if (is_object($morelikeSimpleXml) && isset($morelikeSimpleXml->lst) && isset($morelikeSimpleXml->lst[1]) && isset($morelikeSimpleXml->lst[1]->result)) {
				$morelikethisRecord = $morelikeSimpleXml->lst[1]->result;
				//echo '<pre>'; print_r($morelikethisRecord);
				echo '<div id="detail_seealso"><h2>Vergelijkbare objecten:</h2>';
				foreach ($morelikethisRecord->doc as $mlt) {
					$morelike =
					$morelike_attr = array();
					foreach ($mlt as $k => $s) {
						if ($k == 'str') {
							$attr = $s->attributes();
							foreach ($attr as $l => $a) {
								if ($l == 'name') {
									$morelike_attr[(string)$a] = $s;
								}
							}

							//echo '<pre>';echo $k . ': '; $attr[0] ;print_r($s); echo '</pre>';
						}
					}

					echo '<div class="detail_seealso_entry"><div class="detail_seealso_h">';
					if (isset($morelike_attr['title']) && isset($morelike_attr['type']) && isset($morelike_attr['priref'])) {
						$priref = $morelike_attr['priref'];
						$listingUrl = '';
						switch ($morelike_attr['type']) {
							case 'ChoiceCollect':
								$listingUrl = 'detail.php?collection=' . $priref;
								break;
							case 'ChoiceFullCatalogue':
								$listingUrl = 'detail.php?object=' . $priref;
								break;
							case 'ChoiceProductions':
								$listingUrl = 'detail.php?production=' . $priref;
								break;
							case 'ChoicePeople':
								$listingUrl = 'detail.php?person=' . $priref;
								break;
						}
						if ($listingUrl) {
							echo '<h3><a href="' . $listingUrl . '">' . $morelike_attr['title'] . '</a></h3>';
						} else {
							echo '<h3>' . $morelike_attr['title'] . '</h3>';
						}

						unset( $morelike_attr['title']);
						if (isset($morelike_attr['sorttitle'])) {
							unset( $morelike_attr['sorttitle']);
						}
					}

					if (isset($morelike_attr['apiuri'])) {
						//echo ' <a href="' . $morelike_attr['apiuri'] . '" class="detail_seealso_link">api</a>';
						unset($morelike_attr['apiuri']);
					}

					if (isset($morelike_attr['weburl'])) {
						echo '<a href="' . $morelike_attr['weburl'] . '" class="detail_seealso_link">adlib</a>';
						unset($morelike_attr['weburl']);
					}

					echo '</div>';

					foreach ($morelike_attr as $a => $s) {
						switch ($a) {
							case 'id':
							case 'materialcode':
								break;
							case 'materialtype':
								if (NULL != $s && '' != $s)
									echo '<span>Materiaaltype:</span> ' . $s . '<br />';
								break;
							case 'notes':
								if (NULL != $s && '' != $s)
									echo '<span>Notities:</span> ' . $s . '<br />';
								break;
							case 'productioncode':
								if (NULL != $s && '' != $s)
									echo '<span>Productiecode:</span> ' . $s . '<br />';
								break;
							case 'year':
								if (NULL != $s && '' != $s && '0' != $s)
								echo '<span>Jaar:</span> ' . $s . '<br />';
								break;
							default:
								echo '<span>' . ucfirst($a) . ':</span> ' . $s . '<br />';
								break;
						}
					}
					echo '</div>';
				}
				echo '</div>';
			}
		}

		echo '<div id="tinReviews">';
		$reviewsSimpleXml = false;
		if (($reviewsXml = curl_get_uri('http://rest.tin.nl/rest/reviews/object/' . $record['id'], 'GET', null, 'application/xml', 'application/xml')) && strlen($reviewsXml)) {
			$reviewsSimpleXml = simplexml_load_string($reviewsXml, 'SimpleXMLElement');
		}
		$reviewCount = 0;
		if ($reviewsSimpleXml && $reviewsSimpleXml->review) {
			$reviews = array();
			if (!is_array($reviewsSimpleXml->review) && $reviewsSimpleXml->review->created < $reviewsSimpleXml->review->lastmodified) {
				$reviews[] = $reviewsSimpleXml->review;
			}
			foreach ($reviewsSimpleXml->review as $review) {
				if ($review->created < $review->lastmodified) {
					$reviews[] = $review;
				}
			}
			foreach ($reviews as $review) {
				$reviewCount++;
				displayReview($review);
			}

			//SimpleXMLElement Object ( [review] => SimpleXMLElement Object ( [content] => Dit is een test. [created] => 2011-09-19T10:03:17.231+02:00 [id] => 95fe86d6-aec8-4c07-9a35-aded46b5ba01 [lastmodified] => 2011-09-19T10:03:17.231+02:00 [objectId] => 88e0138b-5cd0-3348-82c6-b7958118c064 [rating] => 0 [sender] => lstest [senderId] => 882bce78-d20c-4edd-8b7f-2e71ccef1c2d [title] => Test review [type] => ChoiceCollect ) )
		}
		if (!$reviewCount) {
			echo '<div class="divReviewsNone">Er zijn nog geen reviews van dit object.</div>';
		}
		if ($loggedIn) {
?>
				<form id="writeReview" method="post">
					Uw recensie:<br />
					Waardering: <input type="radio" name="reviewRating" value="1" />1 <input type="radio" name="reviewRating" value="2" />2 <input type="radio" name="reviewRating" value="3" />3 <input type="radio" name="reviewRating" value="4" />4 <input type="radio" name="reviewRating" value="5" />5<br />
					Titel: <input type="text" name="reviewTitle" id="reviewTitle" size="40" maxlength="80" /><br />
					<textarea name="reviewContent" id="reviewContent" rows="6" cols="70"></textarea><br />
					<input type="submit" name="reviewSubmit" id="reviewSubmit" value="Verstuur" />
				</form>
<?php
		} else {
			echo '<div class="tinReviewsLogin">Log in om een recensie te schrijven voor dit object.</div>';
		}
		if ($isEditor) {
			echo '<a href="reviewadmin.php" class="tinReviewsAdmin" target="_blank">Recensiebeheer</a>';
		}
		echo '</div>';
	}*/
}

include('detailView.php');
?>