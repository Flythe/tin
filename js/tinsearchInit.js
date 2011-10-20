(function($)
{
	var methods = 
        {
                tinsearchInit: function(override_opts)
                {
                        dbg('init() ' + $(this).attr('id'));
                        var opts = $.extend({}, $.fn.tinSearch.defaults, override_opts),
                        obs = this;

                        //append default css
                        /*if (!opts.disableDefaultCss && !$('#tinSearchCss').length) {
                                dbg('Inserting tinsearch.css... ', true);
                                $('<link>').appendTo('head').attr({
                                        id: 'tinSearchCss',
                                        rel:  'stylesheet',
                                        type: 'text/css',
                                        href: $.fn.tinSearch.defaults.baseUrl + opts.css,
                                        media: 'screen, projection'
                            });
                        }*/

                        //bind triggers to detect changes in each widget
                        if (!$.fn.tinSearch.initialized) {
                                $(window).bind('hashchange', function() {
                                        dbg('hashchange event called');
                                        // Iterate over all search widgets
                                        $('.tinSearch').each(function() {
                                                widgetHashChange(this);
                                        });
                                });

                                $.fn.tinSearch.initialized = true;
                        }

                        $.when(
                                $.getScript($.fn.tinSearch.defaults.baseUrl + 'jquery/jquery.easing.js'),
                                $.getScript($.fn.tinSearch.defaults.baseUrl + 'jquery/jquery.collapse.js'),
                                //$.getScript($.fn.tinSearch.defaults.baseUrl + 'jquery/jquery.autocomplete.js'),
                                $.getScript($.fn.tinSearch.defaults.baseUrl + 'jquery/jquery.ba-bbq.min.js'))
                        .then(function(result) {
                                dbg('init() ' + $.map(obs, function(ob, i) { return $(ob).attr('id'); }).join(',') + ': ajax completed');
                                obs.each(function() {
                                        //append searchwidgets
                                        if (!$(this).data('tinSearch')) {
                                            initContinue(this, opts);
                                        }
                                });

                                $(window).trigger('hashchange');
                        });

                return this;
                },

                pingAudio: function(uri) {
                        var ob = $(this),
                        data = ob.data( 'tinSearch' ),
                        options = data.options,
                        button = $('input[value="' + uri + '"]').parent();

                        if (!button.length)
                                button = $('button[value="' + uri + '"]').parent();

                        dbg('pingAudio(' + uri + ') button: ' + button.length + ' ob: ' + ob.attr('id') + ' url: ' + options.proxy);

                        $.ajax({
                                url: options.proxy,
                                global: false,
                                type: 'GET',
                                dataType: 'html',
                                data: ({
                                    getstatus: uri,
                                    rnd: Math.floor(Math.random()*9999999),
                                    noqueue: 1
                                }),
                                success: function(responseText) {
                                    responseText = $.trim(responseText);
                                    dbg('response: ' + responseText);
                                    switch (responseText) {
                                        case '200':
                                            $('span.tinPlayMessage', ob).remove();
                                            $('<embed type="application/x-shockwave-flash" flashvars="audioUrl=' +uri + '&autoPlay=true" src="http://www.google.com/reader/ui/3523697345-audio-player.swf" width="300" height="37" quality="best"></embed>').insertAfter(button);
                                            break;
                                        case '503':
                                            dbg("PING $('#" + ob.attr('id') + "').tinSearch('pingAudio', '" + uri + "')");
                                            setTimeout("jQuery('#" + ob.attr('id') + "').tinSearch('pingAudio', '" + uri + "')", 5000);
                                            break;
                                        default:
                                            $('span.tinPlayMessage', ob).remove();
                                            $('<span class="tinPlayMessage">Het audiobestand is helaas niet beschikbaar.</span>').insertAfter(button);
                                            break;
                                    }
                                }
                        });
                },

                thesaurusAutocomplete: function(value, thesaurusData)
                {
                        //is called on thesaurus input change, calls to result handler
                        var container = $(this);
                        $.ajax({
                                url: $.fn.tinSearch.defaults.proxy,
                                global: false,
                                type: 'GET',
                                dataType: 'html',
                        data: ({
                                getthesaurus: value,
                                rnd: Math.floor(Math.random()*9999999)
                        }),
                                success: function(responseText) {
                                        if(enableJsonDebug && !responseText)
                                                alert('json krijgt geen antwoord');
                                        
                                        var jsonObject = eval('(' + responseText + ')');
                                        //replace value in thesaurus input field
                                        $('.tinSearchThesaurusInput', container).val(value);
                                        thesaurusRelated(container, value, thesaurusData, jsonObject);
                                }
                        });
                },

                destroy: function()
                {
                        return this.each(function() {
                                var $this = $(this);
                                var data = $this.data('tinSearch');

                                // Namespacing FTW
                                $(window).unbind('.tinSearch');
                                data.tinSearch.remove();
                                $this.removeData('tinSearch');
                        })
                }
        };

	$.fn.tinSearch = function(method)
	{
		dbg('tinSearch() ' + $.map(this, function(ob, i) { return $(ob).attr('id'); }).join(','));
		if (methods[method]) {
			methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || ! method) {
			return methods.tinsearchInit.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.tinSearch');
		}
	};

	$.fn.tinSearch.hoverdelay = null;

	$.fn.tinSearch.initialized = false;

	var burl = unescape(window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1));
	switch (burl) {
                case 'http://127.0.0.1/tinsearch/':
                case 'http://127.0.0.1/TINsearch/':
		case 'http://dev.lucene.nl/':
		case 'http://src.tin.nl/zoek/':
		case 'http://src.tin.nl/test/':
		case 'http://src.tin.nl/search/':
                case 'http://src.tin.nl/devtest/':
			break;
		default:
			burl = 'http://catalogus.tin.nl/';
	}
        
        $.fn.tinSearch.defaults = 
        {
                baseUrl: burl,
                proxy: 'tinsearch_proxy.php',
                def_facets: [
                        { name: 'type', title: 'Bron', def: null },
                        { name: 'materialtype', title: 'Materiaaltype', def: null },
                        { name: 'casttotal', title: 'Cast totaal', def: null },
                        { name: 'year', title: 'Jaar', def: null },
                        { name: 'castamount', title: 'Cast hoeveelheid', def: null }
                ],
                startpos: 0,
                resultsPerPage: 10,
                changeResultsOnType: true,
                autoComplete: true,
                searchSuggestionText: 'Bedoelde u: {SUGGESTION}?',
                prevPageArrow: '&#x25C0;',
                nextPageArrow: '&#x25BA;',
                prevPageHtml: '{PREVARR}<a href="{URL}" class="tinNavLink">Vorige</a>',
                nextPageHtml: '<a href="{URL}" class="tinNavLink">Volgende</a>{NEXTARR}',
                searchButtonLabel: 'Zoeken',
                advancedLinkLabel: 'Uitgebreid',
                resetLinkLabel: 'Reset',
                searchMenuPosition: 'right',
                useFacets: [/*'type',*/ 'materialtype', 'casttotal', 'castamounts', 'year'],
                defaultInput: 'zoeknaam hier',
                mediaserver: 'http://mediaserver.tin.nl/img/',
                mediaserversrc: 'http://src.tin.nl/devtest/images/',
                facetTranslations: {
                        type: 'Bron',
                        materialtype: 'Materiaaltype',
                        casttotal: 'Rolbezetting',
                        year: 'Jaar',
                        castamounts: 'Aantal rollen',
                        ChoiceCollect: 'TIN Collectie',
                        ChoiceFullCatalogue: 'TIN Catalogus',
                        ChoiceProductions: 'TIN Producties',
                        ChoicePeople: 'TIN Mensen',
                        foto: "Foto's",
                        title: 'Titel',
                        author: 'Maker',
                        subject: 'Trefwoord'
                        
                }
        };
})(jQuery);

function initContinue(ob, opts)
{
        dbg('initContinue() ' + $(ob).attr('id'));
        if (opts.changeResultsOnType) {
                $('input.tinSearchInput', ob).live('keyup', function(e) {
                        changeResultsOnType(ob, $('.tinSearchAdlibSearchfield').val() !== '*');
                });
        }        

        // Handle suggestions
        $('div.tinSearchSuggestion a, div.tinTagCloud a', ob).live('click', function() {
                $('input.tinSearchInput', ob).val($(this).text());
        });

        /*$('div.tinPageNav a', ob).live('click', function() {
                var facet_data = $(this).attr('name').split(':');
                gotoPage(ob, facet_data[1]);
                return false;
        });*/

        //add show and hide trigger, searchdetails for photo and audio results
        $('div.tinSearchPhoto, div.tinSearchAudio', ob).live('mouseenter', function() {
                if ($.fn.tinSearch.hoverdelay) {
                        clearTimeout($.fn.tinSearch.hoverdelay);
                        $.fn.tinSearch.hoverdelay = null;
                }
                
                var ob2 = $(this);
                $.fn.tinSearch.hoverdelay = setTimeout(function() {
                        var detail = jQuery('div.tinSearchDetail', ob2.parent());
                        detail.show();
                        detail.css('left', -(parseInt(detail.width()) - parseInt(ob2.width())) / 2);
                }, 500);    
        }).live('mouseleave', function() {
                if ($.fn.tinSearch.hoverdelay) {
                        clearTimeout($.fn.tinSearch.hoverdelay);
                        $.fn.tinSearch.hoverdelay = null;
                }
        });

        $('div.tinSearchDetail', ob).live('mouseleave', function() {
                $(this).hide();
                if ($.fn.tinSearch.hoverdelay) {
                        clearTimeout($.fn.tinSearch.hoverdelay);
                        $.fn.tinSearch.hoverdelay = null;
                }
        });

        $('button.tinPlayButton', ob).live('click', function() {
                var button = $(this);
                var button_val = $('input', button).attr('value');
                if (!button_val) button_val = button.attr('value');
                button.hide();

                $.ajax({
                                url: opts.proxy,
                                global: false,
                                type: 'GET',
                                dataType: 'html',
                                data: ({
                                getstatus: button_val,
                                rnd: Math.floor(Math.random()*9999999)
                        }),
                        success: function(responseText) {
                                dbg('response: ' + responseText);
                                switch (responseText) {
                                        case '200':
                                                $('<embed type="application/x-shockwave-flash" flashvars="audioUrl=' + button_val + '&autoPlay=true" src="http://www.google.com/reader/ui/3523697345-audio-player.swf" width="300" height="27" quality="best"></embed>').insertAfter(button);
                                                break;
                                        case '503':
                                                $('<span class="tinPlayMessage">U bent de eerste die dit bestand opvraagt.<br />Daarom graag even geduld. Het bestand<br />wordt eenmalig opgehaald en bewerkt. <img src="' + $.fn.tinSearch.defaults.baseUrl + 'images/ajax-loader.gif" /></span>').insertAfter(button);
                                                var container = getSearchContainer(button);
                                                setTimeout("jQuery('#" + container.attr('id') + "').tinSearch('pingAudio', '" + button_val + "')", 5000);
                                                break;
                                        default:
                                                $('<span class="tinPlayMessage">Het audiobestand is helaas niet beschikbaar.</span>').insertAfter(button);
                                                break;
                                }
                        }
                });
        });

        //build HTML
        $(ob).addClass('tinSearch').html(
                getMainStruc(opts)
        ).data('tinSearch', {
                pictureDisplay: false,
                shownFacets: [],
                lastOnType: '',
                lastField: '',
                prevCall: '',
                options: opts,
                tinSearch: $(ob),
                bbq: { cache: { '': $(ob) } }
        });
        
        //searchtype change
        $('img.normalSearch, img.thumbSearch', ob).live('click', function() {
                var params = getSearchParams(ob);
                
                if($(this).hasClass('normalSearch')){
                        params.tinSearchType = "normal";
						$("img.normalSearch").attr("src", "images/button_alles.jpg");
						$("img.thumbSearch").attr("src", "images/button_afbeeldingen.jpg");

                } else {
						$("img.normalSearch").attr("src", "images/button_alles_disable.jpg");
						$("img.thumbSearch").attr("src", "images/button_afbeeldingen_enable.jpg");
                        params.tinSearchType = "thumbs";
				}
                
                $('a.hiddenUpdater', ob).fragment($.param( params ));
                $('a.hiddenUpdater', ob).click();
                return false;
        });
        
        // Handle search input field
        $('input.tinSearchInput', ob).live('keyup', function(e) {
                if(e.which == 13) {
                        e.preventDefault();
                        dbg('input.tinSearchInput: ENTER pressed.');
                        
                        var params = getSearchParams(ob);
                        var data = $(ob).data( 'tinSearch' );
                        data.enter = true;
                        
                        params.tinSearchInput = $(this).val();
                        
                        search(ob, $.param(params));
                        return false;
                } else {
						var params = getSearchParams(ob);
                        var data = $(ob).data( 'tinSearch' );
                        data.enter = true;
                        
                        params.tinSearchInput = $(this).val();
                        search(ob, $.param(params));
				}
        });
        
        // Handle searchfield change
        $('select.tinSearchAdlibSearchfield', ob).change(function(){
                var params = getSearchParams(ob);

                params.tinSearchAdlibSearchfield = $(this).val();

                $('a.hiddenUpdater', ob).fragment($.param( params ));
                $('a.hiddenUpdater', ob).click();
        });
        
        // Handle search or/and change
        $('input.tinSearchOr', ob).change(function() {
                var params = getSearchParams(ob);

                params.combineSearch = $(this).val();

                $('a.hiddenUpdater', ob).fragment($.param( params ));
                $('a.hiddenUpdater', ob).click();
        });
        
        $('h4.tinUitgebreid', ob).live('click', function() {
                showMenu(ob);
        });

        //append functions to link elements in previously build HTML
        $('a', ob).live('click', function(e) {
                var state = {},

                // Get the id of this .bbq widget.
                id = $(ob).attr( 'id' ),

                // Get the url from the link's href attribute, stripping any leading #.
                url = $(this).attr( 'href' );
                var pos = url.indexOf('#') + 1;

                if (pos == -1) {
                        return true;
                }

                url = url.substring(pos);
                if (url == $(this).attr( 'href' )) {
                        return true;
                }

                dbg("<hr>a[href^=#].live('click') id=["  + id + '] url=[' + url + ']... ', true);
                
                var params = $.deparam( url );
                var data = $(ob).data( 'tinSearch' );
                
                if (params.tinSearchReset) {
                        params = {};
                } else {
                        var tinInput = $('input.tinSearchInput', ob).val();
                        
                        //remove search value
                        if (tinInput && !$(this).hasClass('tinRemoveSearchInput')) {
                                params.tinSearchInput = tinInput;
                        } else if (tinInput && $(this).hasClass('tinRemoveSearchInput')) {
                                data.q = '';
                                $('input.tinSearchInput', ob).val('');
                                
                                $(this).parent().remove();
                        } else {
                                if (params.tinSearch) {
                                        delete params.tinSearch;
                                }
                                if (params.tinSearchInput) {
                                        delete params.tinSearchInput;
                                }
                        }
                        
                        if ($(this).hasClass('tinRemoveTheSaurus')) {
                                delete params.theSaurus;
                                data.theSaurus = '';
                                $('input.tinSearchThesaurusValue', ob).val('');
                        }
                        
                        if ($(this).hasClass('tinRemoveFacet')) {
                                $(this).parent().remove();
                        }
                        
                        if ($(this).hasClass('tinSearchToggleThesaurus')) {
                                var thesaurus = $('div.tinSearchThesaurus', ob);
                                
                                if($('input.tinSearchThesaurusValue', ob).val() != '')
                                        params.theSaurus = $('input.tinSearchThesaurusValue', ob).val();
                                
                                thesaurus.slideToggle(thesaurus.is(':hidden') ? 400 : 200);
                        }
                }
                
                //alert($.param( params ));
                state[ id ] = $.param( params );

                dbg('new state url=[' + state[id] + ']');
                $('a.hiddenUpdater', ob).attr('href', '');
                $.bbq.pushState( state );
                
                // And finally, prevent the default link click behavior by returning false.
                return false;
        });
        
        $('button.tinSearchThesaurusOk', ob).live( 'click', function(e) {
                var value = $('input.tinSearchThesaurusInput', $(this).parent()).val() 
                        ? '"' + $('input.tinSearchThesaurusInput', $(this).parent()).val() + '"' 
                        : "";
                $('input.tinSearchThesaurusValue', ob).val(value);
                $('a.tinSearchToggleThesaurus')[0].click();
        });

        if (opts.disableFacets && opts.disableTagCloud && opts.searchMenuPosition == 'right') {
                $('div.tinSearchContainer, div.tinPageNav', ob).width('100%');

                if (opts.disableTabs) {
                        $(ob).css('border-top', 0);
                }
        }

        //setTimeout("jQuery('input.tinSearchInput').each(function() { jQuery(this).width(Math.floor(jQuery(this).width())); });", 100);

        if (opts.css) {
                for (var i = 0; i < opts.css.length; i++) {
                        $.rule(opts.css[i]).appendTo('style');
                }
        }

        // Handle initial search (?tinSearchInput=search+words)
        var q = getSearchParams(ob);
        
        if (q.tinSearchInput) {                
                $('input.tinSearchInput', ob).val(q.tinSearchInput);
                
                if(q.tinSearchAdlibSearchfield)
                        $('select.tinSearchAdlibSearchfield', ob).val(q.tinSearchAdlibSearchfield);
                
                if(q.theSaurus)
                        $('input.tinSearchThesaurusValue', ob).val(q.theSaurus);
                
                if(q.tinSearchAdlibSearchfield || q.theSaurus)
                        showMenu(ob);
                        
                $('a.hiddenUpdater', ob).fragment($.param( q ));
                $('a.hiddenUpdater', ob).click();
        }
        
        if (opts.autoComplete) {
                checkAutocomplete(ob, opts);
        }
}