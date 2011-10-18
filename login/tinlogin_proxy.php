<?php
	//--- make the post data string here
	$poststr = "";
	foreach ($_POST as $fldname => $fldval) {
		$poststr .= "$fldname=".urldecode($fldval)."&";
    }
   	$contentlen = strlen($poststr);

	define('POSTURL', 'http://www.webfahig.nl/tinUser/api.cfm');
	define('POSTVARS', $poststr);  // POST VARIABLES TO BE SENT

	// INITIALIZE ALL VARS
	$ch='';
	$Rec_Data='';
	$Temp_Output='';

	$ch = curl_init(POSTURL);
	curl_setopt($ch, CURLOPT_POST      ,1);
	curl_setopt($ch, CURLOPT_POSTFIELDS    ,POSTVARS);
	curl_setopt($ch, CURLOPT_FOLLOWLOCATION  ,0);
	curl_setopt($ch, CURLOPT_HEADER      ,0);  // DO NOT RETURN HTTP HEADERS
	curl_setopt($ch, CURLOPT_RETURNTRANSFER  ,1);  // RETURN THE CONTENTS OF THE CALL
	$Rec_Data = curl_exec($ch);
	echo($Rec_Data);
?>