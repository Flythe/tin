<!DOCTYPE html>
<html>
    <head>
    	<title>TIN Zoekresultaten</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        <link href="css/layout.css" rel="stylesheet" type="text/css" media="screen" />
        <link href="css/detail.css" rel="stylesheet" type="text/css" media="screen" />
        <link href="css/tindetail.css" rel="stylesheet" type="text/css" media="screen" />
        <script type="text/javascript" src="jquery/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/tinlogin.js"></script>
        <script type="text/javascript" src="js/jwplayer/swfobject.js"></script>
        
        <script type="text/javascript">
                var count = 1;
                
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
			});
                        
                function initPlayer(url, height, title) {
                          //plaats swfobject in html van image-here
                          $('div.image-here').html($('div.image-here').html() + '<h4>' + title + ' ' + count + '</h4><div id="container1">Loading the player ... </div><br/>');
                          //verwijder grijze background
                          $('div.image-here').css('background', 'none');
                          
                          var flashvars = { file:url, autostart:'false' };
                          var params = { allowfullscreen:'true', allowscriptaccess:'always' };
                          var attributes = { id:'player1', name:'player1' };
                          
                          swfobject.embedSWF('js/jwplayer/player.swf','container1','640',height,'9.0.115','false', flashvars, params, attributes);
                          
                          count += 1;
                }
		</script>
    </head>
    <body>

	<!--zoekresultaat-->
        <div class="image-here"></div>
	<div class="search-result">
	
<?php
include('vars.php');

date_default_timezone_set('Europe/Amsterdam');

function curl_get_uri($uri, $method = 'GET', $data = NULL, $accept = 'application/json', $contentType = 'application/json')
{
        include('vars.php');
        
	$headers = array(
		'Accept: ' . $accept,
		'Content-Type: ' . $contentType
	);

	if (is_array($data)) {
		$data = json_encode($data);
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

function showPoster($record)
{
        include('vars.php');
        
	if (!isset($record['affiche'])) {
		return;
	}
	if (!is_array($record['affiche'])) {
		$record['affiche'] = array($record['affiche']);
	}
        
        if($intern)
                foreach ($record['affiche'] as $e) {
                        echo '<img src="' . $e . '" class="affiche" />';
                }
        else
                foreach ($record['affiche'] as $e) {
                        echo '<img src="'. $stdImg .'" class="affiche" />';
                }

	unset($record['affiche']);
}

function displayReview($review)
{
        include('vars.php');
        
	echo '<div class="tinReview">'
		. '<div class="tinReviewRating">' . str_repeat('<span class="tinReviewStar">*</span>', (int)$review->rating) . '</div>'
		. '<div class="tinReviewTitle">' . $review->title . '</div>'
		. '<div class="tinReviewContent">' . $review->content . '</div>'
		. '<div class="tinReviewAuthor">' . $review->sender . ' | ' . date('d-m-Y | H:i', strtotime($review->created)) . '</div>'
		. '</div>';
}

$loggedIn = false;
$isEditor = false;
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
	exit;
}

/*****
 * 
 * 
 * 
 * 
 * DEVVING
 * 
 * 
 * 
 * 
 */



//print_r(curl_get_uri($xmluri));



/*****
 * 
 * 
 * 
 * 
 * DEVVING
 * 
 * 
 * 
 * 
 */

if (($jsonStr = curl_get_uri($xmluri)) && ($record = json_decode($jsonStr, true))) {
	if (!empty($record['collection'])) {
		unset($record['collection']);
	}
        
	if (isset($record['input.date']) || isset($record['input.time']) || isset($record['input.name']) || isset($record['input.source'])) {
		$record['input.date'] = $record['input.date'] . ' ' . $record['input.time'] . ' by ' . $record['input.name'] . ' from ' . $record['input.source'] . '<br />';
		unset($record['input.time']);
		unset($record['input.name']);
		unset($record['input.source']);
	}

	if (isset($record['company']) && isset($record['company.lref'])) {
		$record['company'] = '<a href="detail.php?person=' . $record['company.lref'] . '">' . $record['company'] . '</a>';
		unset($record['company.lref']);
	}

	$title = '<i>Geen titel</i>';
	if (!empty($record['title'])) {
		$title = $record['title'];
		unset($record['title']);
	}

	if (!empty($record['companies'])) {
		$companies = array();
		foreach ($record['companies'] as $company) {
			$companies[] = '<a href="detail.php?person=' .$company['id'] . '">' .$company['title'] . '</a>';
		}
		$record['companies'] = implode(', ', $companies);
	}

	showPoster($record);
        
        list_node_image($record);

	echo '<h1>' . $title .'</h1>';

	if (!empty($record['discipline'])) {
		echo '<div class="disciplines">';
		for ($i = 0; $i < count($record['discipline']); $i++) {
			$record['discipline'][$i] = '<a href="?q=' . urlencode(strtolower($record['discipline'][$i])) . '">' . $record['discipline'][$i] . '</a>';
		}
		echo implode('&nbsp;| ', $record['discipline']);
		unset($record['discipline']);
		echo '</div>';
	}

	if (!empty($record['characters'])) {
		echo '<dl>';
		list_characters2($record['characters']);
		echo '</dl>';
		unset($record['characters']);
	}

	list_node($record);

	if (!empty($record['id'])) {
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
	}
}

?>

	</div> <!--eind zoek resultaten-->
    </body>
</html>
<?php
function objectsIntoArray($arrObjData, $arrSkipIndices = array())
{
    include('vars.php');    
        
    $arrData = array();

    // if input is object, convert into array
    if (is_object($arrObjData)) {
        $arrObjData = get_object_vars($arrObjData);
    }

    if (is_array($arrObjData)) {
        foreach ($arrObjData as $index => $value) {
            if (is_object($value) || is_array($value)) {
                $value = objectsIntoArray($value, $arrSkipIndices); // recursive call
            }
            if (in_array($index, $arrSkipIndices)) {
                continue;
            }
            $arrData[$index] = $value;
        }
    }
    return $arrData;
}

function list_characters1($characters)
{
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

function list_node_image($node, $parentKey = false, $isList = false)
{
        include('vars.php');
        
        $element = $node["media"];
        
        if(!empty($element) && '' != $element) {
                foreach ($element as $e) {
                        //webexcluded, intern gebruik
                        if($e['webExclusion'] == true && $intern) {
                                if($e['photo']) {
                                        echo '<img src="' . $e['url'] . '" class="adlibimg" />';
                                } elseif($e['video']) {
                                        echo '<script type="text/javascript">initPlayer("' . str_replace('?webExclusion=true', '', $e['url'].'.flv') . '", "350", "Videofragment");</script>';
                                } elseif($e['audio']) {
                                        echo '<script type="text/javascript">initPlayer("' . str_replace('?webExclusion=true', '', $e['url'].'.mp3') . '", "24", "Geluidsfragment");</script>';
                                }
                        //niet webexcluded
                        } elseif ($e['webExclusion'] == false) {
                                if($e['photo']) {
                                        echo '<img src="' . $e['url'] . '" class="adlibimg" />';
                                } elseif($e['video']) {
                                        echo '<script type="text/javascript">initPlayer("' . str_replace('?webExclusion=false', '', $e['url'].'.flv') . '", "350", "Videofragment");</script>';
                                } elseif($e['audio']) {
                                        echo '<script type="text/javascript">initPlayer("' . str_replace('?webExclusion=false', '', $e['url'].'.mp3') . '", "24", "Geluidsfragment");</script>';
                                }
                        //webexcluded, geen intern gebruik
                        } elseif ($e['webExclusion'] == true && !$intern) {
                                if($e['photo']) {
                                        echo '<img src="' . $e['url'] . '" class="adlibimg" />';
                                } elseif($e['video']) {
                                        echo '<img src="' . $e['url'] . '" class="adlibimg" />';
                                } elseif($e['audio']) {
                                        echo '<img src="' . $e['url'] . '" class="adlibimg" />';
                                }
                        }
                }
        }
}

function list_node($node, $parentKey = false, $isList = false)
{
	echo '<dl>';
	foreach ($node as $k => $element) {
		if(!empty($element) && '' != $element){
		if (is_array($element)) {
			if ($parentKey === 'Edit') {
				echo $element['edit.date'] . ' ' . $element['edit.time'] . ' by ' . $element['edit.name'] . ' from ' . $element['edit.source'] . '<br />';
                        } elseif ($k === 'media' || $k === 'image') {
                                continue;
			} elseif ($k === 'value') {
				list_node($element, $k, true);
			} elseif ($k === 'character') {
				list_characters1($element);
			} elseif ($k === 'characters') {
				list_characters2($element);
			} elseif ($k === 'material') {
				echo '<dt>' . display_label($k) . '</dt><dd>';

				$materials = array();
				foreach ($element as $e) {
					$materials[] = '<a href="detail.php?object=' . $e . '">' . $e . '</a>';
				}
				echo implode(', ', $materials) . '</dd><br />';
			} elseif ($isList) {
				echo '<dt>' . display_label($parentKey) . '</dt><dd>';
				list_node($element, $k);
				echo '</dd>';
			} else {
				echo '<dt>' . display_label($k) . '</dt><dd>';
				list_node($element, $k);
				echo '</dd>';
			}
		} else {
			if ($isList) {
				echo $element . '<br />';
			} else {
				echo '<dt>' . display_label($k) . '</dt><dd>' . $element . '</dd><br />';
			}
		}

	}
	}

	echo '</dl>';
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
?>