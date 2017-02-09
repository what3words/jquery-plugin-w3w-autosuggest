global.jQuery = require('jquery');
var $ = global.jQuery;
window.$ = $;
var typeahead = require('jquery-typeahead');
var validator = require("jquery-validation");

/*!
 * jQuery w3w-autosuggest
 * Copyright (C) 2017 what3words Limited
 * Licensed under the MIT license
 *
 * @author Jozsef Francovszky
 * @version 1.0.0 (07-02-2017)
 * @link
 */

;(function ( $, window, document, undefined ) {

    "use strict";

    var pluginName = 'w3wAddress';

    function Plugin ( element, options ) {
        this.element = element;
        this._name = pluginName;
        this._defaults = $.fn.w3wAddress.defaults;
        this.options = $.extend( {}, this._defaults, options );

        this.init();
    }

    $.extend(Plugin.prototype, {

        init: function () {
            this.buildWrappers();
            this.autoSuggest();
            this.validation();
        },

        destroy: function() {
            this.unbindEvents();
            this.$element.removeData();
        },

        buildWrappers: function() {
            var direction = this.options.direction;

            $(this.element).wrapAll('<div class="typeahead__container ' + direction + '"><div class="typeahead__field"><span class="typeahead__query"></span></div></div>');
            $(this.element).closest('.typeahead__container').prepend('<img class="w3w-logo" src="https://assets.prod.what3words.com/images/w3w_grid-logo.svg" alt="w3w-logo">').after('<div class="typeahead-validation"></div>');
            $(this.element).addClass('w3w_valid').attr('placeholder',this.options.placeholder + ' ').attr('autocomplete','off').attr('dir','auto');
        },

        bindEvents: function() {
            var plugin = this;

        },

        unbindEvents: function() {
            this.$element.off('.'+this._name);
        },

        callback: function() {
            // Cache onComplete option
            var onComplete = this.options.onComplete;

            if ( typeof onComplete === 'function' ) {
                onComplete.call(this.element);
            }
        },

        autoSuggest: function() {
            var W3W_API_END_POINT = 'https://api.what3words.com/v2/',
                W3W_MAP_END_POINT = 'https://map.what3words.com/',
                W3W_API_KEY = this.options.key,
                twaRegex = /^(\D{3,})\.(\D{3,})\.(\D{1,})$/i;

                // Check if Country Selector defined.
                if (this.options.country_selector !== '') {
                    // Give it a default value;
                    var selectedCountry = 'gb';
                }

            //DEBUG IF has key
            if(W3W_API_KEY === '' && this.options.debug) {
                console.log('No what3words API key found!');
                alert('A what3words API key is required to use the AutoSuggest plugin. Information on how to register for a key can be found in the README')
            } else {
                if (this.options.debug) {
                    console.log('what3words API key: ' + this.options.key);
                }
            }

            //SET Arabic input direction
            if (this.options.lang == 'ar') {
               $(this.element).css( 'direction', 'rtl');
            }

            var _self = this,
                counter = 0;

            $.typeahead({
                debug: true,
                input: $(this.element),
                minLength: 9, // xxx.xxx.x
                compression: true,
                hint: true,
                emptyTemplate: false,
                dynamic: true,
                delay: 700,
                maxItem: 20,
                source: {
                    autosuggest: {
                        filter: function (item, displayKey) {

                            if (selectedCountry) {
                                selectedCountry = $(_self.options.country_selector).val().toLowerCase();

                                // Debug info
                                if(_self.options.debug) {
                                    console.log('w3wAddress country_selector: ');
                                    console.log($(_self.options.country_selector));
                                    console.log('Selected Country is: ' + selectedCountry);
                                    console.log('#################################');
                                }

                                if (item.country == selectedCountry ) {


                                    if (counter < _self.options.results ) {
                                        counter++;
                                        return true; // Will add the item to the result list
                                    }
                                    return false; // Will skip the item

                                } else {
                                    return false;
                                }
                            } else {
                                if (counter < _self.options.results ) {
                                     counter++;
                                     return true; // Will add the item to the result list
                                }
                                return; // Will skip the item
                            }
                        },
                        display: ['words'],
                        template: function(query, item) {
                            var addDistanceInfo = '';
                            if (item.distance) {
                                addDistanceInfo = '{{distance}} km, ';
                            }

                            return [
                                '<div class="list-inner">',
                                '<span class="twa-flag"><img src="' + _self.options.path_to_flags + '{{country}}.png"></span>',
                                '<span class="twa">{{words}}</span>', '<br>', '<span class="info">',
                                '{{place}}</span>', '</div>'
                            ].join('\n');

                        },
                        ajax: function(query) {

                                var m = twaRegex.exec(query);
                                if (m !== null) {

                                    var data = {
                                        addr: '{{query}}',
                                        format: 'json',
                                        lang: _self.options.lang,
                                        key: _self.options.key,
                                        count: _self.options.count,
                                        display: 'full'
                                    };

                                    return {
                                        type: 'GET',
                                        url: W3W_API_END_POINT + 'autosuggest',
                                        data: data,
                                        path: 'suggestions',
                                        beforeSend: function(jqXHR, options) {
                                            // is it possible here to cancel request ?
                                            //console.log(options);
                                        },
                                        callback: {
                                            done: function(data, textStatus, jqXHR) {
                                                // TODO handle errors to display message ?

                                                if (data.suggestions) {
                                                    //console.log('ajax::done() ' + data.suggestions.length);
                                                }
                                                // Perform operations on received data...
                                                // IMPORTANT: data has to be returned if this callback is used
                                                return data;
                                            },
                                            fail: function(jqXHR, textStatus, errorThrown) {},
                                            always: function(data, textStatus, jqXHR) {},
                                            then: function(jqXHR, textStatus) {}
                                        }
                                    };
                                } else {
                                    // workaround to cancel request:
                                    // fire a internal error but prevent ajax request
                                    // and no error logged in console
                                    return false;
                                }
                            } // end ajax-autosuggest
                    } // end standardblend
                },
                callback: {
                    onSearch: function (node,query) {
                        counter = 0; // Reset counter on every new search
                    },
                    onInit: function(node) {
                        //Debug
                        if(_self.options.debug) {
                            console.log('w3wAddress typeahead initiated on field: ' + node.selector);
                        }
                    },
                    onResult: function(node, query, result, resultCount) {
                        //console.log('callback::onResult() ' + result.length);
                        if (query === '') {
                            return;
                        }
                        var text = '';
                        if (result.length === 0) {
                            text = 'No results matching "' + query + '"';
                        } else if (result.length > 0 && result.length < resultCount) {
                            text = "Showing " + result.length + " of " + resultCount +
                                ' elements matching "' + query + '"';
                        } else if (result.length > 0) {
                            text = 'Showing ' + result.length + ' elements matching addr= ' + query +
                                '"';
                        }
                        text += ', with lang=' + _self.options.lang;
                        if (typeof _self.options.focus !== 'undefined') {
                            text += ', with focus=' + _self.options.focus;
                        } else {
                            text += ', without focus';
                        }

                        if(_self.options.debug) {
                            console.log(text);
                        }
                    },
                    onClickAfter: function(node, a, item, event) {
                        //validate field when result being clicked
                        $(_self.element).closest('form').validate().element(".w3w_valid");
                        $(_self.element).closest('.typeahead__container').nextAll('.typeahead-validation').empty();
                        if (!$(_self.element).closest('.typeahead__query').hasClass('valid')) {
                            $(_self.element).closest('.typeahead__query').addClass('valid');
                        }
                    }
                }
            });
        },

        validation: function() {
            var initial_language = this.options.lang;

            // Return, dont run validation if Option set to false
            if(this.options.validation == false) {
                return;
            }

            // Debug
            if(this.options.debug) {
                console.log('Validating the w3wAddress field');
            }

            var W3W_API_END_POINT = 'https://api.what3words.com/v2/',
                W3W_MAP_END_POINT = 'https://map.what3words.com/',
                W3W_API_KEY = this.options.key,
                noMatch = false;

                var _self = this;

            // Create a Custom W3W address validation
            $.validator.addMethod('w3w_valid', function (value, element) {
                // IF empty
                if (this.optional(element) || value.replace(/ /g, '') === '') {
                    return true;
                }
                // IF has content
                else {
                    var isSuccess = false;

                    $.ajax({
                        url: W3W_API_END_POINT + 'forward',
                        type: 'GET',
                        async: false,
                        data: {
                            addr : value,
                            key: W3W_API_KEY,
                            format: 'json'
                        },
                        dataType: 'json',
                        success: function(result) {
                            var response = result;

                            // If W3A is VALID
                            if (response.hasOwnProperty('geometry')) {
                                isSuccess=true;

                                if (_self.options.auto_detect_lang == true) {
                                    _self.options.lang = response.language;

                                    // console.log('-----------EXACT MATCH / VALID ------------');
                                    if (!$('.typeahead__container').hasClass('auto-lang')) {

                                        //In case Exact Match, switch language to the match language
                                        //$(_self.element).eq(0).val(response.words).trigger("input");
                                        $('.typeahead__container').addClass('auto-lang');
                                    }
                                }

                            // If W3A is NOT VALID
                            } else {

                            }
                        }
                    });
                    return isSuccess;
                }
            }, function(){
                if (noMatch == true) {
                    return _self.options.valid_country_error;
                } else {
                    return _self.options.valid_error;
                }
            });


            //Add Custom W3W validation to $validator
            $.validator.addClassRules("w3w_valid", {
                w3w_valid: true
            });

            var typingTimer,            //timer identifier
                doneTypingInterval = 500,
                regex = /^(\D{3,})\.(\D{3,})\.(\D{1,})$/i;

            // Init validation
            $(this.element).closest('form').validate({
                onfocusout: false,
                onkeyup: function(element) {
                    if ( $(element).hasClass('w3w_valid') ) {

                        clearTimeout(typingTimer);
                        typingTimer = setTimeout(doneTyping, doneTypingInterval);

                        //user is "finished typing," run regex and validate
                        function doneTyping () {
                            //remove valid mark every time
                            $(element).closest('.typeahead__query').removeClass('valid');

                            //Only check for validation when regex match
                            if (regex.test($(element).val())) {
                                $(element).valid();
                            }
                            else {
                                if (_self.options.auto_detect_lang == true) {
                                    _self.options.lang = initial_language;
                                    $(_self.element).closest('.typeahead__container').removeClass('auto-lang');
                                }
                            }
                        }
                    }
                },
                errorPlacement: function(error, element) {
                    var valid_container = element.closest('.typeahead__container');
                    error.appendTo( valid_container.siblings('.typeahead-validation'));
                }
            });
        }
    });

    $.fn.w3wAddress = function ( options ) {
        this.each(function() {
            if ( !$.data( this, "plugin_" + pluginName ) ) {
                $.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
            }
        });
        return this;
    };

    $.fn.w3wAddress.defaults = {
        country_selector: '',
        key: '',
        debug: false,
        validate: true,
        count: 20,
        results: 3,
        lang: 'en',
        auto_detect_lang: true,
        direction: 'ltr',
        placeholder: 'e.g. lock.spout.radar',
        validation: true,
        valid_error: 'Please enter a valid 3 word address.',
        path_to_flags: 'images/flags/'
    };

})( jQuery, window, document );