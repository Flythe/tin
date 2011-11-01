<?php
include('vars.php');
include('curlMethod.php');

date_default_timezone_set('Europe/Amsterdam');

function disp_media($elements, $parentKey = false, $isList = false)
{
        include('vars.php');
        
        $media = array();
        
        //loop through mediaelements
        if(!empty($elements) && '' != $elements) {
                foreach ($elements as $e) {
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

function getArray($element) {
        $array = array();
        
        foreach($element as $el) {
                array_push($array, $el);
        }
        
        return $array;
}

function loop($el) {
        if($el == '') {
                echo '<br/><br/>';
                return;
        }
        
        echo '<br/>';
        
        foreach($el as $key => $e) {
                if(is_numeric($key)) {
                        $key = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
                } else {
                        $key = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$key.': ';
                        $key = str_replace('_', ' ', $key);
                }
                
                echo $key.$e.'<br/>';
        }
        
        echo '<br/>';
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
//print_r(curl_get_uri($xmluri));
//start selecting
/*
 * puts the following into a stdClass, then includes detailView.php to display results
 * 
 * - genre (discipline)
 * - jaar (year)
 * - maker (creatornames)
 * - materiaal subtype (materialsubtype)
 * - beschrijving (titles)
 * - materiaaltype (materialtype)
 * - copyright (copyright)
 * - kopienummer (copynumber)
 * - lokatiecode (shelfMark)
 * - uitleenstatus (loanStatus)
 * - media
 */
if (($jsonStr = curl_get_uri($xmluri)) && ($record = json_decode($jsonStr, true))) {    
        if (!empty($record['discipline'])) {                
                $data->genre = getArray($record['discipline']);
        } else {
                $data->genre = '';
        }
        
        if (!empty($record['year'])) {
                $data->jaar = $record['year'];
        } else {
                $data->jaar = '';
        }
        
        if (!empty($record['creatorNames'])) {
                $data->makers = getArray($record['creatorNames']);
        } else {
                $data->makers = '';
        }
        
        if (!empty($record['materialType'])) {
                $data->materials->materiaal_type = $record['materialType'];
        } else {
                $data->materials->materiaal_type = '';
        }
        
        if (!empty($record['materialSubType'])) {
                $data->materials->materiaal_subtype = $record['materialSubType'];
        } else {
                $data->materials->materiaal_subtype = '';
        }
        
        if (!empty($record['titles'])) {
                $data->omschrijving = getArray($record['titles']);
        } else {
                $data->omschrijving = '';
        }
        
        if (!empty($record['copyright'])) {
                $data->copyright = $record['copyright'];
        } else {
                $data->copyright = '';
        }
        
        if (!empty($record['copynumber'])) {
                $data->location->kopienummer = $record['copynumber'];
        } else {
                $data->location->kopienummer = '';
        }
        
        if (!empty($record['shelfMark'])) {
                $data->location->lokatiecode = $record['shelfMark'];
        } else {
                $data->location->lokatiecode = '';
        }
        
        if (!empty($record['loanStatus'])) {
                $data->location->uitleenstatus = $record['loanStatus'];
        } else {
                $data->location->uitleenstatus = '';
        }

	if (!empty($record['title'])) {
		$data->titel = $record['title'];
	} else {
                $data->titel = '';
        }
        
        //add images
        if(!empty($record['media'])) {
                $data->media = disp_media($record['media'], $data);
        } else {
                $data->media = '';
        }
}

include('detailView.php');
?>