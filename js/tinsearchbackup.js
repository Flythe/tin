var enableDebug = false;

(function($)
{
	var methods = {
		init: function(override_opts)
		{
			dbg('init() ' + $(this).attr('id'));
                        var opts = $.extend({}, $.fn.tinSearch.defaults, override_opts),
                        obs = this;

			if (!opts.disableDefaultCss && !$('#tinSearchCss').length) {
				dbg('Inserting tinsearch.css... ', true);
				$('<link>').appendTo('head').attr({
			    	id: 'tinSearchCss',
					rel:  'stylesheet',
					type: 'text/css',
					href: $.fn.tinSearch.defaults.baseUrl + 'css/tinsearch.css',
					media: 'screen, projection'
			    });
			}

			if (!$.fn.tinSearch.initialized) {
				$(window).bind('hashchange', function(e) {
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
				$.getScript($.fn.tinSearch.defaults.baseUrl + 'jquery/jquery.autocomplete.js'),
				$.getScript($.fn.tinSearch.defaults.baseUrl + 'jquery/jquery.ba-bbq.min.js'))
			.then(function(result) {

				dbg('init() ' + $.map(obs, function(ob, i) { return $(ob).attr('id'); }).join(',') + ': ajax completed');
		        obs.each(function() {
                                if (!$(this).data('tinSearch')) {
                                    initContinue(this, opts);
                                    //getFacets(this, null, opts);
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
                        
                        if (!button.length) {
                                button = $('button[value="' + uri + '"]').parent();
                        }
                        
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
                                            //dbg('OK!!');
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
                        //TODO edit:23-09 By: Allard, fixed for title instead of id, also made absolute path to proxy var
			//var data = $(this).data( 'tinSearch' ),
			//options = data.options;
                        
			var container = $(this);
			$.ajax({
                                url: $.fn.tinSearch.defaults.proxy,
                                global: false,
                                type: 'GET',
                                dataType: 'html',
    			data: ({
                                //getthesaurus: theSaurusData.id
                                getthesaurus: value,
                                
                                rnd: Math.floor(Math.random()*9999999)
    			}),
                                success: function(responseText) {
                                        var jsonObject = eval('(' + responseText + ')');
                                        //replace value in input field
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
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' +  method + ' does not exist on jQuery.tinSearch');
		}
	};

	$.fn.tinSearch.hoverdelay = null;

	$.fn.tinSearch.initialized = false;

	var burl = unescape(window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1));
	switch (burl) {
                case 'http://127.0.0.1/TINsearch/':
		case 'http://dev.lucene.nl/':
		case 'http://src.tin.nl/zoek/':
		case 'http://src.tin.nl/test/':
		case 'http://src.tin.nl/search/':
			break;
		default:
			burl = 'http://src.tin.nl/zoek/';
	}
    $.fn.tinSearch.defaults = {
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
        facetTranslations: {
                type: 'Bron',
                materialtype: 'Materiaaltype',
                casttotal: 'Cast totaal',
                year: 'Jaar',
                castamounts: 'Cast hoeveelheid',
                ChoiceCollect: 'TIN Collectie',
                ChoiceFullCatalogue: 'TIN Catalogus',
                ChoiceProductions: 'TIN Producties',
                ChoicePeople: 'TIN Mensen',
                foto: "Foto's"
        }
    };

    function initContinue(ob, opts)
    {
		dbg('initContinue() ' + $(ob).attr('id'));
		if (opts.changeResultsOnType) {
			$('input.tinSearchInput', ob).live('keyup', function(e) {
				$('input.tinSearchInput', ob).val($(this).val());
				changeResultsOnType(ob, $(this).hasClass('tinSearchAdlibInput'));
			});
		}

		// Handle search input field
		$('input.tinSearchInput', ob).live('keypress', function(e) {
			if(e.which == 13) {
				e.preventDefault();
				dbg('input.tinSearchInput: ENTER pressed.');
				$('a.tinSearchSubmit', ob).click();
				return false;
			}
		});

		// Handle suggestions
		$('div.tinSearchSuggestion a, div.tinTagCloud a', ob).live('click', function() {
			$('input.tinSearchInput', ob).val($(this).text());
			//$('a.tinSearchSubmit', ob).click();
			//return false;
		});

		/*$('div.tinPageNav a', ob).live('click', function() {
			var facet_data = $(this).attr('name').split(':');
			gotoPage(ob, facet_data[1]);
			return false;
		});*/

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
                            $('<span class="tinPlayMessage">U bent de eerste die dit bestand opvraagt.<br />Daarom graag even geduld. Het bestand<br />wordt eenmalig opgehaald en bewerkt. <img src="' + $.fn.tinSearch.defaults.baseUrl + 'ajax-loader.gif" /></span>').insertAfter(button);
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

		var searchMenu = '<div class="tinSearchMenu">' +
                '<form onSubmit="return false;">' +
                    (typeof opts.inputLabel != 'undefined'
                    	? (opts.inputLabel ? '<span class="label">' + opts.inputLabel + '</span>': '')
                    	: '<span class="label">Zoek naar:</span>') +
                    '<div class="tinClear"></div>' +
                    '<input type="text" class="tinSearchInput" name="tinSearchInput" maxlength="550" />' +
                    (!opts.disableSubmitButton ? '<a href="#tinSearch=1" class="tinSearchSubmit" onClick="this.blur()">' + opts.searchButtonLabel + '</a>' : '') +
                    '<div class="tinSearchExtra">' +
                        (!opts.disableAdvanced ? '<a href="#tinSearchAdvanced=1" class="tinSearchToggleAdvanced">' + opts.advancedLinkLabel + '</a>' : '') +
                        (!opts.disableReset ? (!opts.disableAdvanced ? ' | ' : '') + '<a href="#tinSearchReset=1" class="tinSearchReset">' + opts.resetLinkLabel + '</a>' : '') +
                    '</div>' +
                    '<div class="tinSearchLoginResults"></div>' +
                '</form>' +
            '</div>' +
            (!opts.disableAdvanced ? '<div class="tinSearchAdvanced">' +
                '<form class="tinSearchAdvancedForm" onSubmit="return false;">' +
                    // '<span class="label">Filter op:</span><br/><br/><br/>' +
                    '<input type="radio" name="tinSearchOr" value="tinSearchOr" checked="checked" /> bevat een of meer woorden<br />' +
                    '<input type="radio" name="tinSearchOr" value="tinSearchAnd" /> bevat alle woorden<br />' +
                    '<input type="radio" name="tinSearchOr" value="tinSearchPhrase" /> bevat exacte regel<br />' +
                    (!opts.disableAdlib ? '<a href="#tinSearchAdlib=1" class="tinSearchToggleAdlib">in Adlib velden zoeken</a><br />' : '') +
                    '<a href="#tinSearchAdvanced=0" class="tinButton tinCloseButton tinSearchToggleAdvanced" title="Sluit uitgebreid zoeken">X</a>' +
                 '</form>' +
            '</div>' : '') +
            (!opts.disableAdlib ? '<div class="tinSearchAdlib">' +
                '<form class="tinSearchAdlibForm" onSubmit="return false;">' +
                	'<select class="tinSearchAdlibSearchfield">' +
                                '<option value="*">Alles</option>' +
                		'<option value="title">Titel</option>' +
                		'<option value="author">Maker</option>' +
                		'<option value="subject">Trefwoord</option>' +
                		//'<option value="persons">Persoon</option>' +
                		//'<option value="organisations">Organisatie</option>' +
                		//'<option value="year">Jaar</option>' +
                		//'<option value="castamounts">Rolverdeling</option>' +
                		//'<option value="casttotal">Aantal rollen</option>' +
                		//'<option value="materialtype">Objectsoort</option>' +
                	'</select>' +
                    '<input type="text" class="tinSearchInput tinSearchAdlibInput" name="tinSearchInput" maxlength="550" /><br /><br /><br />' +
                    '<div class="tinSearchThesaurusAdd"><span class="tinSearchThesaurusPlus">+</span> <a href="#tinSearchThesaurus=1" class="tinSearchToggleThesaurus">Theater thesaurus</a> <span class="tinSearchThesaurusValue"></span></div>' +
                    '<a href="#tinSearchAdlib=0" class="tinButton tinCloseButton tinSearchToggleAdlib" title="Sluit in Adlib zoeken">X</a>' +
                 '</form>' +
            '</div>' +
            '<div class="tinSearchThesaurus">' +
                '<form class="tinSearchThesaurusForm" onSubmit="return false;">' +
                	'<h1><span>TIN</span> thesaurus</h1>' +
                	'<div class="tinSearchThesaurusBroader"><h2>broader term</h2><div></div></div>' +
                	'<div class="tinSearchThesaurusMiddle">' +
                		'<div class="tinSearchThesaurusSimilar"><h2>similar term</h2><div></div></div>' +
	                    '<br /><br /><input type="text" class="tinSearchThesaurusInput" name="tinSearchThesaurusInput" maxlength="550" /><button class="tinSearchThesaurusOk">ok</button><br /><br /><br />' +
	                    '<a href="#tinSearchThesaurus=0" class="tinButton tinCloseButton tinSearchToggleThesaurus" title="Sluit theater thesaurus">X</a>' +
	                    '<div class="tinSearchThesaurusSynonyms"><h2>synonyms</h2><div></div></div>' +
	                '</div>' +
                	'<div class="tinSearchThesaurusNarrower"><h2>narrower term</h2><div></div></div>' +
                 '</form>' +
            '</div>' : '');

    	$(ob).addClass('tinSearch').html(
    		(opts.disableFacets && opts.disableTagCloud && opts.searchMenuPosition == 'right' ? '' :
    			'<div class="tinSearchLeft">' +
    			(opts.searchMenuPosition == 'left' ? searchMenu : '') +
            	(opts.disableFacets ? '' : '<div class="tinSearchFacets"></div>') +
            	(opts.disableTagCloud ? '' : '<div class="tinTagCloud"></div>') +
            	'</div>') +
            '<div class="tinSearchContainer">' +
                (opts.disableTabs ? '' : '<div class="tinSearchTabs">' +
                    '<a href="#tinFilter=materialtype:foto">Foto\'s</a>|<a href="#tinFilter=materialtype:geluid">Geluid</a>|<a href="#tinFilter=materialtype:Video">Video</a>' +
                '</div>') +
                (opts.searchMenuPosition == 'right' ? searchMenu : '') +
                '<div class="tinSearchResultsWrapper">' +
                    '<div class="tinSearchNumberOfResults"></div>' +
                    '<div class="tinSearchResults"></div>' +
                '</div><div class="tinClear"></div>' +
                '<div class="tinPageNav"></div>' +
            '</div><div class="tinClear"></div>' + "\n"
        ).data('tinSearch', {
        	shownFacets: [],
        	currentOnTypeSeq: 1,
        	lastOnTypeSeq: 1,
        	lastOnType: '',
        	options: opts,
        	tinSearch: $(ob),
        	bbq: { cache: { '': $(ob) } }
        });

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
                        
			if (params.tinSearchReset) {
				params = {};
			} else {
				var tinInput = $('input.tinSearchInput', ob).val();

				if (tinInput && !$(this).hasClass('tinRemoveSearchInput')) {
					params.tinSearchInput = tinInput;
				} else {
					if (params.tinSearch) {
						delete params.tinSearch;
					}
					if (params.tinSearchInput) {
						delete params.tinSearchInput;
					}
				}
                                
                                
				if ($(this).hasClass('tinSearchToggleAdvanced')) {
					var advanced = $('div.tinSearchAdvanced', ob);
					advanced.slideToggle(advanced.is(':hidden') ? 400 : 200);
				}
				if ($(this).hasClass('tinSearchToggleAdlib')) {
					var adlib = $('div.tinSearchAdlib', ob);
					adlib.slideToggle(adlib.is(':hidden') ? 400 : 200);
				}
				if ($(this).hasClass('tinSearchToggleThesaurus')) {
					var thesaurus = $('div.tinSearchThesaurus', ob);
					thesaurus.slideToggle(thesaurus.is(':hidden') ? 400 : 200);
				}
			}
			
                        //alert($.param( params ));
			state[ id ] = $.param( params );
                        
			dbg('new state url=[' + state[id] + ']');
			$.bbq.pushState( state );

                        // dirty fix for not removing or adding the facets
                        if ($(this).hasClass('tinRemoveFacet') || $(this).hasClass('tinSearchAddFacet')) {
                                window.location.reload(true);
                        }
                        
			// And finally, prevent the default link click behavior by returning false.
			return false;
		});
                $('button.tinSearchThesaurusOk', ob).live( 'click', function(e) {
			//$('input.tinSearchInput', ob).val($('input.tinSearchThesaurusInput', $(this).parent()).val());
                        $('.tinSearchThesaurusValue', ob).text('"' + $('input.tinSearchThesaurusInput', $(this).parent()).val() + '"');
			$('a.tinSearchToggleThesaurus', $(this).parent()).click();
		});

        if (opts.disableFacets && opts.disableTagCloud && opts.searchMenuPosition == 'right') {
        	$('div.tinSearchContainer, div.tinPageNav', ob).width('100%');

	        if (opts.disableTabs) {
	        	$(ob).css('border-top', 0);
	        }
        } else if (opts.disableTabs) {
	   		$('div.tinSearchContainer', ob).css('margin-top', -1);
	    }

		setTimeout("jQuery('input.tinSearchInput').each(function() { jQuery(this).width(Math.floor(jQuery(this).width())); });", 100);

        if (opts.css) {
        	var i;
        	for (i = 0; i < opts.css.length; i++) {
        		$.rule(opts.css[i]).appendTo('style');
        	}
        }

		// Handle initial search (?q=search+words)
		var q;
		if (q = getGetVar('q')) {
			$('input.tinSearchInput', ob).val(q);
			$('a.tinSearchSubmit', ob).click();
		}

		if (opts.autoComplete) {
			checkAutocomplete(ob, opts);
		}
    }

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

		setTimeout("jQuery('input.tinSearchInput', jQuery('#" + $(ob).attr('id') + "')).each(function() { var ac = jQuery(this).autocomplete({ serviceUrl: '" + opts.proxy + "', fq: '" + facet_query + "', deferRequestBy: 100 }); jQuery('#" + $(ob).attr('id') + "').data('autocomplete', ac); });", 50);
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
				dbg('calling getFacets()');

				if (!options.disableFacets && !options.disableInitialFacets) {
					getFacets(ob, null, options);
				}
				$('input.tinSearchInput', ob).focus();
			} else {
				if ((params.tinSearchInput && params.tinSearchInput != prevparams.tinSearchInput) || (params.tinPage && params.tinPage != prevparams.tinPage) || (params.tinFilter && params.tinFilter != prevparams.tinFilter)) {
					dbg('calling search()');
					search(ob, url);
				}

				if (params.tinSlide) {
					delete params.tinSlide;
				}

				/*dbg('widgetHashChange continued ... fragment a:not(.tinNavLink, .tinSearchToggleAdvanced) url=[' + url + '] ', true);
				$('a:not(.tinNavLink, .tinSearchToggleAdvanced)', ob).fragment(url);*/

				if (params.tinSearchAdvanced) {
					if (params.tinSearchAdvanced == '1') {
						params.tinSearchAdvanced = '0';
					} else {
						params.tinSearchAdvanced = '1';
					}
				}
				if (params.tinSearchAdlib) {
					if (params.tinSearchAdlib == '1') {
						params.tinSearchAdlib = '0';
					} else {
						params.tinSearchAdlib = '1';
					}
				}
				if (params.tinSearchThesaurus) {
					if (params.tinSearchThesaurus == '1') {
						params.tinSearchThesaurus = '0';
					} else {
						params.tinSearchThesaurus = '1';
					}
				}
				dbg('fragment a.tinSearchToggleAdvanced url=[' + $.param( params )+ ']');
				if (typeof params.parseFacets != 'undefined') delete params.parseFacets;
				$('a.tinSearchToggleAdvanced,a.tinSearchToggleAdlib,a.tinSearchToggleThesaurus', ob).fragment( $.param( params ) );
			}

			/*
			// Show "loading" content while AJAX content loads.
			$ob.find( '.bbq-loading' ).show();

			// Create container for this url's content and store a reference to it in
			// the cache.
			data.cache[ url ] = $( '<div class="bbq-item"/>' )

			// Append the content container to the parent container.
			.appendTo( $ob.find( '.bbq-content' ) )

			// Load external content via AJAX. Note that in order to keep this
			// example streamlined, only the content in .infobox is shown. You'll
			// want to change this based on your needs.
			.load( url, function(){
				// Content loaded, hide "loading" content.
				$ob.find( '.bbq-loading' ).hide();
			});
			*/
		}

		$ob.data( 'tinSearch', data )
	}

	function search(ob, url)
	{
		var params = $.deparam( url );
		var data = $(ob).data('tinSearch');
		var options = data.options;
		var facet_names = [];
		var facet_query = '';
		var pnmbr = params.tinPage ? params.tinPage - 1 : 0;
		var start = pnmbr * options.resultsPerPage;
		var seq = data.currentOnTypeSeq;
		data.currentOnTypeSeq = seq + 1;

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
				//facet_names.push(facet_data[0]);
			}

			facet_query = facet_query_parts.join(',');
                        //facet change
			facet_names = [ 'type', 'materialtype', 'casttotal', 'castamounts', 'year' ];
		}

		data.q = params.tinSearchInput;
		if (!data.q) {
			data.q = $('input.tinSearchInput', ob).val();
		}
		$(ob).data('tinSearch', data);

		if (facet_query == 'type:undefined') facet_query = '';

		if ($(ob).data('autocomplete')) {
			$(ob).data('autocomplete').options.params.fq = 'fq=' + facet_query;
		}
		if ($(ob).data('autocomplete_thesaurus')) {
			$(ob).data('autocomplete_thesaurus').options.params.fq = 'fq=' + facet_query + '&thesaurus=1';
		}

		$('input.tinSearchInput', ob).val(data.q);
		dbg('search(): url=[' + url + '] q=[' + data.q + '] ... ');
                
		$.ajax({
			url: options.proxy,
			global: false,
			type: 'POST',
			dataType: 'html',
			data: ({
				//q: '{!q.op=AND}'+$('input.tinSearchInput').val() + '*',
				q: messageQuery(data.q),
				// use underscore instead of dot (.) because javascript can't handle dots
				// replace the dot in tinsearch_proxy.php
				facet: facet_names.join(','),
				fq: facet_query,
				start: start,
				rows: options.resultsPerPage
			}),
			success: function(responseText) {
				//alert(facet_names.join(',') + ' / ' + facet_query);
				dbg('<hr>' + responseText + '<hr>');
				dbg('search() ajax completed ... ', true);
				if ($.fn.tinSearch.lastOnTypeSeq > seq) {
					dbg('skipped');
					return;
				}
				var jsonObject = eval('(' + responseText + ')');
				// render search results
				dbg('calling displaySearchResults ... ');
				displaySearchResults(ob, jsonObject, params.tinPage ? params.tinPage - 1 : 0, params.tinSlide ? true : false);
				var data = $(ob).data('tinSearch');
				data.lastOnTypeSeq = seq;
				$(ob).data('tinSearch', data);

				if ($('div.tinSearchFacets', ob).html() == '' || typeof params.parseFacets == 'undefined' || params.parseFacets == '1') {
					parseFacets(ob, jsonObject);
				}

				parseTagCloud(ob, jsonObject);

				if (params.tinSlide) {
					delete params.tinSlide;
				}

				var facetParams = new cloneObject(params);
				if (facetParams.tinFilter) delete facetParams.tinFilter;
				if (facetParams.tinPage) delete facetParams.tinPage;
				if (typeof facetParams.parseFacets != 'undefined') delete facetParams.parseFacets;
				dbg("$('div.tinSearchFacets a,div.tinSearchTabs a,a.tinRemoveFacet').fragment('" + $.param( facetParams ) + "');");
				$('div.tinSearchFacets a,div.tinSearchTabs a,a.tinRemoveFacet', ob).fragment($.param( facetParams ));

				var removeSearchInputParams = new cloneObject(params);
				if (removeSearchInputParams.tinPage) delete removeSearchInputParams.tinPage;
				if (removeSearchInputParams.tinSearch) delete removeSearchInputParams.tinSearch;
				if (removeSearchInputParams.tinSearchInput) delete removeSearchInputParams.tinSearchInput;
				if (typeof removeSearchInputParams.parseFacets != 'undefined') delete removeSearchInputParams.parseFacets;
				dbg("$('a.tinRemoveSearchInput').fragment('" + $.param(removeSearchInputParams) + "');");
				$('a.tinRemoveSearchInput', ob).fragment($.param(removeSearchInputParams));

				//dbg('search() continued ... ', true);
				//dbg('frament a:not(.tinNavLink,div.tinSearchFacets a,div.tinSearchTabs a,div.tinTagCloud a) with url=[' + url + ']', true);
				//$('a:not(.tinNavLink,div.tinSearchFacets a,div.tinSearchTabs a,div.tinTagCloud a)').fragment(url);

				var advancedParams = new cloneObject(params);
				if (advancedParams.tinSearchAdvanced) delete advancedParams.tinSearchAdvanced;
				if (typeof advancedParams.parseFacets != 'undefined') delete advancedParams.parseFacets;
				dbg('frament a.tinSearchToggleAdvanced url=[' + $.param(advancedParams) + ']');
				$('a.tinSearchToggleAdvanced', ob).fragment($.param(advancedParams));

				var adlibParams = new cloneObject(params);
				if (adlibParams.tinSearchAdlib) delete adlibParams.tinSearchAdlib;
				if (typeof adlibParams.parseFacets != 'undefined') delete adlibParams.parseFacets;
				dbg('frament a.tinSearchToggleAdlib url=[' + $.param(adlibParams) + ']');
				$('a.tinSearchToggleAdlib', ob).fragment($.param(adlibParams));

				var thesaurusParams = new cloneObject(params);
				if (thesaurusParams.tinSearchThesaurus) delete thesaurusParams.tinSearchThesaurus;
				if (typeof thesaurusParams.parseFacets != 'undefined') delete thesaurusParams.parseFacets;
				dbg('frament a.tinSearchToggleThesaurus url=[' + $.param(thesaurusParams) + ']');
				$('a.tinSearchToggleThesaurus', ob).fragment($.param(thesaurusParams));

				var navParams = new cloneObject(params);
				if (navParams.tinPage) delete navParams.tinPage;
				if (typeof navParams.parseFacets != 'undefined') delete navParams.parseFacets;
				dbg('frament a.tinNavLink url=[' + $.param(navParams) + ']');
				$('a.tinNavLink', ob).fragment($.param(navParams));
			}
		});
	}

	function changeResultsOnType(container, isAdlibSearch)
	{
		var data = $(container).data('tinSearch');

		var lastInput = data.lastOnType;
		var searchInput = $('input.tinSearchInput', container).val();
		dbg('Lastinput: [' + lastInput + '] searchInput: [' + searchInput + ']');

		if (lastInput == searchInput) {
			return;
		}
		data.lastOnType = searchInput;
		var seq = data.currentOnTypeSeq;
		data.currentOnTypeSeq = seq + 1;
		$(container).data('tinSearch', data);

		var options = data.options;
		var facet_names = [];
		var facet_query = '';

		var url = $.bbq.getState( $(container).attr( 'id' ) ) || '';
		var params = $.deparam( url );

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
				//facet_names.push(facet_data[0]);
			}

			facet_query = facet_query_parts.join(',');
                        //facet change
			facet_names = [ 'type', 'materialtype', 'casttotal', 'castamounts', 'year' ];
		}
                
                var searchfield = '';
                var theSaurusField = '';
                
		if (isAdlibSearch) {
			searchfield = $('select.tinSearchAdlibSearchfield', container).val();
                        theSaurusField = $('span.tinSearchThesaurusValue', container).text();
                        theSaurusField = theSaurusField.substring(1, theSaurusField.length - 1);
                        //facet change
                        facet_names = [ 'type', 'materialtype', 'casttotal', 'castamounts', 'year' ];
		}

		if ($(container).data('autocomplete')) {
			$(container).data('autocomplete').options.params.fq = facet_query;
		}

		if ($(container).data('autocomplete_thesaurus')) {
			$(container).data('autocomplete_thesaurus').options.params.fq = facet_query;
		}
                
		$.ajax({
			url: options.proxy,
			global: false,
			type: 'POST',
			dataType: 'html',
			data: ({
				q: messageQuery($('input.tinSearchInput', container).val(), searchfield) + " " + theSaurusField,
				// use underscore instead of dot (.) because javascript can't handle dots
				// replace the dot in tinsearch_proxy.php
                                field: searchfield,
				facet: facet_names.join(','),
				fq: facet_query,
                                start: options.startpos,
				rows: options.resultsPerPage
			}),
			success: function(responseText) {
				dbg('<hr>' + searchfield + messageQuery($('input.tinSearchInput', container).val()) + '<br>' + responseText + '<hr>');
				if ($.fn.tinSearch.lastOnTypeSeq > seq) {
					return;
				}
				var jsonObject = eval('(' + responseText + ')');
				displaySearchResults(container, jsonObject, 0);
				var data = $(container).data('tinSearch');
				data.lastOnTypeSeq = seq;
				$(container).data('tinSearch', data);
				parseFacets(container, jsonObject);
				parseTagCloud(container, jsonObject);
			}
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

		if ($('input.tinSearchInput', container).val()) {
			nmbrOfResultsParts.push('<em>' + $('input.tinSearchInput', container).val()
				+ '</em> <a href="#" class="tinButton tinCloseButton tinRemoveSearchInput" title="Reset zoekwoorden">X</a>');
		}

		var facent_parent, facet, shown_facets;

		if (!options.disableFacets) {
			var url = $.bbq.getState( $(container).attr( 'id' ) ) || '';
			var params = $.deparam( url );
			var shown_facets = params.tinFilter;

			if (shown_facets) {
				shown_facets = shown_facets.split(',');

				for (ft in shown_facets) {
					var facet_data = shown_facets[ft].split(':');
					var facet_title = options.facetTranslations[facet_data[1]] ? options.facetTranslations[facet_data[1]] : facet_data[1];

					nmbrOfResultsParts.push('<span clas="facet"><em>' + facet_title + '</em> <a href="#" class="tinButton tinCloseButton tinRemoveFacet" value="' + facet_data[0] + ','
						+ facet_data[1] + '" title="Verwijder facet">X</a></span>');
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

	function getSearchPhoto(entry, options)
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
				var media = entry.images[index];
				if (media.type == 'photo') {
					//imgstr = '<img src="http://src.tin.nl/luceen/phpthumb/phpThumb.php?src=' + encodeURIComponent(media.url + '&b=150') + '&w=150&h=100" alt="" />';
					if (media.webExclusion == false || 1) {
						str_html += "\n" + '<div class="tinSearchResultPhoto"><div class="tinSearchPhoto"><img src="' + media.url + '&b=100" alt="" />'
							+ '</div><div class="tinSearchDetail"><a href="' + weburl + '" target="_blank" class="tinSearchPhoto"><img src="' + media.url + '&b=150" alt="" /></a><h1><a href="' + listingUrl  + '" target="_blank" class="apiuri">' + title + '</a></h1>'
							+ '<a href="' + weburl + '" target="_blank" class="tinSeeAlso">catalogus</a><div style="clear: left"></div>'
							+ description + type + disciplines + year + keywords + '<div class="tinClear"></div></div>';
					} else {
						str_html += "\n" + '<div class="tinSearchResultPhoto"><div class="tinSearchPhoto tinSearchPhotoExcluded">&copy; Copyright'
							+ '</div><div class="tinSearchDetail"><a href="' + weburl + '" target="_blank" class="tinSearchPhoto tinSearchPhotoExcluded">&copy; Copyright</a><h1><a href="' + (listingUrl ? listingUrl : weburl) + '" target="_blank" class="apiuri">' + title + '</a></h1>'
							+ (listingUrl ? '<a href="' + weburl + '" target="_blank" class="tinSeeAlso">catalogus</a>' : '') + '<div style="clear: left"></div>'
							+ description + type + disciplines + year + keywords + '<div class="tinClear"></div></div>'
					}

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
					//media.url = $.fn.tinSearch.defaults.baseUrl + 'test';
					//imgstr = '<img src="http://src.tin.nl/luceen/phpthumb/phpThumb.php?src=' + encodeURIComponent(media.url + '&b=150') + '&w=150&h=100" alt="" />';
					if (media.webExclusion == false && 0) {
						str_html += "todo";
					} else {
						play_buttons += "\n" + '<button type="button" class="tinButton tinSmallButton tinPlayButton" title="Afspelen" value="' + media.url + '.mp3"><strong>Afspelen &#x25BA;</strong><input name="mp3' + index + '" type="hidden" class="tinInputHidden" value="' + media.url + '.mp3" /></button>';

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
		var description = !entry.description ? '' : (entry.description.length < 300
			? entry.description
			: entry.description.substring(0, 300) + '&hellip;') + '<br />';
		var apiuri = !entry.apiuri ? '' : entry.apiuri;
		var weburl = !entry.weburl ? '' : entry.weburl;
		var url = !entry.url ? '' : entry.url;
		var keywords = !entry.keywords ? '' : 'Tags: ' + (typeof(entry.keywords) != 'object' ? entry.keywords.split(',') : entry.keywords) + '<br />';
		var materialType = !entry.materialType ? '' : 'Materiaaltype: ' + (options.facetTranslations[entry.materialType]
			? options.facetTranslations[entry.materialType]
			: entry.materialType) + '<br />';
		var disciplines = !entry.discipline ? '' : 'Disciplines: ' + entry.discipline.join(', ') + '<br />';
		var type = !entry.type ? '' : 'Bron: ' + (options.facetTranslations[entry.type] ? options.facetTranslations[entry.type] : entry.type) + '<br />';
		var year = !entry.year || 'onbekend' === entry.year ? '' : 'Jaartal: ' + entry.year + '<br />';
		var imgstr = '';

		if(entry.images && entry.images.length){
			var numimages = entry.images.length;
			var index = 0;
			while (index < numimages && index < 3) {
				var media = entry.images[index];
				if (media.type == 'photo') {
					imgstr += '<img src="' + media.url + '&b=70" alt=""/> ';
				}
				index++;
			}
		} else {
                        imgstr += '<img src="nietpubliceren.gif" alt=""/>';
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

		str_html += 
                        "\n" + '<div class="tinSearchResult">' + 
                        imgstr + 
                        '<div class="tinSearchResultBlock">' +
                                '<span><h1><a href="' + (listingUrl ? listingUrl : weburl) + '" target="_blank" class="apiuri">' + title + '</a></h1></span>' +
                                '<span>' + materialType + '</span>' +
                                '<span>' + year + '</span><br/>' +
                                '<div class="tinSearchResultBlockHidden">' +
                                        '<span>' + description + '</span>' +
                                        '<span>' + type + '</span>' +
                                        '<span>' + disciplines + '</span>' +
                                        '<span>' + keywords +'</span>' +
                                '</div>' +
                        '</div>' +
                        '<a href="' + (listingUrl ? listingUrl : weburl) + '" target="_blank" class="apiuri resultSelect">selecteer</a>' +
			/*(listingUrl ? '<a href="' + weburl + '" target="_blank" class="tinSeeAlso">catalogus</a>' : '') + '<div style="clear: left"></div>' + */
			'<div class="tinClear"></div>';

		if(entry.youtubeurl) {
			var inclURL = entry.youtubeurl.split('?v=');
			inclURL = inclURL[1].split('&');
			inclURL = inclURL[0];
			str_html += '<iframe width="425" height="349" src="http://www.youtube.com/embed/' + inclURL + '" frameborder="0" allowfullscreen></iframe>';
		}
                str_html += '</div>';
		/*str_html += '</div><div class="tinClear"></div>';*/

		return str_html;
	}


	function displaySearchResults(container, jsonObj, pnmbr, slide)
	{
		dbg('displaySearchResults() ' + $(container).attr('id') + ': ', true);
		var nmbrOfResults = jsonObj.numResults;
		var nmbrOfResultsHtml;
		var data = $(container).data('tinSearch');
		var options = data.options;

		var suggestion = !jsonObj || !jsonObj.suggestions || !jsonObj.suggestions.length ? false : jsonObj.suggestions[0];
		var suggestion_str = '';
		if (false !== suggestion) {
			suggestion_str = '<div class="tinSearchSuggestion">'
				+ options.searchSuggestionText.replace(/\{SUGGESTION\}/, '<a href="#tinSearch=1&tinSearchInput=' + escape(suggestion) + '">' + suggestion + '</a>')
				+ '</div>';
		} else {
			$('div.tinSearchSuggestion').remove();
		}

		if (!jsonObj.docs || !jsonObj.docs.length || false === (nmbrOfResultsHtml = getResultsHeader(container, jsonObj, pnmbr))) {
			dbg('reset ... ', true);
			$('div.tinSearchNumberOfResults', container).html('');
			$('div.tinSearchSuggestion').remove();
			$('div.tinSearchResults', container).html('');
			$('div.tinTagCloud', container).html('');
			$('div.tinPageNav', container).html('').hide();

			if (suggestion) {
				$('div.tinSearchNumberOfResults', container).after(suggestion_str);
			}

			return;
		} else {
			dbg('showing ... ', true);
			$('div.tinSearchNumberOfResults', container).html('<h3>' + nmbrOfResultsHtml + '</h3>');
		}

		var str_html = '';
		var docs = jsonObj.docs;

		var i = 0;

		while (i < docs.length) {
			if (options.thumbnails) {
				str_html += getSearchPhoto(docs[i], options);
			} else if (options.jukebox) {
				str_html += getSearchAudio(docs[i], options);
			} else {
				str_html += getSearchEntry(docs[i], options);
			}

			i++;
		}

		if (options.thumbnails) {
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

		if (true === slide) {
			$('div.tinSearchResults', container).slideUp('slow', function() {
				$(this).html(str_html);
				$(this).slideDown('slow');
				$('html, body').animate({scrollTop:0}, 'slow');
			});
			if (docs.length || false === suggestion) {
				$('div.tinPageNav', container).tinPageNav(pnmbr + 1, nmbrOfResults, navoptions);
			}
		} else {
			$('div.tinSearchResults', container).html(str_html);
			if (docs.length || false === suggestion) {
				$('div.tinPageNav', container).tinPageNav(pnmbr + 1, nmbrOfResults, navoptions);
			}
		}
                
                // On hover, show and hide extra info on each result
                $('div.tinSearchResults', container).children().each(function() {
                        $(this).hover(
                                function(){
                                        $(this).css('background-color', '#F3F3F3');
                                        $('a.resultSelect, div.tinSearchResultBlockHidden', this).show(400);
                                },
                                function(){
                                        $(this).css('background-color', '#FFF');
                                        $('a.resultSelect, div.tinSearchResultBlockHidden', this).hide(300);
                                }
                        );
                });
	}

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
				{
					"field":"type",
					"facets": [ ]
				},
				{
					"field":"materialtype",
					"facets": [ ]
				},
				{
					"field":"casttotal",
					"facets": [ ]
				},
				{
					"field":"castamounts",
					"facets": [ ]
				},
				{
					"field":"year",
					"facets": [ ]
				}
			];
		}

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
                                var use_extra_facets = true
                                
				var f = jsonObject.facets[k].facets[i].title;
				var facet_title = options.facetTranslations[f] ? options.facetTranslations[f] : f;
				if (facet_title.indexOf('.') == -1) {
					facet_title = ucfirst(facet_title);
				}
                                
				if (extra_facets.match(jsonObject.facets[k].facets[i].title)) {
					attr_selected = ' selected="selected"';
					attr_current = ' class="current"';
                                        use_extra_facets = false;
				}
                                
				/*advsearch_html += '<option' + attr_selected + ' value="' + f + '">'
					+ facet_title + '&nbsp;&nbsp;('  + jsonObject.facets[k].facets[i].value + ')</option>';*/
				facets_html += 
                                        '<li' + attr_current + '>' +
                                                '<a href="#tinFilter=' + facet + ':' + f + ((use_extra_facets) ? extra_facets : '') +'&parseFacets=0" class="tinSearchAddFacet">' + facet_title + '&nbsp;(' + jsonObject.facets[k].facets[i].value + ')</a>' +
                                        '</li>';
				total += parseInt(jsonObject.facets[k].facets[i].value);
			}

			/*if (!options.disableAdvanced) {
				$('form.tinSearchAdvancedForm', container).append('<div class="tinSearchAdvancedWrapper tinSearchAdvancedWrapper_' + facet + '"><span>' + ucfirst(options.facetTranslations[facet] ? options.facetTranslations[facet] : facet)
					+ '</span> <select type="text" class="tinSearchAdvanced_' + facet + '" name="tinSearchAdvanced_' + facet + '" maxlength="550">' + advsearch_html + '</select></div>');
			}*/
                        
			if ($('ul.tinSearchCollapser_' + facet, container).length) {
				$('ul.tinSearchCollapser_' + facet, container).remove();
			}

			if (!$('ul.tinSearchCollapser_' + facet, container).length && total > 0) {
				$('div.tinSearchFacets', container).append('<ul class="' + (!options.disableCollapsedFacets ? 'collapser ' : '') + 'tinSearchCollapser_' + facet + '"><li><a href="#tinFilter=' + facet + '">' + ucfirst(options.facetTranslations[facet] ? options.facetTranslations[facet] : facet) +
					'&nbsp;('  + total + ')</a><ul>' + facets_html + '</ul></ul>');
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

	function parseTagCloud(container, jsonObject)
	{
		var data = $(container).data('tinSearch');
		var options = data.options;

		if (options.disableTagCloud || !jsonObject.tagCloud) {
			return;
		}

		var arr_html = [];
		var str_html = '';
		var i;
		var maxoccurences = jsonObject.tagCloud[0].occurences;
		var minoccurences = jsonObject.tagCloud[jsonObject.tagCloud.length - 1 < 9 ? jsonObject.tagCloud.length : 9].occurences;
		var scope = maxoccurences - minoccurences;
		for (i = 0; i < jsonObject.tagCloud.length && i < 10; i++) {
			var tag = jsonObject.tagCloud[i];
			var css = '';
			var score = (tag.occurences - minoccurences) / scope * 100;
			if (score > 80) {
				css = 'tagweight1';
			} else if (score > 60) {
				css = 'tagweight2';
			} else if (score > 40) {
				css = 'tagweight3';
			} else if (score > 20) {
				css = 'tagweight4';
			}
			arr_html.push('<a href="#tinSearch=1&tinSearchInput=' + escape(tag.term) + '"' + (css == '' ? '' : ' class="' + css + '"') + '>' + tag.term + '</a>');
		}
		shuffle(arr_html);

		$('div.tinTagCloud').html('<div class="tinTagCloudInner">' + arr_html.join('&nbsp; ') + '</div>');

	}

	function gotoPage(container, pnmbr)
	{
		var data = $(container).data('tinSearch');
		var options = data.options;

		pnmbr = parseInt(pnmbr);
		var start = pnmbr * options.resultsPerPage;
		shown_facets = data.shownFacets;
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

	function loginResults(resultsObj)
	{
		//does the user need to create a new password?
		if (resultsObj.changepassword == 1) {
			$('fieldset#changePassword_menu').show();
		}
		//display the results
		displayResults(resultsObj, 'div.tinSearchLoginResults');
	}

	function displayResults(resultsObj,displayObj)
	{
		if (resultsObj.success==false) {
			$(displayObj).addClass('resultsError');
		}
		else {
			$(displayObj).removeClass('resultsError');
		}
		$(displayObj).html(resultsObj.message);
	}

	function shuffle(ary)
	{
		var s = [];
		while (ary.length) s.push(ary.splice(Math.random() * ary.length, 1));
		while (s.length) ary.push(s.pop());
	}

	function getSearchContainer(ob)
	{
		if (ob && !ob.jquery) {
			ob = $(ob);
		}

		return ob.parentsUntil('.tinSearch').parent();
	}

	function messageQuery(q, cont)
	{
		if (q === undefined) {
			return q;
		}
                
		q = q.toLowerCase();
                
		var firstquote = q.indexOf('"');
		if (firstquote == -1) {
			return q + '*';
		}
		var lastquote = q.lastIndexOf('"');
		if (lastquote == -1 || firstquote >= lastquote) {
			return q + '*';
		}
                
		return q;
	}

	function getGetVar(name)
	{
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(window.location.href);
		return results == null ? '' : results[1];
	}

	function thesaurusRelated(container, value, thesaurusData, jsonObject)
	{
		//alert(typeof jsonObject.broader + ' vs ' + jsonObject.broader);
                dbg('Clearing thesaurus output divs');
		$('div.tinSearchThesaurusNarrower div, div.tinSearchThesaurusBroader div, div.tinSearchThesaurusSimilar div, div.tinSearchThesaurusSynonyms div', container).html('');
                
                dbg('Inserting new thesaurus data');
		if (jsonObject.narrower) {
			//$('div.tinSearchThesaurusNarrower div', container).html(jsonObject.narrower.join('<br />'));
                        thesaurusCombine(jsonObject.narrower, 'Narrower', container);
		}
		if (jsonObject.broader) {
			//$('div.tinSearchThesaurusBroader div', container).html(jsonObject.broader.join('<br />'));
                        thesaurusCombine(jsonObject.broader, 'Broader', container);
		}
		if (jsonObject.related) {
			//$('div.tinSearchThesaurusSimilar div', container).html(jsonObject.related.join('<br />'));
                        thesaurusCombine(jsonObject.related, 'Similar', container);
		}
		if (jsonObject.synonyms) {
			//$('div.tinSearchThesaurusSynonyms div', container).html(jsonObject.synonyms.join('<br />'));
                        thesaurusCombine(jsonObject.synonyms, 'Synonyms', container);
		}
	}
        
        /* append keywords as triggerlink to div in container */
        function thesaurusCombine(keyWords, divLoc, container)
        {                
                dbg('Create theSaurus keyword list');
                $.each(keyWords, function(key, value) { 
                        $('div.tinSearchThesaurus' + divLoc + ' div', container).append('<span class="tinSearchThesaurusResults">' + value + '</span><br/>');
                });
                
                dbg('Bind triggers to keywords');
                $('div.tinSearchThesaurus' + divLoc + ' div', container).children().each(function() {
                        $(this).click(function(){ $(container).tinSearch('thesaurusAutocomplete', $(this).text(), null);})
                });
        }
})(jQuery);

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
	    if (page_nr > 1) {
	    	pagenav += '<span class="tinPageNavPrev">'
	    		+ opts.prevPageHtml.replace(/\{URL\}/, '#tinPage=' + (page_nr - 1) + '&tinSlide=1').replace(/\{PREVARR\}/, opts.prevPageArrow)
	        	+ '</span> ';
	    }

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

/*
 * jQuery.Rule - Css Rules manipulation, the jQuery way.
 * Copyright (c) 2007-2011 Ariel Flesler - aflesler(at)gmail(dot)com | http://flesler.blogspot.com
 * Dual licensed under MIT and GPL.
 * Date: 02/7/2011
 * @author Ariel Flesler
 * @version 1.0.2
 */
(function(f){var c=f('<style rel="alternate stylesheet" type="text/css" />').appendTo("head")[0],k=c.sheet?"sheet":"styleSheet",i=c[k],m=i.rules?"rules":"cssRules",g=i.deleteRule?"deleteRule":"removeRule",d=i.ownerNode?"ownerNode":"owningElement",e=/^([^{]+)\{([^}]*)\}/m,l=/([^:]+):([^;}]+)/;i.disabled=true;var j=f.rule=function(n,o){if(!(this instanceof j)){return new j(n,o)}this.sheets=j.sheets(o);if(n&&e.test(n)){n=j.clean(n)}if(typeof n=="object"&&!n.exec){b(this,n.get?n.get():n.splice?n:[n])}else{b(this,this.sheets.cssRules().get());if(n){return this.filter(n)}}return this};f.extend(j,{sheets:function(p){var n=p;if(typeof n!="object"){n=f.makeArray(document.styleSheets)}n=f(n).not(i);if(typeof p=="string"){n=n.ownerNode().filter(p).sheet()}return n},rule:function(n){if(n.selectorText){return["",n.selectorText,n.style.cssText]}return e.exec(n)},appendTo:function(q,n,o){switch(typeof n){case"string":n=this.sheets(n);case"object":if(n[0]){n=n[0]}if(n[k]){n=n[k]}if(n[m]){break}default:if(typeof q=="object"){return q}n=i}var t;if(!o&&(t=this.parent(q))){q=this.remove(q,t)}var s=this.rule(q);if(n.addRule){n.addRule(s[1],s[2]||";")}else{if(n.insertRule){n.insertRule(s[1]+"{"+s[2]+"}",n[m].length)}}return n[m][n[m].length-1]},remove:function(o,q){q=q||this.parent(o);if(q!=i){var n=q?f.inArray(o,q[m]):-1;if(n!=-1){o=this.appendTo(o,0,true);q[g](n)}}return o},clean:function(n){return f.map(n.split("}"),function(o){if(o){return j.appendTo(o+"}")}})},parent:function(o){if(typeof o=="string"||!f.browser.msie){return o.parentStyleSheet}var n;this.sheets().each(function(){if(f.inArray(o,this[m])!=-1){n=this;return false}});return n},outerText:function(n){return !n||!n.selectorText?"":[n.selectorText+"{","\t"+n.style.cssText,"}"].join("\n").toLowerCase()},text:function(o,n){if(n!==undefined){o.style.cssText=n}return !o?"":o.style.cssText.toLowerCase()}});j.fn=j.prototype={pushStack:function(n,p){var o=j(n,p||this.sheets);o.prevObject=this;return o},end:function(){return this.prevObject||j(0,[])},filter:function(n){var p;if(!n){n=/./}if(n.split){p=f.trim(n).toLowerCase().split(/\s*,\s*/);n=function(){var o=this.selectorText||"";return !!f.grep(o.toLowerCase().split(/\s*,\s*/),function(q){return f.inArray(q,p)!=-1}).length}}else{if(n.exec){p=n;n=function(){return p.test(this.selectorText)}}}return this.pushStack(f.grep(this,function(q,o){return n.call(q,o)}))},add:function(n,o){return this.pushStack(f.merge(this.get(),j(n,o)))},is:function(n){return !!(n&&this.filter(n).length)},not:function(p,o){p=j(p,o);return this.filter(function(){return f.inArray(this,p)==-1})},append:function(n){var p=this,o;f.each(n.split(/\s*;\s*/),function(r,q){if((o=l.exec(q))){p.css(o[1],o[2])}});return this},text:function(n){return !arguments.length?j.text(this[0]):this.each(function(){j.text(this,n)})},outerText:function(){return j.outerText(this[0])}};f.each({ownerNode:d,sheet:k,cssRules:m},function(n,o){var p=o==m;f.fn[n]=function(){return this.map(function(){return p?f.makeArray(this[o]):this[o]})}});f.fn.cssText=function(){return this.filter("link,style").eq(0).sheet().cssRules().map(function(){return j.outerText(this)}).get().join("\n")};f.each("remove,appendTo,parent".split(","),function(n,o){j.fn[o]=function(){var p=f.makeArray(arguments),q=this;p.unshift(0);return this.each(function(r){p[0]=this;q[r]=j[o].apply(j,p)||q[r]})}});f.each(("each,index,get,size,eq,slice,map,attr,andSelf,css,show,hide,toggle,queue,dequeue,stop,animate,fadeIn,fadeOut,fadeTo").split(","),function(n,o){j.fn[o]=f.fn[o]});function b(o,n){o.length=0;Array.prototype.push.apply(o,n)}var h=f.curCSS;f.curCSS=function(o,n){return("selectorText" in o)?o.style[n]||f.prop(o,n=="opacity"?1:0,"curCSS",0,n):h.apply(this,arguments)};j.cache={};var a=function(n){return function(p){var o=p.selectorText;if(o){arguments[0]=j.cache[o]=j.cache[o]||{}}return n.apply(f,arguments)}};f.data=a(f.data);f.removeData=a(f.removeData);f(window).unload(function(){f(i).cssRules().remove()})})(jQuery);

function cloneObject(source) {
	for (i in source) {
		if (typeof source[i] == 'source') {
			this[i] = new cloneObject(source[i]);
		} else {
			this[i] = source[i];
		}
	}
}

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
