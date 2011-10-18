/* widgets in the sidebar */




function getFacets(container, facets, opts)
{
        dbg('getFacets: ' + $(container).attr('id'));
        var facet_names = [];
        var facet_query = '';

        url = $.bbq.getState( $(container).attr( 'id' ) ) || '';

        if (!opts.facet) {
                if (facets == undefined || facets == null) {
                        facets = $.fn.tinSearch.defaults.def_facets;
                }

                for (k = 0; k < facets.length; k++) {
                        facet_names.push(facets[k].name);
                }
        } else {
                var shown_facets = opts.facet.split(',');
                var facet_query_parts = [];

                for (ft in shown_facets) {
                        var facet_data = shown_facets[ft].split(':');
                        facet_query_parts.push(facet_data[0] + ':' + facet_data[1]);
                        facet_names.push(facet_data[0]);
                }

                facet_query = facet_query_parts.join(',');
        }
        $.ajax({
                url: opts.proxy,
                global: false,
                type: 'POST',
                dataType: 'html',
                data: ({
                        q: messageQuery($('input.tinSearchInput', container).val()),
                        // use underscore instead of dot (.) because javascript can't handle dots
                        // replace the dot in tinsearch_proxy.php
                        facet: facet_names.join(','),
                        fq: facet_query,
                        rows: opts.resultsPerPage
                }),
                async:false,
                success: function(responseText) {
                        // build collapsible list html from jsonObject  -> Search facet: Type
                        var jsonObject = eval('(' + responseText + ')');
                        // render search results
                        parseFacets(container, jsonObject, facets);

                if (opts && opts.facet) {
                        var facet_data = opts.facet.split(':');
                        filterByFacet(container, facet_data[0], facet_data[1], url, true);
                }
                }
        });
}

function parseFacets(container, jsonObject, facets)
{
        dbg('parseFacets: ' + $(container).attr('id'));
        if (!jsonObject.facets || !jsonObject.facets.length) {
                jsonObject.facets =
                [
                        {"field":"type", "facets": []},
                        {"field":"materialtype", "facets": []},
                        {"field":"casttotal", "facets": []},
                        {"field":"castamounts", "facets": []},
                        {"field":"year", "facets": []}
                ];
        }
        
        $('.tinSearchFacets', container).html('');
        
        var data = $(container).data('tinSearch');
        $(container).data('tinSearch', data);

        var options = data.options;

        //current facets
        var url = $.bbq.getState( $(container).attr( 'id' ) ) || '';

        if (url)
                var params = $.deparam( url );

        var extra_facets = '';
        var shown_facets = false;
        var used_facets = false;

        if(params) {
                if (params.tinFilter) {
                        shown_facets = params.tinFilter;
                        shown_facets = shown_facets.split();
                        $.each(shown_facets, function(key, facet){
                                extra_facets += ',' + facet;
                        });
                }
        }
        
        for (k = 0; k < jsonObject.facets.length; k++) {
                var facet = jsonObject.facets[k].field;
                var i;
                var total = 0;
                var facets_html = '';
                var advsearch_html;

                var cur = null;

                /*if (!options.disableAdvanced) {
                        if ($('select.tinSearchAdvanced_' + facet, container).length) {
                                cur = $('select.tinSearchAdvanced_' + facet, container).val();
                        }

                        $('div.tinSearchAdvancedWrapper_' + facet, container).remove();
                        advsearch_html = '<option value="*" ' + (cur == null ? ' selected="selected"' : '') + '>Maak een keuze</option>';
                }*/

                for (i = 0; i < jsonObject.facets[k].facets.length; i++) {
                        if (!parseInt(jsonObject.facets[k].facets[i].value)) {
                                continue;
                        }
                        var attr_selected = '';
                        var attr_current = '';
                        var selected_facets = true

                        var f = jsonObject.facets[k].facets[i].title;
                        var facet_title = options.facetTranslations[f] ? options.facetTranslations[f] : f;
                        if (facet_title.indexOf('.') == -1)
                                facet_title = ucfirst(facet_title);
                        
                        if (extra_facets.match(jsonObject.facets[k].facets[i].title)) {
                                //attr_selected = ' selected="selected"';
                                attr_current = ' class="current"';
                                selected_facets = false;
                        }

                        /*advsearch_html += '<option' + attr_selected + ' value="' + f + '">'
                                + facet_title + '&nbsp;&nbsp;('  + jsonObject.facets[k].facets[i].value + ')</option>';*/
                        facets_html += 
                                '<li' + attr_current + '>' +
                                        '<a href="#tinFilter=' + facet + ':' + f + ((selected_facets) ? extra_facets : '') +'&parseFacets=1" class="tinSearchAddFacet">' + facet_title + '&nbsp; <span class="number">(' + jsonObject.facets[k].facets[i].value + ')</span></a>' +
                                '</li>';
                        total += parseInt(jsonObject.facets[k].facets[i].value);
                }

                if ($('ul.tinSearchCollapser_' + facet, container).length) {
                        $('ul.tinSearchCollapser_' + facet, container).remove();
                }

                if (!$('ul.tinSearchCollapser_' + facet, container).length && total > 0) {
					if(total != 0) {
                        //$('div.tinSearchFacets', container).append('<ul class="' + (!options.disableCollapsedFacets ? 'collapser ' : '') + 'tinSearchCollapser_' + facet + '"><li><a href="#tinFilter=' + facet + '">' + ucfirst(options.facetTranslations[facet] ? options.facetTranslations[facet] : facet) +
                                //'&nbsp;('  + total + ')</a><ul>' + facets_html + '</ul></ul>');
                        $('div.tinSearchFacets', container).append('<div class="hideFacet_' + facet + '">' +
                                '<h2>' + ucfirst(options.facetTranslations[facet] ? options.facetTranslations[facet] : facet) + '&nbsp;<span class="number">(' + total + ')</span></h2>' +
                                '<ul>' + facets_html + '</ul>');
								
						// Add more button to te filter in the left hand side
						$('.hideFacet_' + facet + ' ul').each(function(){
							$('li:gt(2)', this).hide();
							if ($(this, 'li').children().length > 3) {
								$(this, ':last').append('<li><a href="javascript:void(0);" class="tr_more">More...</a></li>');
							}
						});
						$('.tr_more').toggle(function(){
							$(this).closest('li').siblings().show();
							$(this).attr('class', 'tr_less').text("Less...");
						}, function(){
							$(this).closest('ul').children('li:gt(2):not(:last)').hide();
							var curr_ul_y_pos = $(this).closest('ul').prev().offset().top;
							$('html:not(:animated), body:not(:animated)').animate({
								scrollTop: curr_ul_y_pos-5
							}, 'normal');
							$(this).attr('class', 'tr_more').text("More...");
						});
						}
				}

                if (!options.disableCollapsedFacets) {
                        // Facets handling
                        $('ul.tinSearchCollapser_' + facet, container).jqcollapse({
                                slide: true,
                                speed: 500,
                                easing: 'easeOutCubic'
                        });
                } else {
                        $('div.tinSearchFacets ul ul', container).css('display', 'block');
                }
        }
}

function filterByFacet(container, facet_parent, facet, url, noresults)
{
        var params = $.deparam( url );
        var data = $(container).data('tinSearch');
        var options = data.options;

        // Temporary single facet hack
        shown_facets = data.shownFacets;
        //shown_facets = [];

        if (shown_facets[facet_parent] == undefined) {
                shown_facets[facet_parent] = [];

        }
        shown_facets[facet_parent][facet] = true;
        data.shownFacets = shown_facets;
        $(container).data('tinSearch', data);

        if (noresults) {
                return;
        }

        var facet_query_parts = [];
        var facet_parents_parts = [];
        var facet_query = '';
        var facet_parents = '';

        for (ft in shown_facets) {
                for (f in shown_facets[ft]) {
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
                        facet: facet_parents,
                        // use underscore instead of dot (.) because javascript can't handle dots
                        // replace the dot in tinsearch_proxy.php
                        fq: facet_query,
                        rows: options.resultsPerPage
                }),
                success: function(responseText) {
                        var jsonObject = eval('(' + responseText + ')');
                        // render search results
                        displaySearchResults(container, jsonObject, 0, true);
                        parseTagCloud(container, jsonObject);
                }
        });
}