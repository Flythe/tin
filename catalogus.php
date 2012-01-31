<?php
include('vars.php');
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
        <head>
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

                <title>TIN Zoekmachine</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
                <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
                <meta name="description" content="TIN Zoekmachine" />
                <meta name="keywords" content="tin theater instituut nederland adlib zoeken zoekmachine solr jquery" />
                
                <script type="text/javascript" src="jquery/jquery-1.6.4.min.js"></script>
                <script type="text/javascript" src="js/tinsearchInit.js"></script>
                
                <script type="text/javascript">
                        jQuery(document).ready(function() {
                                jQuery('#tinCatalogus').tinSearch({
                                        isIntern: <?php echo $intern ? 'true' : 'false'; ?>,
                                        disableTabs: true,
                                        disableReset: true,
                                        disableInitialFacets: true,
                                        disableCollapsedFacets: true,
                                        disableTagCloud: true,
                                        inputLabel: false,
                                        searchMenuPosition: 'left',
                                        disableSubmitButton: true,
                                        advancedLinkLabel: 'uitgebreid zoeken',
                                        css: ['layout.css', 
                                              'thesaurus.css', 
                                              'autocomplete.css', 
                                              'navigation.css', 
                                              'jquery.qtip.min.css'
                                        ]
                                });
                        })
                </script>
                
                <script type="text/javascript">
                        var _gaq = _gaq || [];
                          _gaq.push(['_setAccount', 'UA-12264262-14']);
                          _gaq.push(['_trackPageview']);

                        (function() {
                            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
                            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
                            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
                        })();
                </script>
        </head>

        <body>
                <!--content wrapper-->
                <div id="wrapper">

                        <!--top navigation /images-->
                        <div id="top">
                                <img id="logo" src="images/headers/tin_logo.jpg" alt="logo" />
                                <div id="caroussel"><img src="<?php echo $imgUrl; ?>" width="792" height="70" alt="caroussel" /></div> 
                        </div> 
                        
                        <div id="nav">
                                <ul>
                                        <li><a href="<?php echo $tinExternalUrl ?>mediatheek-educatie/openingstijden-route">Contact</a></li>
                                        <li><a href="<?php echo $tinExternalUrl ?>mediatheek-educatie">Mediatheek</a></li>
                                        <li><a href="<?php echo $tinExternalUrl ?>theatererfgoed/collectie">Collectie</a></li>
                                        <li><a href="<?php echo $tinExternalUrl ?>over-tin">Over TIN</a></li>
                                </ul>
                        </div> 
                        <div class="navtabs">
                                <a class="tab" href="<?php echo $tinUrl; ?>"></a>
                        </div>
                        <!--faq en info buttons-->
                        
                        <div class="faq">
                                <a href="faq.php"></a>
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