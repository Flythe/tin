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
        <meta name="keywords" content="tin theater instituut nederland adlib zoeken zoekmachine solr jquery" />
        
        <style type="text/css" media="screen, projection">
        	body, html { margin: 0; padding: 0; font-family: Arial,Helvetica,sans-serif }
        	html { overflow-y: scroll }
        	#tinCatalogusTop { font-size: 18px; line-height: 36px; font-weight: normal; margin: 10px 20px; padding: 0 0 0 15px; width: 500px; border-bottom: solid 2px #A02383 }
        	#tinCatalogusTop span { font-family: "Times New Roman"; color: #A02383; font-size: 23px }
        </style>
                
        <script type="text/javascript" src="jquery/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/tinScriptIncluder.js"></script>
        <script type="text/javascript">
                jQuery(document).ready(function() {
                        jQuery('#tinCatalogus').tinSearch({
                                disableTabs: true,
                                disableReset: true,
                                disableInitialFacets: true,
                                disableCollapsedFacets: true,
                                disableTagCloud: true,
                                inputLabel: false,
                                searchMenuPosition: 'left',
                                disableSubmitButton: true,
                                advancedLinkLabel: 'uitgebreid zoeken',
                                css: 'css/tinsearch.css',
                                /* Override default CSS with the following: */
                                /*css: [
                                        "#tinCatalogus { border-top: 0; border-bottom: 0 }",
                                        "#tinCatalogus div.tinSearchMenu { background: none; margin-top: 15px }",
                                        "#tinCatalogus input.tinSearchInput { border: solid 1px #999; width: 150px; padding-left: 20px; height: 16px; float: right; margin-right: 10px; background: #FFF url('images/search.gif') 1px 1px no-repeat }",
                                        "#tinCatalogus div.tinSearchExtra { float: right; clear: both; margin-top: 0; margin-right: 10px }",
                                        "#tinCatalogus a.tinSearchToggleAdvanced { color: #488AC6; text-decoration: underline; font-size: 9px; font-weight: normal; word-spacing: 2px }",
                                        "#tinCatalogus a.tinSearchToggleAdlib { color: #488AC6; text-decoration: underline; font-size: 9px; font-weight: normal; word-spacing: 2px }",
                                        "#tinCatalogus div.tinSearchResultsWrapper { margin-top: 5px; border-left: solid 2px #A02383; min-height: 500px; padding-left: 30px }",
                                        "#tinCatalogus div.tinSearchNumberOfResults { min-height: 45px; padding-top: 10px; padding-bottom: 5px; border-bottom: solid 2px #A02383; margin-bottom: 12px }",
                                        "#tinCatalogus div.tinSearchAdvanced { font-size: 9px; float: right; margin-top: -35px }",
                                        "#tinCatalogus form.tinSearchAdvancedForm { background-color: #F3F3F3; border: 0; padding-top: 10px; padding-left: 20px; margin-right: 10px; }",
                                        "#tinCatalogus form.tinSearchAdvancedForm a.tinSearchToggleAdvanced { text-decoration: none }",
                                        "#tinCatalogus a.tinSearchToggleAdlib, #tinCatalogus a.tinSearchToggleThesaurus, #tinCatalogus span.tinSearchThesaurusPlus { color: #488AC6 }",
                                        "#tinCatalogus div.tinSearchAdlib { font-size: 9px; float: right; margin-top: -125px; background: #FFF; min-height: 115px }",
                                        "#tinCatalogus form.tinSearchAdlibForm { background-color: #F3F3F3; border: 0; padding-top: 20px; padding-left: 10px; margin-right: 10px; }",
                                        "#tinCatalogus form.tinSearchAdlibForm a.tinSearchToggleAdlib { text-decoration: none }",
                                        "#tinCatalogus div.tinSearchFacets a { font-size: 14px; color: #666; text-transform: lowercase; border-bottom: 0; padding: 6px 0 }",
                                        "#tinCatalogus div.tinSearchFacets li li { padding-left: 0 }",
                                        "#tinCatalogus div.tinSearchFacets li li a { font-size: 9px; font-weight: normal; color: #999; text-transform: none; padding: 1px 0 }",
                                        "#tinCatalogus div.tinSearchFacets li li.current a{ color: black; font-weight: bold;}",
                                        "#tinCatalogus div.tinSearchResult { background: #FFF; padding: 10px }",
                                        "#tinCatalogus div.tinSearchMenu div.tinAutocompleteWrapper { top: 27px }",
                                        "#tinCatalogus div.tinSearchAdlib div.tinAutocompleteWrapper { top: -87px; left: -19px }",
                                        "#tinCatalogus div.tinSearchAdlib input.tinSearchInput { margin-left: 0; width: 140px }",
                                        "#tinCatalogus div.tinSearchThesaurus div.tinAutocompleteWrapper { top: -176px; left: -213px }"
                                ]*/
                        });
                })
        </script>
    </head>
    <body>
    	<div class="tinTop"><a href="index.php" class="tinBack">&laquo; Terug</a> <a href="index.php?tinDemosLogout=1" class="tinDemosLogout"><span>&#9658;</span> Uitloggen demo-omgeving</a></div><div class="tinClear"></div>
    	<h1 id="tinCatalogusTop"><span>TIN</span> catalogus</h1>
    	<div id="tinCatalogus" style="width: 950px; margin: 10px 20px 20px"></div>
    </body>
</html>