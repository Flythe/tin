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
        //generic items
        $data->genre = ''; $data->jaar = ''; $data->makers = ''; $data->materials->materiaal_type = ''; $data->materials->materiaal_subtype = '';
        $data->omschrijving = ''; $data->copyright = ''; $data->location->kopienummer = ''; $data->location->lokatiecode = '';
        $data->location->uitleenstatus = ''; $data->titel = ''; $data->media = '';
        $data->dbname = ''; $data->source_title = ''; $data->author_name_lref = ''; $data->author_name = ''; $data->performance_production_code = ''; $data->place_of_publication = ''; 
        $data->publisher = ''; $data->keywords = ''; $data->notes = ''; $data->isbn = ''; $data->person_keyword_name = ''; $data->language_code = '';
        $data->childs = ''; $data->productionTitle = ''; $data->productionId = ''; $data->sourceTitle = '';
        //var_dump($record);
        //exit();
        if (!empty($record['discipline'])) {                
                $data->genre->title = 'Genre: ';
                $data->genre->content = getArray($record['discipline']);
        }
        
        if (!empty($record['year'])) {
                $data->jaar->title = 'Jaar: ';
                $data->jaar->content = $record['year'];
        }
        
        if (!empty($record['creatorNames']) || !empty($record['authors'])) {
                $data->makers->title = 'Makers: ';
                if(!empty($record['creatorNames'])) {
                        $data->makers->content = getArray($record['creator']);
                } else {
                        $data->makers->content = getArray($record['authors']);
                }
        }
        
        if (!empty($record['materialType'])) {
                $data->materials->materiaal_type->title = 'Materiaaltype: ';
                $data->materials->materiaal_type->content = str_replace("production", "productie", $record['materialType']);
        }
        
        if (!empty($record['materialSubType'])) {
                $data->materials->materiaal_subtype->title = 'Materiaal subtype: ';
                $data->materials->materiaal_subtype->content = $record['materialSubType'];
        }
        
        if (!empty($record['titles'])) {
                $data->omschrijving->title = 'Omschrijving: ';
                $data->omschrijving->content = getArray($record['titles']);
        }
        
        if (!empty($record['copyright'])) {
                $data->copyright->title = 'Copyright: ';
                $data->copyright->content = $record['copyright'];
        }
        
        if (!empty($record['copyNumber'])) {
                $data->location->kopienummer->title = 'Kopienummer: ';
                $data->location->kopienummer->content = $record['copyNumber'];
        }
        
        if (!empty($record['shelfMark'])) {
                $data->location->lokatiecode->title = 'Lokatiecode: ';
                $data->location->lokatiecode->content = $record['shelfMark'];
        }
        
        if (!empty($record['loanStatus'])) {
                $data->location->uitleenstatus->title = 'Uitleenstatus: ';
                $data->location->uitleenstatus->content = $record['loanStatus'];
        }
        
        if($data->location->kopienummer == '' && $data->location->lokatiecode == '' && $data->location->uitleenstatus == '') {
                $data->location = '';
        }
        
        if (!empty($record['title'])) {
                $data->titel->title = 'Titel: ';
                $data->titel->content = $record['title'];
        }
        
        if (!empty($record['language_code'])) {
                $data->language_code->title = 'Taal: ';
                $data->language_code->content = $record['language_code'];
        }
        
        if (!empty($record['person.keyword.name'])) {
                $data->person_keyword_name->title = 'Persoonstrefwoorden: ';
                $data->person_keyword_name->content = $record['person.keyword.name'];
        }
        
        if (!empty($record['isbn'])) {
                $data->isbn->title = 'Isbn: ';
                $data->isbn->content = $record['isbn'];
        }
        
        if (!empty($record['notes'])) {
                $data->notes->title = 'Annotatie: ';
                $data->notes->content = $record['notes'];
        }
        
        if (!empty($record['keywords'])) {
                $data->keywords->title = 'Trefwoorden: ';
                $data->keywords->content = getArray($record['keywords']);
        }
        
        if (!empty($record['publisher'])) {
                $data->publisher->title = 'Uitgever: ';
                $data->publisher->content = getArray($record['publisher']);
        }
        
        if (!empty($record['place_of_publication'])) {
                $data->place_of_publication->title = 'Plaats van uitgave: ';
                $data->place_of_publication->content = $record['place_of_publication'];
        }
        
        if (!empty($record['performance.production_code'])) {
                $data->performance_production_code->title = 'Gekoppelde productie: ';
                $data->performance_production_code->content = $record['performance.production_code'];
        }
        
        if (!empty($record['author.name'])) {
                $data->author_name->title = 'Auteur: ';
                $data->author_name->content = $record['author.name'];
        }
        
        if (!empty($record['author.name.lref'])) {
                $data->author_name_lref->title = '';
                $data->author_name_lref->content = $record['author.name.lref'];
        }
        
        if (!empty($record['dbname'])) {
                $data->dbname->title = 'Uitgever: ';
                $data->dbname->content = $record['dbname'];
        }
        
        if (!empty($record['keyword.contents'])) {
                $data->keyword_contents->title = '';
                $data->keyword_contents->content = $record['keyword.contents'];
        }
        
        if (!empty($record['productionId'])) {
                $data->productionId->title = 'Productie ID: ';
                $data->productionId->content = $record['productionId'];
        }
        
        if (!empty($record['childs'])) {
                $data->childs->title = 'Kinderen: ';
                $data->childs->content = disp_child_url($record['childs']);
        }
        
        if (!empty($record['sourceTitle'])) {
                $data->sourceTitle->title = 'Bron: ';
                $data->sourceTitle->content = $record['sourceTitle'];
        }
        
        if (!empty($record['productionTitle'])) {
                $data->productionTitle->title = 'Productie Titel: ';
                if(!empty($data->productionId)) {
                    $data->productionTitle->content = disp_productie($record['productionTitle'], $data->productionId->content);
                } else {
                    $data->productionTitle->content = $record['productionTitle'];
                }                
        }
        
        //add images
        if(!empty($record['media'])) {
                $data->media->title = '';
                $data->media->content = disp_media($record['media'], $data);
        }
}

include('detailView.php');
?>