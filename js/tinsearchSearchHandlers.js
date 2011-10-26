function checkAutocomplete(ob, opts, url)
{
        var facet_query = '';
        var params = null;
        if (url) params = $.deparam( url );

        if (opts.facet || (params && params.tinFilter)) {
                var shown_facets;

                if (params && params.tinFilter) {
                        shown_facets = params.tinFilter;
                } else {
                        shown_facets = opts.facet;
                }

                shown_facets = shown_facets.split(',');
                var facet_query_parts = [];

                for (ft in shown_facets) {
                        var facet_data = shown_facets[ft].split(':');
                        facet_query_parts.push(facet_data[0] + ':' + facet_data[1]);
                }

                facet_query = facet_query_parts.join(',');
        }

        setTimeout("jQuery('input.tinSearchInput', jQuery('#" + $(ob).attr('id') + "')).each(function() { var ac = jQuery(this).autocomplete({ serviceUrl: '" + opts.proxy + "', fq: '" + facet_query + "', deferRequestBy: 100 }); jQuery('#" + $(ob).attr('id') + "').data('autocomplete', ac); });", 100);
        setTimeout("jQuery('input.tinSearchThesaurusInput', jQuery('#" + $(ob).attr('id') + "')).each(function() { var ac = jQuery(this).autocomplete({ serviceUrl: '" + opts.proxy + "', fq: '" + facet_query + "', thesaurus: 1, deferRequestBy: 100, onSelect: function(value, data){ jQuery('#" + $(ob).attr('id') + "').tinSearch('thesaurusAutocomplete', value, data); } }); jQuery('#" + $(ob).attr('id') + "').data('autocomplete_thesaurus', ac); });", 150);
}

function widgetHashChange(ob)
{
        var $ob = $(ob),
        
        // Get the stored data for this .bbq widget.
        data = $ob.data( 'tinSearch' ),
        options = data.options,
        
        // Get the url for this .bbq widget from the hash, based on the
        // appropriate id property. In jQuery 1.4, you should use e.getState()
        // instead of $.bbq.getState().
        url = $.bbq.getState( $ob.attr( 'id' ) ) || '';
        var params = $.deparam( url );
        
        dbg('widgetHashChange() ' + $ob.attr('id') + ': data.url=[' + data.url + '] url=[' + url + '] tinSearchInput: [' + params.tinSearchInput + '] ... ', true);
        // If the url hasn't changed, do nothing and skip to the next .bbq widget.
        if ( data.url === url ) {
                dbg('no url change, done.');
                return;
        }
        
        dbg('url changed ', true);

        // Store the url for the next time around.
        var prevparams = data.url ? $.deparam(data.url) : {};

        data.url = url;

        // Todo: cache
        if ( 0 && data.bbq.cache[ url ] ) {
                dbg('(in cache)');
                // Since the widget is already in the cache, it doesn't need to be
                // created, so instead of creating it again, let's just show it!
                
                data.bbq.cache[ url ].show();
        } else {
                //dbg('(not in cache) ... ', true);

                var isEmpty = true;
                for (var prop in params) {
                    if (params.hasOwnProperty(prop)) {
                            isEmpty = false;
                            break;
                    }
                }
                
                if (isEmpty) {
                        $('input.tinSearchInput', ob).val('');
                        $('div.tinSearchNumberOfResults', ob).html('');
                        $('div.tinSearchSuggestion', ob).remove();
                        $('div.tinSearchResults', ob).html('');
                        $('div.tinTagCloud', ob).html('');
                        $('div.tinPageNav', ob).html('').hide();
                        $('div.tinSearchFacets', ob).html('');
                        dbg('calling getFacets()');

                        if (!options.disableFacets && !options.disableInitialFacets) {
                                getFacets(ob, null, options);
                        }
                        $('input.tinSearchInput', ob).focus();
                } else {
                        /*if ((params.tinSearchInput && params.tinSearchInput != prevparams.tinSearchInput) || (prevparams.tinSearchInput != params.tinSearchInput) || (params.tinPage && params.tinPage != prevparams.tinPage) || (params.tinFilter && params.tinFilter != prevparams.tinFilter) || (prevparams.tinFilter != params.tinFilter)) {*/
                        if ( prevparams.tinPage != params.tinPage 
                                || prevparams.tinFilter != params.tinFilter 
                                || prevparams.tinSearchAdlibSearchfield != params.tinSearchAdlibSearchfield 
                                || params.deleteSearchInput 
                                || prevparams.tinSearchInput != params.tinSearchInput 
                                || prevparams.tinSearchType != params.tinSearchType 
                                || prevparams.theSaurus != params.theSaurus 
                                || prevparams.combineSearch != params.combineSearch
                                || data.enter) {
                                
                                dbg('calling search()');
                                if(data.enter && params.tinSearchInput != '') {
                                        params.tinSearchInput = params.tinSearchInput.substring(0, params.tinSearchInput.length-1);
                                        data.enter = false;
                                }
                                
                                search(ob, url);
                        }

                        if (params.tinSlide)
                                delete params.tinSlide;

                        if (params.tinSearchThesaurus) {
                                if (params.tinSearchThesaurus == '1') {
                                        delete params.tinSearchThesaurus;
                                } else {
                                        params.tinSearchThesaurus = '1';
                                }
                        }
                        
                        dbg('fragment a.tinSearchToggleAdvanced url=[' + $.param( params )+ ']');
                        //if (typeof params.parseFacets != 'undefined') delete params.parseFacets;
                        //$('a.tinSearchToggleAdvanced,a.tinSearchToggleAdlib,a.tinSearchToggleThesaurus', ob).fragment( $.param( params ) );
                }
        }

        $ob.data( 'tinSearch', data )
}

function search(ob, url)
{
        var params = $.deparam( url );
        var data = $(ob).data('tinSearch');
        var options = data.options;
        
        if(params.tinSearchInput === options.defaultInput)
                params.tinSearchInput = '';

        data.q = params.tinSearchInput;
        data.searchField = params.tinSearchAdlibSearchfield;
        data.combineSearch = params.combineSearch;
        data.theSaurus = params.theSaurus;
        
        if (!data.q)
                data.q = $('input.tinSearchInput', ob).val();
        
        if(!data.searchField)
                data.searchField = $('select.tinSearchAdlibSearchfield', ob).val();
        
        if(!data.combineSearch)
                data.combineSearch = $('input[name=tinSearchOr]:checked', ob).val();
        
        if(!data.theSaurus)
                data.theSaurus = $('input.tinSearchThesaurusValue', ob).val();
        
        if(data.q === options.defaultInput)
                data.q = '';        

        var facet_names = [];
        var facet_query = '';
        var pnmbr = params.tinPage ? params.tinPage - 1 : 0;
        var start = pnmbr * options.resultsPerPage;
        
        if (!options.facet && !params.tinFilter) {
                var facets = $.fn.tinSearch.defaults.def_facets;
                for (k = 0; k < facets.length; k++) {
                        facet_names.push(facets[k].name);
                }
        } else {
                var shown_facets;
                
                if (params.tinFilter) {
                        shown_facets = params.tinFilter;
                } else {
                        shown_facets = options.facet;
                }
                shown_facets = shown_facets.split(',');
                var facet_query_parts = [];

                for (ft in shown_facets) {
                        var facet_data = shown_facets[ft].split(':');
                        facet_query_parts.push(facet_data[0] + ':' + facet_data[1]);
                        facet_names.push(facet_data[0]);
                }

                facet_query = facet_query_parts.join(',');
        }
        
        $(ob).data('tinSearch', data);

        if (facet_query == 'type:undefined') facet_query = '';

        if ($(ob).data('autocomplete') && facet_query) {
                $(ob).data('autocomplete').options.params.fq = facet_query;
        }
        
        if(data.theSaurus)
                        facet_query += ',keywords:' + data.theSaurus;
                
        //if ($(ob).data('autocomplete_thesaurus')) {
                //$(ob).data('autocomplete_thesaurus').options.params.fq = facet_query + '&thesaurus=1';
        //}
        
        dbg('search(): url=[' + url + '] q=[' + data.q + '] ... ');

        if(data.prevCall)
                data.prevCall.abort();
        
        $('input.tinSearchInput', ob).addClass('loading');
        
        data.prevCall = $.ajax({
                url: options.proxy,
                global: false,
                type: 'POST',
                dataType: 'html',
                data: ({
                        q: messageQuery(data.q, data.searchField, data.combineSearch),
                        // use underscore instead of dot (.) because javascript can't handle dots
                        // replace the dot in tinsearch_proxy.php
                        facet: options.useFacets.join(','),
                        facetSortAlpha: options.useFacets.join(','),
                        fq: facet_query,
                        start: start,
                        rows: options.resultsPerPage
                }),
                success: function(responseText) {
                        var jsonObject = eval('(' + responseText + ')');
                        // render search results
                        dbg('calling displaySearchResults ... ');
                        
                        displaySearchResults(ob, jsonObject, params.tinPage ? params.tinPage - 1 : 0, params.tinSlide ? true : false, params.tinSearchType == "thumbs" ? true : false);
                        
                        var data = $(ob).data('tinSearch');
                        $(ob).data('tinSearch', data);

                        if ($('div.tinSearchFacets', ob).html() == '' || typeof params.parseFacets == 'undefined' || params.parseFacets == '1')
                                parseFacets(ob, jsonObject);

                        $('a.hiddenUpdater', ob).fragment($.param( params ));

                        parseTagCloud(ob, jsonObject);
                        
                        parseParams(ob, params);
                        
                        if($('input.tinSearchInput', ob).val() == '')
                                $('input.tinSearchInput', ob).val(data.q);
                        
                        $('input.tinSearchInput', ob).removeClass('loading');
                }
        });
}

function parseParams(ob, params) {
        if (params.tinSlide) {
                delete params.tinSlide;
        }

        //remove facet from url
        var facetParams = new cloneObject(params);
        var existingFacets = $('a.tinRemoveFacet', ob);
        var existingSearchInputs = $('a.tinRemoveSearchInput', ob);
        $.each(existingSearchInputs, function(key, facet) {
                existingFacets.push(facet);
        });
        //console.log(existingFacets);
        if(existingFacets) {
                if(existingFacets.length > 1) {
                        var newParams;
                        var button;

                        existingFacets.each(function() {
                                button = $(this);
                                newParams = new cloneObject(params);
                                //console.log(button);
                                if(newParams.tinFilter) {
                                        newParams.tinFilter = newParams.tinFilter.split(',');
                                        newParams.tinFilter = $.grep(newParams.tinFilter, function(filter){
                                                return (filter != button.attr('value'));
                                        })
                                        
                                        if(newParams.tinFilter.length > 0)
                                                newParams.tinFilter = newParams.tinFilter.join(',');
                                        else
                                                delete newParams.tinFilter;
                                }

                                if(newParams.tinSearchInput) {
                                        newParams.tinSearchInput = newParams.tinSearchInput.split(' ');
                                        newParams.tinSearchInput = $.grep(newParams.tinSearchInput, function(filter){
                                                return (filter != button.attr('value'));
                                        })

                                        newParams.tinSearchInput = newParams.tinSearchInput.join(' ');
                                }
                                
                                if ($('a.tinRemoveFacet', ob).length == 1 && newParams.parseFacets) delete newParams.parseFacets;
                                if (existingSearchInputs.length == 1) delete newParams.tinSearchInput;
                                
                                $(this).fragment($.param( newParams ));
                        });
                } else {
                        if (facetParams.tinFilter) delete facetParams.tinFilter;
                        if (facetParams.tinPage) delete facetParams.tinPage;
                        if (typeof facetParams.parseFacets != 'undefined') delete facetParams.parseFacets;
                        $('a.tinRemoveFacet', ob).fragment($.param( facetParams ));
                        
                        var removeSearchInputParams = new cloneObject(params);
                        if (removeSearchInputParams.tinPage) delete removeSearchInputParams.tinPage;
                        if (removeSearchInputParams.tinSearch) delete removeSearchInputParams.tinSearch;
                        if (removeSearchInputParams.tinSearchInput) delete removeSearchInputParams.tinSearchInput;
                        if (typeof removeSearchInputParams.parseFacets != 'undefined') delete removeSearchInputParams.parseFacets;
                        $('a.tinRemoveSearchInput', ob).fragment($.param(removeSearchInputParams));
                }
        }
        
        if (facetParams.tinFilter) delete facetParams.tinFilter;
        if (facetParams.tinPage) delete facetParams.tinPage;
        if (typeof facetParams.parseFacets != 'undefined') delete facetParams.parseFacets;
        dbg("$('div.tinSearchFacets a,div.tinSearchTabs a,a.tinRemoveFacet').fragment('" + $.param( facetParams ) + "');");
        $('div.tinSearchFacets a,div.tinSearchTabs a', ob).fragment($.param( facetParams ));
        
        //thesaurus facets
        var saurusParams = new cloneObject(params);
        delete saurusParams.theSaurus;
        $('a.tinRemoveTheSaurus', ob).fragment($.param(saurusParams));
        $('a.tinSearchToggleThesaurus').fragment($.param(saurusParams));
        
        //eenvoudig zoeken
        var zoekenParams = {};
        zoekenParams.tinSearchInput = params.tinSearchInput;
        $('a.eenvoudigZoeken', ob).fragment($.param( zoekenParams ));
        
        /*
        var removeSearchInputParams = new cloneObject(params);
        if (removeSearchInputParams.tinPage) delete removeSearchInputParams.tinPage;
        if (removeSearchInputParams.tinSearch) delete removeSearchInputParams.tinSearch;
        if (removeSearchInputParams.tinSearchInput) delete removeSearchInputParams.tinSearchInput;
        if (typeof removeSearchInputParams.parseFacets != 'undefined') delete removeSearchInputParams.parseFacets;
        dbg("$('a.tinRemoveSearchInput').fragment('" + $.param(removeSearchInputParams) + "');");
        $('a.tinRemoveSearchInput', ob).fragment($.param(removeSearchInputParams));
         */

        var navParams = new cloneObject(params);
        if (navParams.tinPage) delete navParams.tinPage;
        if (typeof navParams.parseFacets != 'undefined') delete navParams.parseFacets;
        dbg('frament a.tinNavLink url=[' + $.param(navParams) + ']');
        $('a.tinNavLink', ob).fragment($.param(navParams));
}

function changeResultsOnType(ob)
{        
        var container = $(ob);
        var data = $(container).data('tinSearch');
        var lastInput = data.lastOnType;
        var lastField = data.lastField;
        var searchInput = $('input.tinSearchInput', container).val();
        var currentSearchField = $('select.tinSearchAdlibSearchfield', container).val();
        dbg('Lastinput: [' + lastInput + '] searchInput: [' + searchInput + ']');
        
        if (lastInput == searchInput && lastField == currentSearchField)
                return;
        
        data.lastOnType = searchInput;
        data.lastField = currentSearchField;
        $(container).data('tinSearch', data);

        var url = $.bbq.getState( $(container).attr( 'id' ) ) || '';
        var params = $.deparam( url );

        if($('input.tinSearchInput', ob).val())
                params.tinSearchInput = $('input.tinSearchInput', ob).val();
        else
                delete params.tinSearchInput;

        if(!params.tinFilter)
                delete params.tinFilter;
        
        if(params.tinPage)
                params.tinPage = 1;
        
        $('a.hiddenUpdater', ob).fragment($.param( params ));
        $('a.hiddenUpdater', ob).click();
}

function displaySearchResults(container, jsonObj, pnmbr, slide, photodisp)
{
        dbg('displaySearchResults() ' + $(container).attr('id') + ': ', true);
        var nmbrOfResults = jsonObj.numResults;
        var nmbrOfResultsHtml = getResultsHeader(container, jsonObj, pnmbr);
        var data = $(container).data('tinSearch');
        var options = data.options;

        var suggestion = !jsonObj || !jsonObj.suggestions || !jsonObj.suggestions.length ? false : jsonObj.suggestions[0];
        var suggestion_str = '';
        
        /* suggestion disabled */
        if (false !== suggestion && 0) {
                suggestion_str = '<div class="tinSearchSuggestion">'
                        + options.searchSuggestionText.replace(/\{SUGGESTION\}/, '<a href="#tinSearch=1&tinSearchInput=' + escape(suggestion) + '">' + suggestion + '</a>')
                        + '</div>';
        } else {
                $('div.tinSearchSuggestion').remove();
        }
        
        if (!jsonObj.docs || !jsonObj.docs.length || nmbrOfResultsHtml === false) {
                dbg('reset ... ', true);
                $('div.tinSearchNumberOfResults', container).html(nmbrOfResultsHtml == false ? '' : '<h1>' + nmbrOfResultsHtml + '</h1>');
                $('div.tinSearchSuggestion').remove();
                $('div.tinSearchResults', container).html('');
                $('div.tinTagCloud', container).html('');
                $('div.tinPageNav', container).html('').hide();

                if (suggestion) {
                        $('.tinSearchNumberOfResults', container).after(suggestion_str);
                }

                return;
        } else {
                dbg('showing ... ', true);
                $('.tinSearchNumberOfResults', container).html('<h1>' + nmbrOfResultsHtml + '</h1>');
        }

        var str_html = '';
        var docs = jsonObj.docs;

        var i = 0;

        while (i < docs.length) {
                if (photodisp) {
                        str_html += getSearchPhoto(docs[i], options, i);
                /*} else if (options.jukebox) {
                        str_html += getSearchAudio(docs[i], options);*/
                } else {
                        str_html += getSearchEntry(docs[i], options);
                }

                i++;
        }
        
        if (photodisp) {
                str_html += '<div class="tinClear"></div>';
        }
        
        var navoptions = {
                itemsPerPage: options.resultsPerPage,
                prevPageArrow: options.prevPageArrow,
                nextPageArrow: options.nextPageArrow,
                prevPageHtml: options.prevPageHtml,
                nextPageHtml: options.nextPageHtml
        };

        $('div.tinSearchSuggestion').remove();
        
        if (suggestion) {
                $('div.tinSearchNumberOfResults', container).after(suggestion_str);
        }

        /*if (true === slide) {
                $('div.tinSearchResults', container).slideUp('slow', function() {
                        $(this).html(str_html);
                        $(this).slideDown('slow');
                        $('html, body').animate({scrollTop:0}, 'slow');
                });
                if (docs.length || false === suggestion) {
                        $('div.tinPageNav', container).tinPageNav(pnmbr + 1, nmbrOfResults, navoptions);
                }
        } else {*/
        
       
        $('div.tinSearchResults', container).html(str_html);
        if (docs.length || false === suggestion) {
                $('div.tinPageNav', container).tinPageNav(pnmbr + 1, nmbrOfResults, navoptions);
        }
        
        // On hover, show and hide extra info on each result
        if(!photodisp)
                $('div.tinSearchResults', container).children().each(function() {
                        $(this).hover(
                                function(){ $(this).css( 'background-color', '#F3F3F3' ); $( 'a.resultSelect, p.pHidden', this ).show(); },
                                function(){ $(this).css( 'background-color', '#FFF' ); $( 'a.resultSelect, p.pHidden', this ).hide(); }
                        );
                });
}

function getResultsHeader(container, jsonObj, pnmbr)
{
        //dbg('getResultsHeader ' + $(container).attr('id'));
        var data = $(container).data('tinSearch');
        var options = data.options;
        var nmbrOfResults = jsonObj.numResults;
        var nmbrOfResultsHtml = nmbrOfResults + ' resultaten gevonden op: ';
        var nmbrOfResultsParts = [];
        var input = data.q;
        var searchField = data.searchField != '*' 
                ? options.facetTranslations[data.searchField] + ":"
                : "";
        var theSaurus = data.theSaurus.substring(1, data.theSaurus.length - 1);
        
        if (input) {
                if(!checkQuotes(input) && searchField == "") {
                        input = input.split(' ');
                        
                        $.each(input, function(key, searchinput){
                                nmbrOfResultsParts.push('<span class="inputFacet"><em>' + searchinput
                                        + '</em> <a href="#" class="tinButton tinCloseButton tinRemoveSearchInput" title="Reset zoekwoorden" value="' + searchinput + '"></a></span>');
                        });
                } else {
                        nmbrOfResultsParts.push('<span class="inputFacet"><em>' + searchField + input
                                + '</em> <a href="#" class="tinButton tinCloseButton tinRemoveSearchInput" title="Reset zoekwoorden" value="' + input + '"></a></span>');
                }
                
        }
        
        if(theSaurus) {
                nmbrOfResultsParts.push('<span class="inputFacet"><em>Thesaurusterm: ' + theSaurus
                                + '</em> <a href="#" class="tinButton tinCloseButton tinRemoveTheSaurus" title="Reset zoekwoorden" value="' + theSaurus + '"></a></span>');
        }

        var facet_parent, facet, shown_facets;

        if (!options.disableFacets) {
                var url = $.bbq.getState( $(container).attr( 'id' ) ) || '';
                var params = $.deparam( url );
                shown_facets = params.tinFilter;

                if (shown_facets) {
                        shown_facets = shown_facets.split(',');

                        for (facet in shown_facets) {
                                var facet_data = shown_facets[facet].split(':');
                                var facet_title = options.facetTranslations[facet_data[1]] ? options.facetTranslations[facet_data[1]] : facet_data[1];

                                nmbrOfResultsParts.push('<span class="facet"><em>' + facet_title + '</em> <a href="#" class="tinButton tinCloseButton tinRemoveFacet" value="' + facet_data[0] + ':'
                                        + facet_data[1] + '" title="Verwijder facet"></a></span>');
                        }
                }
        }
        
        switch (nmbrOfResultsParts.length) {
                case 0:
                        $('div.tinSearchNumberOfResults', container).html('');
                        $('div.tinSearchSuggestion').remove();
                        $('div.tinSearchResults', container).html('');
                        $('div.tinTagCloud', container).html('');
                        $('div.tinPageNav', container).html('').hide();
                        return false;
                case 1:
                        nmbrOfResultsHtml += nmbrOfResultsParts[0];
                        break;
                default:
                        nmbrOfResultsHtml += nmbrOfResultsParts.slice(0, -1).join(', ') + ' en ' + nmbrOfResultsParts[nmbrOfResultsParts.length - 1];
                        break;
        }

        if (pnmbr > 0) {
                nmbrOfResultsHtml = 'Resultaat ' + (((pnmbr + 1) * options.resultsPerPage) - options.resultsPerPage + 1) + ' t/m '
                + ((pnmbr + 1) * options.resultsPerPage > nmbrOfResults ? nmbrOfResults : (pnmbr + 1) * options.resultsPerPage) + ' van ' + nmbrOfResultsHtml;
        }
        
        return nmbrOfResultsHtml;
}

function ucfirst(str)
{
    str += '';
    return str.charAt(0).toUpperCase() + str.substr(1);
}

function getSearchPhoto(entry, options, count)
{
        var str_html = '';
        var title = !entry.title ? '' : entry.title;
        var description = !entry.description ? '' : (entry.description.length < 100 ? entry.description : entry.description.substring(0, 100) + '&hellip;') + '<br />';
        var apiuri = !entry.apiuri ? '' : entry.apiuri;
        var weburl = !entry.weburl ? '' : entry.weburl;
        var url = !entry.url ? '' : entry.url;
        var keywords = !entry.keywords ? '' : 'Tags: ' + (typeof(entry.keywords) != 'object' ? entry.keywords.split(',') : entry.keywords) + '<br />';
        var disciplines = !entry.discipline ? '' : 'Disciplines: ' + entry.discipline.join(', ') + '<br />';
        var type = !entry.type ? '' : 'Bron: ' + (options.facetTranslations[entry.type] ? options.facetTranslations[entry.type] : entry.type) + '<br />';
        var year = !entry.year || 'onbekend' === entry.year ? '' : 'Jaartal: ' + entry.year + '<br />';
		// New variable added to show year and disciplines in the image (without hover)
        var year_only = !entry.year || '' === entry.year ? '' : '' + entry.year ;
        var disciplines_only = !entry.discipline ? '' : '' + entry.discipline.join(', ') + '';

        var listingUrl = '';
        var priref = apiuri.substring(apiuri.lastIndexOf('priref=') + 7);
        if (url) {
                listingUrl = url;
        } else {
                switch (entry.type) {
                        case 'ChoiceCollect':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?collection=' + priref;
                                break;
                        case 'ChoiceFullCatalogue':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?object=' + priref;
                                break;
                        case 'ChoiceProductions':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?production=' + priref;
                                break;
                        case 'ChoicePeople':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?person=' + priref;
                                break;
                        default:
                                listingUrl = apiuri ? $.fn.tinSearch.defaults.baseUrl + 'detail.php?apiuri=' + escape(apiuri) : 0;
                                break;
                }
        }

        if(entry.images && entry.images.length){
                var numimages = entry.images.length;
                var index = 0;
                while (index < numimages) {
                        var lastItem = '';
                        var media = entry.images[index];
                        if (media.type == 'photo') {
                                if (media.webExclusion == false)
                                        media.url += '&b=190';
                                if ((count + 1)%3 == 0)
                                        lastItem = 'lastPhoto';
                                str_html += '<div class="tinSearchResultPhoto ' + lastItem + '"><div class="tinSearchPhoto"><a href="' + listingUrl + '"><img class="tinSearchResultImg" src="' + media.url + '" alt="" /></a>'
                                        + '<div class ="tinSearchResultTitle"><a href="' + listingUrl + '"><span class="title">' + title + '</span><br/><span class="info">' + disciplines_only + ' - ' + year_only + '</a></div></div>';
                        
                                if(entry.youtubeurl) {
                                        var inclURL = entry.youtubeurl.split('?v=');
                                        inclURL = inclURL[1].split('&');
                                        inclURL = inclURL[0];
                                        str_html += '<iframe width="425" height="349" src="http://www.youtube.com/embed/' + inclURL + '" frameborder="0" allowfullscreen></iframe>';
                                }
                                str_html += '</div>';
                        }
                        index++;
                }
        }

        return str_html;
}

function getSearchAudio(entry, options)
{
        var str_html = '';
        var title = !entry.title ? '' : entry.title;
        var description = !entry.description ? '' : (entry.description.length < 100 ? entry.description : entry.description.substring(0, 100) + '&hellip;') + '<br />';
        var apiuri = !entry.apiuri ? '' : entry.apiuri;
        var weburl = !entry.weburl ? '' : entry.weburl;
        var url = !entry.url ? '' : entry.url;
        var keywords = !entry.keywords ? '' : 'Tags: ' + (typeof(entry.keywords) != 'object' ? entry.keywords.split(',') : entry.keywords).join(', ') + '<br />';
        var disciplines = !entry.discipline ? '' : 'Disciplines: ' + entry.discipline.join(', ') + '<br />';
        var creators = (!entry.creators || entry.creators.length < 2 ? 'Uitvoerend artiest: ' + (!entry.creators || !entry.creators.length ? 'onbekend' : entry.creators[0]) : 'Uitvoerende artiesten: ' + entry.creators.join(', ')) + '<br />';
        var type = !entry.type ? '' : 'Bron: ' + (options.facetTranslations[entry.type] ? options.facetTranslations[entry.type] : entry.type) + '<br />';
        var year = !entry.year || 'onbekend' === entry.year ? '' : 'Jaartal: ' + entry.year + '<br />';
        var listingUrl = '';
        var priref = apiuri.substring(apiuri.lastIndexOf('priref=') + 7);
        if (url) {
                listingUrl = url;
        } else {
                switch (entry.type) {
                        case 'ChoiceCollect':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?collection=' + priref;
                                break;
                        case 'ChoiceFullCatalogue':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?object=' + priref;
                                break;
                        case 'ChoiceProductions':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?production=' + priref;
                                break;
                        case 'ChoicePeople':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?person=' + priref;
                                break;
                        default:
                                listingUrl = apiuri ? $.fn.tinSearch.defaults.baseUrl + 'detail.php?apiuri=' + escape(apiuri) : 0;
                                break;
                }
        }

        if(entry.audio && entry.audio.length){
                var numaudio = entry.audio.length;
                var index = 0;
                var play_buttons = '';
                str_html = '<div class="tinSearchResultAudio">';
                while (index < numaudio) {
                        var media = entry.audio[index];
                        if (media.type == 'audio') {
                                if (media.webExclusion == false && 0) {
                                        str_html += "todo";
                                } else {
                                        play_buttons += '<button type="button" class="tinButton tinSmallButton tinPlayButton" title="Afspelen" value="' + media.url + '.mp3"><strong>Afspelen &#x25BA;</strong><input name="mp3' + index + '" type="hidden" class="tinInputHidden" value="' + media.url + '.mp3" /></button>';

                                        //	+ '<embed type="application/x-shockwave-flash" flashvars="audioUrl=' + media.url + '.mp3" src="http://www.google.com/reader/ui/3523697345-audio-player.swf" width="300" height="27" quality="best"></embed>';
                                        if (index == numaudio - 1) {
                                                play_buttons = '<div class="tinSearchAudioPlay">' + play_buttons + '</div>';
                                                str_html += '<div class="tinSearchAudioInfo"><h1>' + (options.disableTitleLink ? '<span>' + title + '</span>': '<a href="' + (listingUrl ? listingUrl : weburl) + '" target="_blank" class="apiuri">' + title + '</a>') + '</h1>'
                                                        + (listingUrl && !options.disableCatalogusLink ? '<a href="' + weburl + '" target="_blank" class="tinSeeAlso">catalogus</a>' : '')
                                                        + '<p>' + description + type + creators + disciplines + year + keywords + '</p></div>'
                                                        + play_buttons;
                                        }
                                }


                        }
                        index++;
                }
                str_html += "</div><div class=\"tinClear\"></div>\n";
        }

        return str_html;
}

function getSearchEntry(entry, options)
{
        var str_html = '';
        var title = !entry.title ? '' : entry.title;
        var description = !entry.description ? '' : (entry.description.length < 300 ? entry.description : entry.description.substring(0, 300) + '&hellip;') + '<br />';
        var apiuri = !entry.apiuri ? '' : entry.apiuri;
        var weburl = !entry.weburl ? '' : entry.weburl;
        var url = !entry.url ? '' : entry.url;
        var materialType = !entry.materialType ? '' : 'Materiaaltype: ' + (options.facetTranslations[entry.materialType]
                ? options.facetTranslations[entry.materialType]
                : entry.materialType) + '<br />';
        var year = !entry.year || 'onbekend' === entry.year || 0 == entry.year ? '' : 'Jaartal: ' + entry.year + '<br />';
        var creators = !entry.creators ? '' : entry.creators;
        creators = creators.length > 1 ? 'Makers: ' + creators.join(', ') + '<br />' : creators == '' ? '' : 'Maker: ' + creators + '<br />';
        var publisher = !entry.publisher ? '' : 'Uitgevers: ' + entry.publisher + '<br />';
        var copyNumber = !entry.copyNumber || 0 == entry.copyNumber ? '' : 'Kopienummer: ' + entry.copyNumber + '<br/>';
        var shelfMark = !entry.shelfMark || 0 == entry.shelfMark ? '' : 'Lokatiecode: ' + entry.shelfMark + '<br/>';
        var loanStatus = !entry.loanStatus || 0 == entry.loanStatus ? '' : 'Uitleenstatus: ' + entry.loanStatus + '<br/>';
        //var keywords = !entry.keywords ? '' : 'Tags: ' + (typeof(entry.keywords) != 'object' ? entry.keywords.split(',') : entry.keywords) + '<br />';
        //var disciplines = !entry.discipline ? '' : 'Disciplines: ' + entry.discipline.join(', ') + '<br />';
        //var type = !entry.type ? '' : 'Bron: ' + (options.facetTranslations[entry.type] ? options.facetTranslations[entry.type] : entry.type) + '<br />';
        
        var imgstr = '';
        var audiostr = '';
        
        /** DEV **/
        //options.isIntern = true;
        /** DEV **/
        
        //add images
        
        if(entry.images && entry.images.length){ //fotos
                var numimages = entry.images.length;
                var index = 0;
                while (index < numimages && index < 3) {
                        var media = entry.images[index];
                        
                        if(options.isIntern == true) {
                                imgstr += '<img src="' + media.url + '&b=70" alt=""/> ';
                        } else if(media.webExclusion === false){
                                if (media.type == 'photo')
                                        imgstr += '<img src="' + media.url + '&b=70" alt=""/> ';
                        } else {
                                imgstr += '<img src="' + media.url + '" alt=""/> ';
                        } 
                        
                        index++;
                }
        } else if(entry.audio && entry.audio.length) { // audio
                var numaudio = entry.audio.length;
                index = 0;
                var play_buttons = '';
                str_html = '<div class="tinSearchResultAudio">';
                if(numaudio > 1) {
                        audiostr = '<div class="tinSearchAudioPlayText">Beluister op detailpagina</div>'
                } else {
                        var audioMedia = entry.audio[0];

                        if (audioMedia.type == 'audio') {
                                play_buttons += '<button type="button" class="tinButton tinSmallButton tinPlayButton" title="Afspelen" value="' + audioMedia.url + '.mp3"><strong>Afspelen &#x25BA;</strong><input name="mp3' + index + '" type="hidden" class="tinInputHidden" value="' + audioMedia.url + '.mp3" /></button>';

                                audiostr = '<div class="tinSearchAudioPlay">' + play_buttons + '</div>';
                        }               
                }
        } else if(entry.video && entry.video.length) { // video
                if(options.isIntern == true) {
                        imgstr += ''; //intern dus plaatje hier maken
                } else if(entry.video.webExclusion === false) {
                        imgstr += ''; //rechten zijn vrijgegeven dus plaatje hier maken
                } else {
                        imgstr += '<img src="' + entry.video.url + '" alt=""/>';
                }
        } else  {
                imgstr += '<img src="' + options.mediaserver + 'Itemnietdigitaal_klein.gif" alt=""/> ';
        }

        var listingUrl = '';
        var priref = apiuri.substring(apiuri.lastIndexOf('priref=') + 7);
        if (url) {
                listingUrl = url;
        } else {
                switch (entry.type) {
                        case 'ChoiceCollect':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?collection=' + priref;
                                break;
                        case 'ChoiceFullCatalogue':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?object=' + priref;
                                break;
                        case 'ChoiceProductions':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?production=' + priref;
                                break;
                        case 'ChoicePeople':
                                listingUrl = $.fn.tinSearch.defaults.baseUrl + 'detail.php?person=' + priref;
                                break;
                        default:
                                listingUrl = apiuri ? $.fn.tinSearch.defaults.baseUrl + 'detail.php?apiuri=' + escape(apiuri) : 0;
                                break;
                }
        }
        
        str_html += '<div class="tinSearchResult">' +
                                imgstr +
                                audiostr +
                                '<h2><a href="' + (listingUrl ? listingUrl : weburl) + '" target="_blank" class="apiuri">' + title + '</a></h2>' +
                                '<p>' +
                                        year +
                                        materialType +
                                '</p>' +
                                '<p class="pHidden">' +
                                        description +
                                        creators +
                                        publisher +
                                        copyNumber +
                                        shelfMark +
                                        loanStatus +
                                '</p>' +
                                '<div class="tinClear"></div>' +
                        '</div>';

        //add youtube
        if(entry.youtubeurl) {
                var inclURL = entry.youtubeurl.split('?v=');
                inclURL = inclURL[1].split('&');
                inclURL = inclURL[0];
                str_html += '<iframe width="425" height="349" src="http://www.youtube.com/embed/' + inclURL + '" frameborder="0" allowfullscreen></iframe>';
        }
        
        str_html += '</div>';
        
        return str_html;
}