var enableDebug = false;
var enableJsonDebug = false;

function dbg(str, nobreak)
{
    if (!enableDebug) {
    	return;
    }

	if (!$('#dbg').length) {
		$('<div id="dbg"></div>').prependTo('body');
	}
	$('#dbg').html($('#dbg').html() + str + (!nobreak ? '<br />' : '')).prop({ scrollTop: $("#dbg").prop("scrollHeight") });
}