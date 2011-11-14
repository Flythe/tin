<?php
// set debug, default to false for non-127.0.0.1 ips
$debug = false;

// set IP vars
$thisIp = $_SERVER['REMOTE_ADDR'];

$debugIp = '127.0.0.1';
$internIp = '188.205.194.154';

if($thisIp == $debugIp) {
        $debug = true;
}
// end IP vars

// set urls
$imgUrl = "images/headers/TIN_Catalogus_caroussel_1moving.gif";
$tinUrl = 'http://vintagecatalogus.tin.nl';
$tinExternalUrl = 'http://www.theaterinstituut.nl/theater-instituut-nederland/';

// remove moving banner for debug
if($thisIp == $debugIp) {
        $imgUrl = "images/headers/TIN_Catalogus_caroussel_1.gif";
}
// end urls

// set internal or external access
$intern = false;

if(($thisIp == $internIp || $thisIp == $debugIp) && $debug) {
        $tinUrl = 'http://tin-as-01/catalogus';
        $intern = true;
}
// end access

// host for search queries
$host = 'http://rest.tin.nl/';
// end host

// translations
$adlibEnglish = array('recalled', 'lost or stolen', 'withdrawn', 'temp.withdrawn', 'in transit', 'available', 'on loan');
$adlibDutch = array('teruggeroepen', 'vermist', 'niet uitleenbaar', 'tijdelijk niet uitleenbaar', 'onderweg', 'beschikbaar', 'uitgeleend');
// end translations
?>
