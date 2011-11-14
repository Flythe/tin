<?php
include('vars.php');
include('curlMethod.php');
include('detailFuncs.php');

date_default_timezone_set('Europe/Amsterdam');

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
        //var_dump($record);
        //exit();
        if (!empty($record['discipline'])) {                
                $data->genre->title = 'Genre: ';
                $data->genre->content = getArray($record['discipline']);
        } else {
                $data->genre = '';
        }
        
        if (!empty($record['year'])) {
                $data->jaar->title = 'Jaar: ';
                $data->jaar->content = $record['year'];
        } else {
                $data->jaar = '';
        }
        
        if (!empty($record['creatorNames']) || !empty($record['authors'])) {
                $data->makers->title = 'Makers: ';
                if(!empty($record['creatorNames'])) {
                        $data->makers->content = getArray($record['creator']);
                } else {
                        $data->makers->content = getArray($record['authors']);
                }
        } else {
                $data->makers = '';
        }
        
        if (!empty($record['materialType'])) {
                $data->materials->materiaal_type->title = 'Materiaaltype: ';
                $data->materials->materiaal_type->content = $record['materialType'];
        } else {
                $data->materials->materiaal_type = '';
        }
        
        if (!empty($record['materialSubType'])) {
                $data->materials->materiaal_subtype->title = 'Materiaal subtype: ';
                $data->materials->materiaal_subtype->content = $record['materialSubType'];
        } else {
                $data->materials->materiaal_subtype = '';
        }
        
        if (!empty($record['titles'])) {
                $data->omschrijving->title = 'Omschrijving: ';
                $data->omschrijving->content = getArray($record['titles']);
        } else {
                $data->omschrijving = '';
        }
        
        if (!empty($record['copyright'])) {
                $data->copyright->title = 'Copyright: ';
                $data->copyright->content = $record['copyright'];
        } else {
                $data->copyright = '';
        }
        
        if (!empty($record['copyNumber'])) {
                $data->location->kopienummer->title = 'Kopienummer: ';
                $data->location->kopienummer->content = $record['copyNumber'];
        } else {
                $data->location->kopienummer = '';
        }
        
        if (!empty($record['shelfMark'])) {
                $data->location->lokatiecode->title = 'Lokatiecode: ';
                $data->location->lokatiecode->content = $record['shelfMark'];
        } else {
                $data->location->lokatiecode = '';
        }
        
        if (!empty($record['loanStatus'])) {
                $data->location->uitleenstatus->title = 'Uitleenstatus: ';
                $data->location->uitleenstatus->content = $record['loanStatus'];
        } else {
                $data->location->uitleenstatus = '';
        }
        
        if($data->location->kopienummer == '' && $data->location->lokatiecode == '' && $data->location->uitleenstatus == '') {
                $data->location = '';
        }
        
        if (!empty($record['title'])) {
                $data->titel->title = 'Titel: ';
                $data->titel->content = $record['title'];
        } else {
                    $data->titel = '';
        }
        
        //add images
        if(!empty($record['media'])) {
                $data->media->title = '';
                $data->media->content = disp_media($record['media'], $data);
        } else {
                $data->media = '';
        }
}

include('detailView.php');
?>