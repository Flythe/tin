(function($)
{
    $.fn.tinPageNav = function(page_nr, total_results, override_opts)
    {
        var opts = $.extend({}, $.fn.tinPageNav.defaults, override_opts);

        this.each(function() {
            addTinPageNav(this, page_nr, total_results, opts);
        });

        return this;
    };

    $.fn.tinPageNav.defaults = {
    	itemsPerPage: 10,
		prevPageArrow: '&#x25C0;',
		nextPageArrow: '&#x25BA;',
		prevPageHtml: '{PREVARR}<a href="{URL}" class="tinNavLink">Vorige</a>',
		nextPageHtml: '<a href="{URL}" class="tinNavLink">Volgende</a>{NEXTARR}'
    };

    function addTinPageNav(ob, page_nr, total_results, opts)
    {
    	if (!$(ob).hasClass('tinPageNav')) {
			$(ob).addClass('tinPageNav');
		}

		page_nr = parseInt(page_nr);
		var total_pages = Math.ceil(total_results / opts.itemsPerPage);
		if (total_pages < 2) {
			$(ob).html('').hide();
			return;
		}

	    var pagenav = '';
        
        pagenav += '<span class="tinPageNavPrev">&nbsp;';
        
        if (page_nr > 1) {
            pagenav += opts.prevPageHtml.replace(/\{URL\}/, '#tinPage=' + (page_nr - 1) + '&tinSlide=1').replace(/\{PREVARR\}/, opts.prevPageArrow)
        }
        
        pagenav += '</span> ';

	    var el = total_pages < 9 ? total_pages : 9;
	    var shown_elements = el;

	    var nav_elements = new Array();
	    nav_elements[0] = page_nr;

	    el--;

	    var i = 1;
	    while (el > 0) {
	    	//alert('page_nr: ' + page_nr + ' i: ' + i);
	        if (page_nr - i >= 1) {
	        	//alert('unshift ' + (page_nr - i));
	            nav_elements.unshift(page_nr - i);
	            if (!--el) {
	                break;
	            }
	        }
	        if (page_nr + i <= total_pages) {
	        	//alert('shift ' + (page_nr + i));
	            nav_elements.push(page_nr + i);
	            if (!--el) {
	                break;
	            }
	        }
	        i++;
	    }
		//alert(page_nr);
	    if (nav_elements[0] > 1) {
	        nav_elements[0] = 1;
	        nav_elements[1] = '...';
	    }
	    if (nav_elements[nav_elements.length - 1] < total_pages) {
	        nav_elements[nav_elements.length - 1] = total_pages;
	        nav_elements[nav_elements.length - 2] = '...';
	    }

		pagenav += '<div class="tinPageNavMiddle">';
		var j;
	    for (j = 0; j < nav_elements.length; j++) {
	    	var nav_element = nav_elements[j];
	        pagenav += nav_element == page_nr || nav_element === '...' ? '<span>' + nav_element + '</span> '
	        	: '<a href="#tinPage=' + nav_element + '&tinSlide=1" class="tinButton tinSmallButton tinNavLink">' + nav_element + '</a> ';
	    }
		pagenav += '</div>';
	    if (page_nr < total_pages) {
	        pagenav +=  '<span class="tinPageNavNext">'
	        	+ opts.nextPageHtml.replace(/\{URL\}/, '#tinPage=' + (page_nr + 1) + '&tinSlide=1').replace(/\{NEXTARR\}/, opts.nextPageArrow)
	        	+ '</span>';
	    }
	    pagenav +=  '<div class="tinClear"></div>';

	    $(ob).html(pagenav).show();
	    dbg('addTinPageNav() shown.');
    }
})(jQuery);

function gotoPage(container, pnmbr)
{
        var data = $(container).data('tinSearch');
        var options = data.options;

        pnmbr = parseInt(pnmbr);
        var start = pnmbr * options.resultsPerPage;
        var shown_facets = data.shownFacets;
        var facet_query_parts = [];
        var facet_parents_parts = [];
        var facet_query = '';
        var facet_parents = '';

        for (var ft in shown_facets) {
                for (var f in shown_facets[ft]) {
                        facet_query_parts.push(ft + ':' + f);
                        facet_parents_parts.push(ft);
                }
        }

        facet_query = facet_query_parts.join(',');
        facet_parents = facet_parents_parts.join(',');

        $.ajax({
                url: options.proxy,
                global: false,
                type: 'POST',
                dataType: 'html',
                data: ({
                        q: messageQuery($('input.tinSearchInput', container).val()),
                        // use underscore instead of dot (.) because javascript can't handle dots
                        // replace the dot in tinsearch_proxy.php
                        facet: facet_parents,
                        fq: facet_query,
                        start: start,
                        rows: options.resultsPerPage
                }),
                success: function(responseText) {
                        var jsonObject = eval('(' + responseText + ')');
                        getFacets(container, null, options);
                        displaySearchResults(container, jsonObject, pnmbr, true);
                }
        });
}