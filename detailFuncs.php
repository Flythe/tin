<?php
function disp_media($elements, $parentKey = false, $isList = false)
{
        include('vars.php');
        
        $media = array();
        
        //loop through mediaelements
        if(!empty($elements) && '' != $elements) {
                foreach ($elements as $e) {
                        //webexcluded, intern gebruik
                        if(($e['webExclusion'] == true && $intern) || $e['webExclusion'] == false) {
                                if($e['photo']) {
                                        array_push($media, '<a href="' . $e['url'] . '&b=2000" target="_blank"><img src="' . $e['url'] . '" class="adlibimg" /></a>');
                                } elseif($e['video']) {
                                        array_push($media, '<a href="/video.php?f=' . $e['url'] . '"><img src="http://mediaserver.tin.nl/img/video.png"/></a>');
                                } elseif($e['audio']) {
                                        array_push($media, '<script type="text/javascript">initPlayer("' . str_replace('?webExclusion=true', '', $e['url'].'.mp3') . '", "24", "400", "Geluidsfragment");</script>');
                                }
                        //webexcluded, geen intern gebruik
                        } elseif ($e['webExclusion'] == true && !$intern) {
                                array_push($media, '<img src="' . $e['url'] . '" class="adlibimg" />');
                        }
                }
        }
        
        return $media;
}

function disp_child_url($elements)
{
    $urls = array();
    
    if(!empty($elements) && '' != $elements) {
        foreach($elements as $e) {
            array_push($urls, '<a href="/detail.php?object='.$e.'">'.$e.'</a>,');
        }
    }
    
    return $urls;
}

function getArray($element) {
        $array = array();
        
        foreach($element as $el) {
                if(is_array($el)) {
                        array_push($array, $el['title']."; ");
                } else {
                        array_push($array, $el."; ");
                }
        }
        
        return $array;
}

function loop($el, $indent = false) {
        $str = '';
    
        if($el == '') {
            return;
        }
        
        if(!isset($el->title)) {
            foreach($el as $e) {
               loop($e, true);
            }

            return;
        }
        
        $add = '';
        
        if($indent) {
            $add = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        }
        
        echo $add.$el->title;
        
        if($el->content == '') {
            return;
        }
        
         if(is_array($el->content) && count($el->content) > 1) {
            //var_dump($el);
            foreach($el->content as $e) {
                $str .= $e;
            }
        } elseif (is_array($el->content)) {
            $str .= $el->content[0];
        } else {
            $str .= $el->content;
        }
        
        echo rtrim($str, "; ");
        
        echo '<br/>';
}

function disp($el) {
        if($el == '' || $el->content == '') {
            return;
        }
        
        echo $el->title.$el->content;
        
        echo '<br/>';
}
?>
