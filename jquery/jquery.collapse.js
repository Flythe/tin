jQuery.fn.not_exists = function()
{
	return jQuery(this).length == 0;
}

jQuery.fn.jqcollapse = function(o)
{
	// Defaults
	var o = jQuery.extend({
		slide: true,
		speed: 300,
		easing: ''
	},o);

	jQuery(this).each(function() {
		if (!jQuery(this).prop('collapsable')) {
			collapse_ob = this;
			jQuery(collapse_ob).prop('collapsable', true)
			jQuery('li > ul', this).each(function(i) {
				var parent_li = jQuery(this).parent('li');
				var sub_ul = jQuery(this).remove();

				// Create 'a' tag for parent if DNE

				if (parent_li.children('a').not_exists()) {
					parent_li.wrapInner('<a/>');
				}

				parent_li.find('a').addClass('jqcNode').css('cursor', 'pointer').click(function(e) {
					e.stopPropagation();
					e.preventDefault();
					if(o.slide==true){
						sub_ul.slideToggle(o.speed, o.easing);
					} else {
						sub_ul.toggle();
					}
					return false;
				});
				parent_li.append(sub_ul);
			});

			//Hide all sub-lists
			jQuery('ul', collapse_ob).hide();
		}
	});
};