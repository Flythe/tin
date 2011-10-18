// call to function
function thesaurusRelated(container, value, thesaurusData, jsonObject)
{
        //clear output divs
        $('div.tinSearchThesaurusNarrower ul, div.tinSearchThesaurusBroader ul, div.tinSearchThesaurusSimilar ul', container).html('');
        
        //insert new data
        if (jsonObject.narrower) {
                thesaurusCombine(jsonObject.narrower, 'Narrower', container);
        }
        if (jsonObject.broader) {
                thesaurusCombine(jsonObject.broader, 'Broader', container);
        }
        //if (jsonObject.related) {
          //      thesaurusCombine(jsonObject.related, 'Related', container);
        //}
        if (jsonObject.synonyms || jsonObject.related) {
                thesaurusCombine($.merge(jsonObject.synonyms, jsonObject.related), 'Similar', container);
        }
}

// append keywords as triggerlink to div in container
function thesaurusCombine(keyWords, divLoc, container)
{                
        dbg('Create theSaurus keyword list');        
        $.each(keyWords, function(key, value) { 
                $('div.tinSearchThesaurus' + divLoc + ' ul', container).append('<li class="tinSearchThesaurusResults">' + value + '</li>');
        });

        dbg('Bind triggers to keywords');
        $('div.tinSearchThesaurus' + divLoc + ' ul', container).children().each(function() {
                $(this).click(function(){ $(container).tinSearch('thesaurusAutocomplete', $(this).text(), null);})
        });
}