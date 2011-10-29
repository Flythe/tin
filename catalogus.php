<?php
$imgUrl = "images/TIN_Catalogus_caroussel_1moving.gif";
$ip=$_SERVER['REMOTE_ADDR'];

$intern = 'false';
$tinUrl = 'http://vintagecatalogus.tin.nl';

if($ip == '188.205.194.154' || $ip == '127.0.0.1') {
        $tinUrl = 'http://tin-as-01/catalogus';
        $intern = 'true';
}

if($ip == '127.0.0.1')
        $imgUrl = "images/TIN_Catalogus_caroussel_1.gif";
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
        <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

                <link href="css/layout.css" rel="stylesheet" type="text/css"/>
                <link href="css/thesaurus.css" rel="stylesheet" type="text/css"/>
                <link href="css/autocomplete.css" rel="stylesheet" type="text/css"/>
                <link href="css/navigation.css" rel="stylesheet" type="text/css"/>
                <link href="css/jquery.qtip.css" rel="stylesheet" type="text/css"/>

                <title>TIN Zoekmachine</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
                <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
                <meta name="description" content="TIN Zoekmachine" />
                <meta name="keywords" content="tin theater instituut nederland adlib zoeken zoekmachine solr jquery" />
                
                <script type="text/javascript" src="jquery/jquery-1.6.2.min.js"></script>
                <script type="text/javascript" src="jquery/jquery.autocomplete.js"></script>
                <script type="text/javascript" src="js/debug.js"></script>
                <script type="text/javascript" src="js/tinsearchNavigation.js"></script>
                <script type="text/javascript" src="js/tinsearchSearchHandlers.js"></script>
                <script type="text/javascript" src="js/tinsearchTheSaurusHandlers.js"></script>
                <script type="text/javascript" src="js/tinsearchFacetHandler.js"></script>
                <script type="text/javascript" src="js/tinsearchFuncs.js"></script>
                <script type="text/javascript" src="js/htmlvars.js"></script>
                <script type="text/javascript" src="js/tinsearchInit.js"></script>
                <script type="text/javascript" src="jquery/tooltip/jquery.qtip.js"></script>
                
                <script type="text/javascript">
                        jQuery(document).ready(function() {
                                jQuery('#tinCatalogus').tinSearch({
                                        isIntern: <?php echo $intern ?>,
                                        disableTabs: true,
                                        disableReset: true,
                                        disableInitialFacets: true,
                                        disableCollapsedFacets: true,
                                        disableTagCloud: true,
                                        inputLabel: false,
                                        searchMenuPosition: 'left',
                                        disableSubmitButton: true,
                                        advancedLinkLabel: 'uitgebreid zoeken'
                                });
                        })
                </script>
        </head>

        <body>
                <!--content wrapper-->
                <div id="wrapper">

                        <!--top navigation /images-->
                        <div id="top">
                                <img id="logo" src="images/tin_logo.jpg" alt="logo" />
                                <div id="caroussel"><img src="<?php echo $imgUrl; ?>" width="792" height="70" alt="caroussel" /></div> 
                        </div> 
                        
                        <div id="nav">
                                <ul>
                                        <li><a href="http://www.theaterinstituut.nl/theater-instituut-nederland/mediatheek-educatie/openingstijden-route">Contact</a></li>
                                        <li><a href="http://www.theaterinstituut.nl/Theater-Instituut-Nederland/mediatheek-educatie">Mediatheek</a></li>
                                        <li><a href="http://www.theaterinstituut.nl/theater-instituut-nederland/theatererfgoed/collectie">Collectie</a></li>
                                        <li><a href="http://www.theaterinstituut.nl/theater-instituut-nederland/over-tin">Over TIN</a></li>
                                </ul>
                        </div> 
                        <div class="navtabs">
                                <a class="tab" href="<?php echo $tinUrl; ?>"></a>
                        </div>
                        <!--faq en info buttons-->
                        
                        <div class="faq">
                                <a href="faq.html"></a>
                                <a href="info.html"></a>
                        </div>
                        <!--end nav-->

                        <div id="tinCatalogus" class="tinSearch">

                                
                                <!-- searchMenu  gets appended here -->
                                
                                
                                <!-- results get appended here -->
                                
                                
                        </div>
                        <div class="tinClear"></div>
                        
                </div> 
                <!--end content wrapper-->
                
        </body>
</html>