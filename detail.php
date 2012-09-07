<?php
include('vars.php');
include('curlMethod.php');
include('detailFuncs.php');

//fields retrievable with a loop, no special needs for further processing of these fields
$fieldsGet = array('year', 'copyright', 'title', 'language_code', 'person.keyword.name', 'isbn', 'notes', 'place_of_publication', 'performance.production_code', 
                        'author.name', 'author.name.lref', 'dbname', 'keywords.contents', 'sourceTitle', 'productionId');
        
//correct titles for above fields
$titles = array('jaar', 'copyright', 'titel', 'taal', 'persoonstrefwoorden', 'isbn', 'annotatie', 'plaats_van_uitgave', 'gekoppelde_productie',
                'auteur', '', 'uitgever', '', 'bron', 'productie_id');

//sorting of display in view
$fieldsView = array('copyright', 'genre', 'makers', 'year', 'copyright', 'dbname', 'sourceTitle', 'author_name_lref', 'author_name', 'performance_production_code', 
                    'place_of_publication', 'notes', 'isbn', 'person_keyword_name', 'language_code', 'childs', 'productionTitle', 'productionId', 'omschrijving', 'publisher', 'keywords');

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
        //all items 
        $data->omschrijving = ''; $data->copyright = ''; $data->keywords = ''; $data->publisher = ''; $data->author_name = ''; $data->year = ''; 
        $data->childs = ''; $data->productionTitle = ''; $data->productionId = ''; $data->performance_production_code = ''; $data->genre = '';
        $data->sourceTitle = ''; $data->keywords_contents = ''; $data->dbname = ''; $data->author_name_lref = ''; $data->makers = '';
        $data->place_of_publication = ''; $data->notes = ''; $data->isbn = ''; $data->person_keyword_name = ''; $data->language_code = ''; 
        
        $data->media = ''; $data->title = ''; $data->characters = '';
        
        $data->materials->materiaal_type = ''; $data->materials->materiaal_subtype = ''; 
        $data->location->kopienummer = ''; $data->location->lokatiecode = ''; $data->location->uitleenstatus = ''; 

        //loop items fill dataobject
        $count = 0;
        
        foreach($fieldsGet as $field) {            
            if(!empty($record[$field])) {
                //remove dots from field notation
                $field = str_replace('.', '_', $field);
                
                //fill data object, format title
                $data->$field->title = str_replace( '_', ' ', $titles[$count] );
                $data->$field->content = $record[$field];
            }
            
            $count++;
        }
        //END loop
        
        //fields that acquire special attention
        if (!empty($record['discipline'])) {                
                $data->genre->title = 'genre';
                $data->genre->content = getArray($record['discipline']);
        }
        
        if (!empty($record['creatorNames']) || !empty($record['authors'])) {
                $data->makers->title = 'makers';
                if(!empty($record['creatorNames'])) {
                        $data->makers->content = getArray($record['creator']);
                } else {
                        $data->makers->content = getArray($record['authors']);
                }
        }
        
        if (!empty($record['materialType'])) {
                $data->materials->materiaal_type->title = 'materiaaltype';
                $data->materials->materiaal_type->content = str_replace("production", "productie", $record['materialType']);
        }
        
        if (!empty($record['materialSubType'])) {
                $data->materials->materiaal_subtype->title = 'materiaal subtype';
                $data->materials->materiaal_subtype->content = $record['materialSubType'];
        }
        
        if (!empty($record['titles'])) {
                $data->omschrijving->title = 'omschrijving';
                $data->omschrijving->content = getArray($record['titles']);
        }
        
        if (!empty($record['copyNumber'])) {
                $data->location->kopienummer->title = 'kopienummer';
                $data->location->kopienummer->content = $record['copyNumber'];
        }
        
        if (!empty($record['shelfMark'])) {
                $data->location->lokatiecode->title = 'lokatiecode';
                $data->location->lokatiecode->content = $record['shelfMark'];
        }
        
        if (!empty($record['loanStatus'])) {
                $data->location->uitleenstatus->title = 'uitleenstatus';
                $data->location->uitleenstatus->content = $record['loanStatus'];
        }
        
        if($data->location->kopienummer == '' && $data->location->lokatiecode == '' && $data->location->uitleenstatus == '') {
                $data->location = '';
        }
        
        if (!empty($record['keywords'])) {
                $data->keywords->title = 'trefwoorden';
                $data->keywords->content = getArray($record['keywords']);
        }
        
        if (!empty($record['publisher'])) {
                $data->publisher->title = 'uitgever';
                $data->publisher->content = getArray($record['publisher']);
        }
        
        if (!empty($record['childs'])) {
                $data->childs->title = 'kinderen';
                $data->childs->content = disp_child_url($record['childs']);
        }
        
        if (!empty($record['productionTitle'])) {
                $data->productionTitle->title = 'productie titel';
                if(!empty($data->productionId)) {
                    $data->productionTitle->content = disp_productie($record['productionTitle'], $data->productionId->content);
                    $data->productionId = '';
                } else {
                    $data->productionTitle->content = $record['productionTitle'];
                }                
        }
        
        //put characters in differently formatted arrays
        if (!empty($record['characters'])) {
                $data->characters->title = 'spelers';
                $data->characters->format = 'table';
                
                $characters = array();
                
                foreach($record['characters'] as $char) {
                    $character = array($char['performer'], $char['function'], $char['name']);
                    
                    array_push($characters, $character);
                }
                
                $data->characters->content = $characters;
        }
        
        //add images
        if(!empty($record['media'])) {
                $data->media->title = '';
                $data->media->content = disp_media($record['media'], $data);
        }
}

include('detailView.php');
?>