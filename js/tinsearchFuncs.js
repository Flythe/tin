function parseTagCloud(container, jsonObject)
{
        if (!jsonObject.tagCloud || jsonObject.tagCloud == '') {
                return;
        }
        
        var arr_html = [];
        var i;
        var maxoccurences = jsonObject.tagCloud[0].occurences;
        var minoccurences = jsonObject.tagCloud[jsonObject.tagCloud.length - 1 < 9 ? jsonObject.tagCloud.length - 1 : 9].occurences;
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
        $('div.tinTagCloud', container).html('<div class="tinTagCloudInner">' + arr_html.join('&nbsp; ') + '</div>');
        return;
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
        if (ob && !ob.jquery)
                ob = $(ob);

        return ob.parentsUntil('.tinSearch').parent();
}

function messageQuery(q, cont, combine)
{       
        if (q === undefined || q == '')
                return q;
        
        q = q.toLowerCase();
        //q = $.trim(q);
        
        if(combine && combine != 'exact' && cont == '*') {
                q = q.split(' ');
                q = q.join(combine);
        }
        
        //append an * to the end of the q string if the search is not literal  = ("") or if searchField is specified append searchField
        if(cont == 'title' || cont == 'author' || cont == 'subject') {
                q = cont + ':"' + q + '"';
        } else {
                var firstquote = q.indexOf('"');
                var lastquote = q.lastIndexOf('"');
                if (firstquote == -1 || lastquote == -1 || firstquote >= lastquote) {
                        if(combine != 'exact')
                                q += '*';
                        else if(combine == 'exact')
                                q = '"' + q + '"';
                }
        }

        return q;
}

function checkQuotes(q) {
        if (q === undefined)
                return false;

        q = q.toLowerCase();

        var firstquote = q.indexOf('"');
        var lastquote = q.lastIndexOf('"');

        if (firstquote != -1 || lastquote != -1)
                return true;

        return false;
}

function getSearchParams() {
        var url = $.bbq.getState('tinCatalogus');
        var params = {};

        if(url)
                params = $.deparam ( url );
        
        return params;
}

function removeDefault(el) {
        if ( el.val() == $.fn.tinSearch.defaults.defaultInput )
                el.val('');
}

// uitgebreid zoeken
function showMenu(ob) {
        $('h4.tinSimpel', ob).show();
        $('h4.tinUitgebreid', ob).hide();
        $('ul#define_search, div#field_search, div#tinSearchThesaurusAdd', ob).show();
        $('div.tinSearchMenu', ob).css('border-right', '1px solid black');
        $('img.catalogusImg', ob).attr('src', 'images/TIN_Catalogus_uitgebreid.jpg');
}

// eenvoudig zoeken
function hideMenu(ob) {
        $('h4.tinSimpel').hide();
        $('h4.tinUitgebreid', ob).show();
        $('ul#define_search, div#field_search, div#tinSearchThesaurusAdd', ob).hide();
        $('select.tinSearchAdlibSearchfield', ob).val('*');
        $('input.tinSearchOr[value=" "]', ob).prop('checked', true);
        $('div.tinSearchMenu', ob).css('border-right', 'none');
        $('img.catalogusImg', ob).attr('src', 'images/TIN_Catalogus_eenvoudig.jpg');
}

function updateHash(searchInput, tinSearchAdlibSearchfield, theSaurus, combineSearch, tinSearchType) {
        var q = getSearchParams();
        
        if(searchInput != '' && searchInput != undefined) {
                q.tinSearchInput = searchInput;
        }
        
        if(tinSearchAdlibSearchfield != '' && tinSearchAdlibSearchfield != undefined) {
                q.tinSearchAdlibSearchfield = tinSearchAdlibSearchfield;
        }
        
        if(theSaurus != '' && theSaurus != undefined) {
                q.theSaurus = theSaurus;
        }
        
        if(combineSearch != '' && combineSearch != undefined) {
                q.combineSearch = combineSearch;
        }
        
        if(tinSearchType != '' && tinSearchType != undefined) {
                q.tinSearchType = tinSearchType;
        }
        
        $('a.hiddenUpdater').fragment($.param( q ));
        $('a.hiddenUpdater').click();
}

function changeSearchType(type) {
        // normal search
        if(type){
                updateHash('', '', '', '', 'normal');
                $("img.normalSearch").attr("src", "images/buttons/button_alles.jpg");
                $("img.thumbSearch").attr("src", "images/buttons/button_afbeeldingen.jpg");
        // image search
        } else {
                updateHash('', '', '', '', 'thumbs');
                $("img.normalSearch").attr("src", "images/buttons/button_alles_disable.jpg");
                $("img.thumbSearch").attr("src", "images/buttons/button_afbeeldingen_enable.jpg");
        }
}

function initSearch(ob) {
        var q = getSearchParams(ob);
        
        if (q.tinSearchInput) {   
                $('input.tinSearchInput', ob).val(q.tinSearchInput);
                
                if(q.tinSearchAdlibSearchfield) {
                        $('select.tinSearchAdlibSearchfield', ob).val(q.tinSearchAdlibSearchfield);
                }
                
                if(q.theSaurus) {
                        $('input.tinSearchThesaurusValue', ob).val(q.theSaurus);
                }
                
                if(q.tinSearchAdlibSearchfield || q.theSaurus) {
                        showMenu(ob);
                }
                
                if(q.tinSearchType) {
                        if(q.tinSearchType == 'normal') {
                                changeSearchType(true);
                        } else {
                                changeSearchType(false);
                        }
                }
                        
                updateHash(q.tinSearchInput, q.tinSearchAdlibSearchfield, q.theSaurus);
        }
}

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