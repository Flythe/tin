<!DOCTYPE html>
<html>
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
                        
                function initPlayer(url, height, title) {
                          //plaats swfobject in html van image-here
                          $('div.image-here').html($('div.image-here').html() + '<h4>' + title + ' ' + count + '</h4><div id="container1">Loading the player ... </div><br/>');
                          //verwijder grijze background
                          $('div.image-here').css('background', 'none');
                          
                          var flashvars = { file:url, autostart:'false' };
                          var params = { allowfullscreen:'true', allowscriptaccess:'always' };
                          var attributes = { id:'player1', name:'player1' };
                          
                          swfobject.embedSWF('js/jwplayer/player.swf','container1','640',height,'9.0.115','false', flashvars, params, attributes);
                          
                          count += 1;
                }
		</script>
    </head>
    <body>

	<!--zoekresultaat-->
        <div class="image-here">
                <?php
                        if(count($data->media) > 1 && !$intern) {
                                echo($data->media[0]);
                        } else {
                                loop($data->media);
                        }
                ?>
        </div>
	<div class="search-result">
                <?php  
                        echo 'titel: '.$data->titel.'<br/><br/>';
                        
                        echo 'genre: ';
                        loop($data->genre);
                        
                        echo 'jaar: ';
                        echo $data->jaar.'<br/><br/>';
                        
                        echo 'makers: ';
                        loop($data->makers);
                        
                        echo 'materiaal: ';
                        loop($data->materials);
                        
                        echo 'omschrijving: ';
                        loop($data->omschrijving);
                ?>
        </div>