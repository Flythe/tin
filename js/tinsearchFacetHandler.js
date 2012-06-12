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

        if(params) {
                if (params.tinFilter) {
                        shown_facets = params.tinFilter;
                        shown_facets = shown_facets.split();
                        $.each(shown_facets, function(key, facet){
                                extra_facets += ',' + facet;
                        });
                }
        }
        
        $('div.tinSearchMenu').css('border-right', '1px solid black');
        
        for (var k = 0; k < jsonObject.facets.length; k++) {
                var facet = jsonObject.facets[k].field;
                var i;
                var total = 0;
                var facets_html = '', attr_current = '', title = '';
                var selected_facets = true, drop_facet = false, initTooltip = false;
                
                for (i = 0; i < jsonObject.facets[k].facets.length; i++) {
                        if (!parseInt(jsonObject.facets[k].facets[i].value)) {
                                continue;
                        }
                        
                        //fix for year = 0, rolbezetting = 0
                        if (jsonObject.facets[k].facets[i].title == '0')
                            jsonObject.facets[k].facets[i].title = 'onbekend';
                        
                        attr_current = '';
                        selected_facets = true

                        var f = jsonObject.facets[k].facets[i].title;
                        var facet_title = options.facetTranslations[f] ? options.facetTranslations[f] : f;
                        if (facet_title.indexOf('.') == -1) {
                                facet_title = ucfirst(facet_title);
                        }
                        
                        //highlight previously selected facets
                        if (extra_facets.match(jsonObject.facets[k].facets[i].title)) {
                                attr_current = ' class="current"';
                                selected_facets = false;
                                drop_facet = true;
                        }
                        
                        if (f == 'productie') {
                            f = 'production';
                        }
                        
                        facets_html += 
                                '<li' + attr_current + '>' +
                                        '<a href="#tinFilter=' + facet + ':' + f + ((selected_facets) ? extra_facets : '') +'&parseFacets=1" class="tinSearchAddFacet">' + facet_title + '&nbsp; <span class="number">(' + jsonObject.facets[k].facets[i].value + ')</span></a>' +
                                '</li>';
                        total += parseInt(jsonObject.facets[k].facets[i].value);
                }

                if (total > 0) {
                        if (jsonObject.facets[k].field == 'castamounts') {
                            title = 'Rolbezetting is de onderverdeling in mannen- en vrouwenrollen in een theatertekst of –productie. Mannenrollen worden aangeduid met h, vrouwenrollen met d. Een stuk met 2 mannen en 5 vrouwen heeft dus de rolbezetting 2h\\5d';
                            initTooltip = true;
                        } else if (jsonObject.facets[k].field == 'casttotal') {
                            title = 'Aantal rollen is het totaal van het aantal mannen- en vrouwenrollen in een theatertekst of –productie';
                            initTooltip = true;
                        }
                            
                        $('div.tinSearchFacets', container).append(
                                '<div class="hideFacet_' + facet + '">' +
                                    '<h2 class="tooltipEl_' + facet + '" title="' + title + '">' + ucfirst(options.facetTranslations[facet] ? options.facetTranslations[facet] : facet) + '&nbsp;<span class="number">(' + total + ')</span></h2>' +
                                    '<ul>' + facets_html + '</ul>' +
                                '</div>'
                        );
                        
                        
                        
                        // Add more button to the facets
                        $('.hideFacet_' + facet + ' ul').each(function(){
                                $('li:gt(2)', this).hide();
                                if ($(this, 'li').children().length > 3) {
                                        $(this, ':last').append('<li class="facet_toggle"><a href="javascript:void(0);" class="tr_more">(Meer)</a></li>');
                                }
                                
                                if(drop_facet) {
                                    $('li:gt(2)', this).show();
                                    $(this).children().last().remove()
                                }
                        });
                        
                        $('.tr_more').toggle(function(){
                                $(this).closest('li').siblings().show();
                                $(this).attr('class', 'tr_less').text("(Minder)");
                        }, function(){
                                $(this).closest('ul').children('li:gt(2):not(:last)').hide();
                                $(this).attr('class', 'tr_more').text("(Meer)");
                        });
                        
                        if(initTooltip) {
                            $('.tooltipEl_' + facet).qtip();
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

/*function filterByFacet(container, facet_parent, facet, url, noresults)
{
        var params = $.deparam( url );
        var data = $(container).data('tinSearch');
        var options = data.options;
        console.log('infacet');
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
}*/