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
					disableAdvanced: true
				});

				$('#tinSearch2').tinSearch({
					facet: 'materialtype:foto',
					thumbnails: true,
					disableFacets: true,
					disableTabs: true,
					disableTagCloud: true,
					disableAdvanced: true,
					inputLabel: "Zoek foto's:",
					resultsPerPage: 25,
					css: [
						"#tinSearch2 { background: #f6f6f6 }",
						"#tinSearch2 div.tinSearchMenu { background: #78818B }",
						"#tinSearch2 a.tinSearchSubmit:hover { background: #98A1AB }",
						"#tinSearch2 form.tinSearchAdvancedForm { background: #98A1AB }",
						"#tinSearch2 div.tinPageNav { border-color: #78818B }",
						"#tinSearch2 { border-color: #78818B }",
						"#tinSearch2 div.tinSearchResults { padding-left: .7em; padding-right: .7em; }",
						"#tinSearch2 div.tinSearchNumberOfResults, #tinSearch2 div.tinSearchSuggestion { padding-left: .7em; padding-right: .7em }"
					]
				});

				$('#tinSearch3').tinSearch({
					facet: 'audio:*',
					jukebox: true,
					disableFacets: true,
					disableTabs: true,
					disableTagCloud: true,
					disableAdvanced: true,
					disableReset: true,
					inputLabel: "Zoek op titel, artiest of jaartal:",
					resultsPerPage: 5,
					css: [
						"#tinSearch3 { background: #f6f6f6 }",
						"#tinSearch3 div.tinSearchMenu { background: #788B81 }",
						"#tinSearch3 a.tinSearchSubmit:hover { background: #98ABA1 }",
						"#tinSearch3 form.tinSearchAdvancedForm { background: #98ABA1 }",
						"#tinSearch3 div.tinPageNav, #tinSearch3 { border-color: #788B81 }",
						"#tinSearch3 { border-color: #788B81 }",
						"#tinSearch3 div.tinSearchResults { padding-left: .7em; padding-right: .7em; }",
						"#tinSearch3 div.tinSearchNumberOfResults { padding-left: .7em; padding-right: .7em; }",
						"#tinSearch3 div.tinSearchNumberOfResults, #tinSearch3 div.tinSearchSuggestion { padding-left: .7em; padding-right: .7em }"
					]
				});
			});
        </script>
    </head>
    <body>
    	<div class="tinTop"><a href="index.php" class="tinBack">&laquo; Terug</a> <a href="index.php?tinDemosLogout=1" class="tinDemosLogout"><span>&#9658;</span> Uitloggen demo-omgeving</a></div><div class="tinClear"></div>
    	<table width="95%" border="0" style="margin: 0 18px">
    		<tr>
    			<td valign="top" width="59%">
    				<div id="tinSearch1" style="width: 100%"></div>
    			</td>
    			<td width="2%">&nbsp;</td>
    			<td valign="top" width="39%">
    				<div id="tinSearch2" style="width: 100%"></div>
    				<div id="tinSearch3" style="width: 100%"></div>
    			</td>
    		</tr>
    	</table>
    </body>
</html>