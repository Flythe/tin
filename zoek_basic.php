<?php
session_start();

if (!isset($_SESSION['tinDemosLoggedIn'])) {
	header("Location: index.php");
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" dir="ltr" lang="nl" xml:lang="nl">
    <head>
    	<title>TIN Zoekmachine</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
		<meta name="description" content="TIN Zoekmachine" />
		<meta name="keywords" content="tin theater instituut nederland adlib zoeken zoekmachine lucene solr jquery" />
        <style type="text/css" media="screen, projection">
        	body, html { margin: 0; padding: 0; font-family: Verdana,Arial,Helvetica,sans-serif; }
        	html { overflow-y: scroll }
		</style>
        <script type="text/javascript" src="jquery/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/tinScriptIncluder.js"></script>
        <script type="text/javascript">
        	$(function()
			{
				$('#tinSearch1').tinSearch({
					disableFacets: true,
					disableTabs: true,
					disableTagCloud: true,
					disableAdvanced: true
				});
			});
        </script>
    </head>
    <body>
    	<div id="spintest"></div>
    	<div class="tinTop"><a href="index.php" class="tinBack">&laquo; Terug</a><a href="index.php?tinDemosLogout=1" class="tinDemosLogout"><span>&#9658;</span> Uitloggen demo-omgeving</a></div><div class="tinClear"></div>
    	<div id="tinSearch1" style="width: 850px; margin: 10px 20px 20px"></div>
    </body>
</html>