<?php
include('vars.php');
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    	<title>TIN Zoekresultaten</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
        <meta http-equiv="content-type" content="text/html; charset=UTF-8"/>
        <link href="css/tindetail.css" rel="stylesheet" type="text/css" media="screen" />
        <script type="text/javascript" src="jquery/jquery-1.6.2.min.js"></script>
        <script type="text/javascript" src="js/tinlogin.js"></script>
        <script type="text/javascript" src="js/jwplayer/swfobject.js"></script>
        
        <script type="text/javascript">                
                var count = 1;
                
        	$(function()
			{
				$('#tinLogin').tinLogin({
					login: function() {
						window.location.reload();
					},
					logout: function() {
						window.location.reload();
					}
				});
			});
                        
                function initPlayer(url, height, width, title) {
                          //plaats swfobject in html van image-here
                          $('div.image-here').html($('div.image-here').html() + '<h4>' + title + ' ' + count + '</h4><div id="container1">Loading the player ... </div><br/>');
                          //verwijder grijze background
                          $('div.image-here').css('background', 'none');
                          
                          var flashvars = { file:url, autostart:'false' };
                          var params = { allowfullscreen:'true', allowscriptaccess:'always' };
                          var attributes = { id:'player1', name:'player1' };
                          
                          swfobject.embedSWF('js/jwplayer/player.swf','container1',width,height,'9.0.115','false', flashvars, params, attributes);
                          
                          count += 1;
                }
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
        <div id="wrapper">
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
                
                <div class="faq"><a href="faq.php"></a></div>
                
                <h3 class="terug"><a href="javascript:self.close();">Sluit venster</a></h3>
                
                <!--zoekresultaat-->
                <div class="search-result">
                        <div class="image-here">
                                <?php
                                        if(count($data->media) > 1 && !$intern) {
                                                echo($data->media[0]);
                                        } else {
                                                loop($data->media);
                                        }
                                ?>
                        </div>
                        
                        <div class="result-data">
                                <h2><?php echo $data->titel->content; ?></h2>
                                
                                <p>
                                        <?php  
                                                loop($data->genre);

                                                disp($data->jaar);
                                                
                                                loop($data->makers);

                                                if($data->materials != '') {
                                                        echo 'Materiaal: <br/>';
                                                        loop($data->materials);
                                                }

                                                if($data->location != '') {
                                                        echo 'Uitleen: <br/>';
                                                        loop($data->location);
                                                }

                                                loop($data->omschrijving);

                                                disp($data->copyright);
                                        ?>
                                </p>
                        </div>
                </div>
        </div>
    </body>
</html>