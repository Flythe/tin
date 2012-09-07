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
            array_push($urls, '<a href="/detail.php?object='.$e.'">'.$e.'</a>');
        }
    }
    
    return join(', ', $urls);
}

function disp_productie($title, $id) {    
    return '<a href="/detail.php?production='.$id.'">'.$title.'</a>';
}

function getArray($element) {
    $array = array();

    foreach($element as $el) {
        if(is_array($el)) {
            array_push($array, $el['title']);
        } else {
            array_push($array, $el);
        }
    }

    return join('; ', $array);
}

function loop($el, $format = '', $indent = false, $showTitle = true) {
    $str = ''; $format = '';

    if($el == '') { return; }

    //no title is set, get nested items
    if(!isset($el->title)) {
        foreach($el as $e) {
           loop($e, $format, true);
        }

        return;
    }

    if($indent) { echo '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'; }
    if($showTitle) { echo ucfirst( $el->title ).': '; }

    if($el->content == '') { return; }

    if(!empty($el->format)) { $format = $el->format; }
    
    if($format == 'table') {
        $str = formatTable($el->content);
    } else {
        $str = getContents($el->content);
    }

    //remove trailing semi-column        
    echo rtrim($str, "; ");

    //add spaces between items
    echo '<br/>';
}

function getContents($el) {
    $str = '';
    
    //get content or recursively call function to go into nested array
    if(is_array($el) && count($el) > 1) {
        foreach($el as $e) {
            $str .= getContents($e);
        }
    } elseif (is_array($el)) {
        $str .= $el[0];
    } else {
        $str .= $el;
    }
    
    return $str;
}

function formatTable($el) {
    $str = '<table class="table-content" cellspacing="3">';
    
    $str .= getTableRows($el);
    
    $str .= '</table>';
    
    return $str;
}

function getTableRows($el) {
    $str = ''; $rt = '</td>'; $lt = '<td>'; $rr = '</tr>'; $lr = '<tr>';
    $putTags = false;
    
    //open row if not the last item from nested arrays
    if(is_array($el) && count($el) > 1) {
        $str .= $lr;
        $putTags = true;
    }
    
    //add table cell with content or recursively call function to go into nested array
    if(is_array($el) && count($el) > 1) {
        foreach($el as $e) {
            $str .= getTableRows($e);
        }
    } elseif (is_array($el)) {
        $str .= $lt.$el[0].$rt;
    } else {
        $str .= $lt.$el.$rt;
    }

    //close row
    if($putTags) {
        $str .= $rr;
    }
    
    return $str;
}

function disp($el) {
    //nothing to display
    if($el == '' || $el->content == '') { return; }

    echo ucfirst( $el->title ).': '.$el->content;

    echo '<br/>';
}
?>
