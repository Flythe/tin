<!DOCTYPE html>
<html>
    <head>
    	<title>TIN Zoekresultaten</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        <link href="http://src.tin.nl/devtest-fleea/css/layout.css" rel="stylesheet" type="text/css" media="screen" />
        <link href="http://src.tin.nl/devtest-fleea/css/detail.css" rel="stylesheet" type="text/css" media="screen" />
        <link href="http://src.tin.nl/devtest-fleea/css/tindetail.css" rel="stylesheet" type="text/css" media="screen" />
    </head>
    <body>
    	<div class="search-result">
<?php
function curl_get_uri($uri, $method = 'GET', $data = NULL)
{
	$headers = array(
		'Accept: application/json',
		'Content-Type: application/json',
	);

	if (is_array($data)) {
		$data = json_encode(array(
		'firstName'=> 'John',
		'lastName'=> 'Doe'
		));
	}

	$handle = curl_init();
	curl_setopt($handle, CURLOPT_URL, $uri);
	curl_setopt($handle, CURLOPT_HTTPHEADER, $headers);
	curl_setopt($handle, CURLOPT_RETURNTRANSFER, true);
	curl_setopt($handle, CURLOPT_SSL_VERIFYHOST, false);
	curl_setopt($handle, CURLOPT_SSL_VERIFYPEER, false);

	switch ($method)
	{
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

function showPoster(&$record)
{
	if (!isset($record['affiche'])) {
		return;
	}
	if (!is_array($record['affiche'])) {
		$record['affiche'] = array($record['affiche']);
	}

	foreach ($record['affiche'] as $e) {
		//$e = str_replace('\\', '/', $e);
		//$e = str_replace('//tin-as-01/adlib/', 'file:///S:/', $e);
		//$e = '<img src="phpthumb/phpThumb.php?src=' . urlencode($e) . '&w=200';
		echo '<img src="' . $e . '" class="affiche" />';
	}

	unset($record['affiche']);
}

$xmluri = false;

if (isset($_GET['apiuri'])) {
	$xmluri = str_replace('http://172.16.1.20/catalogus/', 'http://catalogus.tin.nl/', urldecode($_GET['apiuri']));
} elseif (isset($_GET['production'])) {
	$xmluri = 'http://test.searchtest.tin.nl/rest/productions/' . (int)$_GET['production'];
} elseif (isset($_GET['person'])) {
	$xmluri = 'http://test.searchtest.tin.nl/rest/people/' . (int)$_GET['person'];
} elseif (isset($_GET['object'])) {
	$xmluri = 'http://test.searchtest.tin.nl/rest/object/' . (int)$_GET['object'];
} elseif (isset($_GET['collection'])) {
	$xmluri = 'http://test.searchtest.tin.nl/rest/collection/' . (int)$_GET['collection'];
} else {
	exit;
}

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

	// Temporary
	//if (isset($record['image'])) {
	//	unset($record['image']);
	//}

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
	//echo '<div class="clear"></div>';

	if (!empty($record['characters'])) {
		echo '<dl>';
		list_characters2($record['characters']);
		echo '</dl>';
		unset($record['characters']);
	}
	
	list_node($record);
?>
<?php

	if (!empty($record['id'])) {
		$morelikethis_xml = file_get_contents('http://test.searchtest.tin.nl/solr/select/?q=id:' . $record['id'] . '&version=2.2&start=0&rows=10&indent=on&mlt=true&mlt.fl=title,pdfcontent,notes&mlt.mindf=1&mlt.mintf=1');
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

					echo '</div><div class="clear"></div>';

					foreach ($morelike_attr as $a => $s) {
						switch ($a) {
							case 'id':
							case 'materialcode':
								break;
							case 'materialtype':
								echo '<span>Materiaaltype:</span> ' . $s . '<br />';
								break;
							case 'notes':
								echo '<span>Notities:</span> ' . $s . '<br />';
								break;
							case 'productioncode':
								echo '<span>Productiecode:</span> ' . $s . '<br />';
								break;
							case 'year':
								echo '<span>Jaar:</span> ' . $s . '<br />';
								break;
							default:
								echo '<span>' . ucfirst($a) . ':</span> ' . $s . '<br />';
								break;
						}
					}
					echo '</div>';
				}
				echo '</div><div class="clear"></div>';
			}
		}
	}
}

?>
		</div>
    </body>
</html>
<?php
function objectsIntoArray($arrObjData, $arrSkipIndices = array())
{
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
		if (!empty($ch['image'])) {
			echo '<img src="' . $ch['image'] . '">';
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
	foreach ($node as $k => $element) {
		if(!empty($element) && '' != $element){
		if (is_array($element)) {
			if ($k === 'image') {
				foreach ($element as $e) {
					echo '<img src="' . $e . '" class="adlibimg" />';
				}
			}
		} elseif ($k === 'image' && !empty($element)) {
				echo '<img src="' . $element . '" class="adlibimg" />';
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
			} elseif ($k === 'value') {
				list_node($element, $k, true);
			} elseif ($k === 'character') {
				list_characters1($element);
			} elseif ($k === 'characters') {
				list_characters2($element);
			} elseif ($k === 'image') {
				// echo '<dt>' . display_label($k) . '</dt><dd>';

				// foreach ($element as $e) {
					// echo '<img src="' . $e . '" class="adlibimg" />';
				// }
				// echo '</dd><br />';
			} elseif ($k === 'media') {
				echo '<dt>' . display_label($k) . '</dt><dd>';

				show_media($element);

				echo '</dd><br />';
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
				//http://test.searchtest.tin.nl/rest/people/144916
				echo '</dd>';
			} else {
				echo '<dt>' . display_label($k) . '</dt><dd>';
				list_node($element, $k);
				echo '</dd>';
			}
		} else {
			if ($isList) {
				echo $element . '<br />';
			} elseif ($k === 'image' && !empty($element)) {
				// echo '<dt>' . display_label($k) . '</dt><dd>';
				// echo '<img src="' . $element . '" class="adlibimg" />';
				// echo '</dd><br />';
			} else {
				echo '<dt>' . display_label($k) . '</dt><dd>' . $element . '</dd><br />';
			}
		}
	}
	}

	echo '</dl><div class="clear"></div>';
}

function show_media($media)
{
	foreach ($media as $m) {
		switch ($m['type']) {
			case 'photo':
				if ($m['webExclusion'] === false) {
					 echo '<img src="' . $m['url'] . '" class="adlibimg" />';
				} else {
					echo '<div class="webexclusion">Niet beschikbaar voor webpublicatie</div>';
				}
				break;
			default:
				break;
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
?>