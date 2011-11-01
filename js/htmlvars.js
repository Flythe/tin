function getMainStruc(opts) {
        var searchMenu = getMenus(opts);
        
        return '<div class="tinSearchSidebar">' +
                        '<h4 class="tinUitgebreid">Of zoek uitgebreid</h4>' +
                        '<h4 class="tinSimpel" style="display:none;"><a href="" class="eenvoudigZoeken">Eenvoudig zoeken</a></h4>' +
                        '<div class="headImg">' + insertImg('Catalogus eenvoudig', 'catalogusImg') + '</div>' +
                        '<div class="tabs">' +
                                insertImg('Alles', 'normalSearch') +
                                insertImg('Afbeeldingen', 'thumbSearch') +
                        '</div>' +
                        searchMenu +
                '</div>' +
                '<div class="tinSearchContainer">' +
                        '<div class="welcome">Welkom in de nieuwe TIN catalogus. Vanaf 17 oktober is een sneak preview beschikbaar die makkelijker en sneller zoekt, maar vooral beter vindt. U bent van harte welkom om \'m te testen en ons van feedback te voorzien: <a href="mailto:mediatheek@tin.nl">mediatheek@tin.nl</a></div>' +
                        '<div class="tinSearchNumberOfResults"></div>' +
                        '<div class="tinSearchSuggestion"></div>' +
                        '<div class="tinSearchResults">' +
                        '</div>' +
                        '<div class="tinClear"></div>' +
                        '<div class="tinPageNav"></div>' +
                '</div>' +
                '<div class="tinClear"></div>' +
                
                '<div class="tinSearchThesaurus" style="display: none;">' +
                        '<a href="#tinSearchThesaurus=0" class="tinButton tinCloseButton tinSearchToggleThesaurus" title="Sluit theater thesaurus"></a>' +
                        '<div class="tinSearchThesaurusBroader">' +
                                insertImg('Thesaurus breed') +
                                '<ul></ul>' +
                        '</div>' +

                        '<div class="tinSearchThesaurusMiddle">' +
                                insertImg('Thesaurus hulp') +
                                '<br>' +
                                '<input type="text" class="tinSearchThesaurusInput" name="tinSearchThesaurusInput" maxlength="550"><button class="tinSearchThesaurusOk">ok</button><br>' +
                                '<div class="tinSearchThesaurusSimilar">' +
                                        insertImg('Thesaurus gelijk') +
                                        '<ul></ul>' +
                                '</div>' +
                        '</div>' +

                        '<div class="tinSearchThesaurusNarrower">' +
                                insertImg('Thesaurus specifiek') +
                                '<ul></ul>' +
                        '</div>' +
                '</div>';
}

function insertImg(imgName, className) {
        var imageArray = {
                'Catalogus eenvoudig':'TIN_Catalogus_eenvoudig.jpg',
                'Alles':'buttons/button_alles.jpg',
                'Afbeeldingen':'buttons/button_afbeeldingen.jpg',
                'field_search':'zoekspecifiekveld.jpg',
                'thesaurus':'thesaurus/thesaurus_animatie.gif',
                'Thesaurus breed':'thesaurus/thesaurus_breed.png',
                'Thesaurus hulp':'thesaurus/thesaurus_theatertermenhulp.png',
                'Thesaurus gelijk':'thesaurus/thesaurus_gelijksoortig.png',
                'Thesaurus specifiek':'thesaurus/thesaurus_specifiek.png'
        };
        
        className = className != null ? className : '';
        
        return '<img alt="' + imgName + '" class="' + className + '" src="images/' + imageArray[imgName] + '">';
}

function getMenus(opts)
{
        var mainsearchMenu = '<div class="tinSearchMenu">' +
                                '<input onfocus="removeDefault($(this));" class="tinSearchInput" type="text" value="' + opts.defaultInput + '" />' +
                                '<a class="hiddenUpdater" href="#"></a>' +
                                
                                '<div id="tinZoektIn">' +
                                        '<ul>' +
                                                '<li class="first">Met bovenstaande zoekfunctie zoekt u in</li>' +
                                                '<li>de Theaterbibliotheek, de Museumcollectie,</li>' +
                                                '<li>de Mediatheek, de Archieven en AdLib</li>' +
                                        '</ul>' +
                                '</div>' +

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