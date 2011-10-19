function getMainStruc(opts) {
        var searchMenu = getMenus(opts);
        
        return '<div class="tinSearchSidebar">' +
                        '<h4 class="tinUitgebreid">Of zoek uitgebreid</h4>' +
                        '<div class="headImg" style="display: none;">' + insertImg('Catalogus uitgebreid') + '</div>' +
                        '<div class="tabs">' +
                                insertImg('Alles', 'normalSearch') +
                                insertImg('Afbeeldingen', 'thumbSearch') +
                        '</div>' +
                        searchMenu +
                '</div>' +
                '<div class="tinSearchContainer">' +
                        '<div class="tinSearchNumberOfResults"></div>' +
                        '<div class="tinSearchSuggestion"></div>' +
                        '<div class="tinSearchResults"></div>' +
                        '<div class="tinClear"></div>' +
                        '<div class="tinPageNav"></div>' +
                '</div>' + 
                '<div class="tinClear"></div>' +
                
                '<div class="tinSearchThesaurus" style="display: none;">' +
                        '<a href="#tinSearchThesaurus=0" class="tinButton tinCloseButton tinSearchToggleThesaurus" title="Sluit theater thesaurus"></a>' +
                        '<div class="tinSearchThesaurusBroader">' +
                                '<img width="73" height="25" src="images/thesaurus_breed.png">' +
                                '<ul></ul>' +
                        '</div>' +

                        '<div class="tinSearchThesaurusMiddle">' +
                                '<img src="images/thesaurus_theatertermenhulp.png"><br>' +
                                '<input type="text" class="tinSearchThesaurusInput" name="tinSearchThesaurusInput" maxlength="550"><button class="tinSearchThesaurusOk">ok</button><br>' +
                                '<div class="tinSearchThesaurusSimilar">' +
                                        '<img width="226" height="29" src="images/thesaurus_gelijksoortig.png">' +
                                        '<ul></ul>' +
                                '</div>' +
                        '</div>' +

                        '<div class="tinSearchThesaurusNarrower">' +
                                '<img width="103" height="25" src="images/thesaurus_specifiek.png">' +
                                '<ul></ul>' +
                        '</div>' +
                '</div>';
}

function insertImg(imgName, className) {
        var imageArray = {
                'Catalogus uitgebreid':'TIN_Catalogus_uitgebreid.jpg',
                'Alles':'button_alles.jpg',
                'Afbeeldingen':'button_afbeeldingen.jpg',
                'field_search':'zoekspecifiekveld.jpg',
                'thesaurus':'thesaurus.jpg'
        };
        
        className = className != null ? className : '';
        
        return '<img alt="' + imgName + '" class="' + className + '" src="images/' + imageArray[imgName] + '">';
}

function getMenus(opts)
{
        var mainsearchMenu = '<div class="tinSearchMenu">' +
                                '<input onfocus="removeDefault($(this));" class="tinSearchInput" type="text" value="' + opts.defaultInput + '" />' +
                                '<a class="hiddenUpdater" href="#"></a>' +

                                '<ul id="define_search" style="display: none;">' +
                                        '<li><input type="radio" value=" AND " name="tinSearchOr" class="tinSearchOr"/><label>Bevat alle woorden</label></li>' +
                                        '<li><input type="radio" checked="checked" value=" " name="tinSearchOr" class="tinSearchOr"/><label>Bevat een of meer woorden</label></li>' +
                                        '<li><input type="radio" value="exact" name="tinSearchOr" class="tinSearchOr"/><label>Bevat exacte regel</label></li>' +
                                '</ul>' +

                                '<div id="field_search" style="display: none;">' +
                                        insertImg('field_search') +
                                        '<select class="tinSearchAdlibSearchfield">' +
                                                '<option value="*">Alles</option>' +
                                                '<option value="title">Titel</option>' +
                                                '<option value="author">Maker</option>' +
                                                '<option value="subject">Trefwoord</option>' +
                                        '</select>' +
                                '</div>' +

                                '<div id="tinSearchThesaurusAdd" style="display: none;">' +
                                        '<a class="tinSearchToggleThesaurus" href="#">' + insertImg('thesaurus') + '</a>' +
                                        '<input type="hidden" class="tinSearchThesaurusValue"/>' +
                                '</div>' +
                                
                                '<div class="tinSearchFacets"></div>' +
                        '</div>';
         
         return mainsearchMenu;
}