/*!
 * what3words autosuggest jQuery plugin
 * Copyright (C) 2017 what3words Limited
 * Licensed under the MIT license
 *
 * @author what3words
 * @version 1.3.0-0
 * @link https://github.com/what3words/jquery-plugin-w3w-autosuggest
 */

(function (factory) {
  /* global define */
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node/CommonJS
    module.exports = function (root, jQuery) {
      if (jQuery === undefined) {
        if (typeof window !== 'undefined') {
          jQuery = require('jquery');
        } else {
          jQuery = require('jquery')(root);
        }
      }
      factory(jQuery);
      return jQuery;
    };
  } else {
    // Browser globals
    /* global jQuery */
    factory(jQuery);
  }
}(function ($) {
  'use strict';

  var pluginName = 'w3wAddress';

  /**
   * Create an instance of AutoSuggest
   *
   * @constructor
   * @param {Node} element The &lt;input&gt; element
   * @param {Object} options Options
   */
  var AutoSuggest = function (element, options) {
    this._api_end_point = 'https://api.what3words.com/v2/';
    this.element = element;
    this._name = pluginName;
    this._defaults = $.fn.w3wAddress.defaults;
    this.options = $.extend({}, this._defaults, options);
    this.init();
  };

  $.extend(AutoSuggest.prototype, {

    init: function () {
      // adds DOM elements arount input
      this.buildWrappers();
      // wire the typeahead plugin
      this.autoSuggest();
      // wire the validation plugin
      this.validation();
    },

    destroy: function () {
      this.unbindEvents();
      this.$element.removeData();
    },

    buildWrappers: function () {
      var direction = this.options.direction;

      $(this.element).wrapAll('<div class="typeahead__container ' + direction +
        '"><div class="typeahead__field"><span class="typeahead__query"></span></div></div>');

      if (this.options.logo) {
        $(this.element).addClass('typeahead__padlogo');
        $(this.element).closest('.typeahead__container').prepend(
          '<img class="typeahead__w3w-logo" src="https://assets.prod.what3words.com/images/w3w_grid-logo.svg" alt="w3w-logo">'
        );
      }
      if (this.options.validation) {
        $(this.element).closest('.typeahead__container').after('<div class="typeahead__w3w_validation"></div>');
      }
      $(this.element).addClass('typeahead__w3w_valid').attr('placeholder', this.options.placeholder + ' ').attr(
        'autocomplete', 'off').attr('dir', 'auto').attr('aria-invalid', 'true');
    },

    bindEvents: function () {
      // var plugin = this;

    },

    unbindEvents: function () {
      this.$element.off('.' + this._name);
    },

    callback: function () {
      // Cache onComplete option
      var onComplete = this.options.onComplete;

      if (typeof onComplete === 'function') {
        onComplete.call(this.element);
      }
    },

    autoSuggest: function () {
      var twaPartialRegex = (/^(\D{1,})\.(\D{1,})\.(\D{1,})$/i);

      // DEBUG IF has key
      if (this.options.key === '' && this.options.debug) {
        console.log('No what3words API key found!');
        alert(
          'A what3words API key is required to use the AutoSuggest plugin. Information on how to register for a key can be found in the README'
        );
      } else {
        if (this.options.debug) {
          console.log('what3words API key: ' + this.options.key);
        }
      }

      // SET Arabic input direction
      if (this.options.lang === 'ar') {
        $(this.element).css('direction', 'rtl');
        this.options.hint = false;
      }

      var _self = this;
      var counter = 0;
      var validationTypingTimer; // timer identifier

      $.typeahead({
        debug: this.options.debug,
        input: $(this.element),
        minLength: 5, // x.x.x
        compression: true,
        hint: this.options.hint,
        emptyTemplate: false,
        dynamic: true,
        delay: this.options.typeaheadDelay,
        maxItem: 20,
        source: {
          autosuggest: {
            filter: function (item, displayKey) {
              // apply a filter on the item.country property
              var selectedCountry = null;
              if (_self.options.country_filter !== null) {
                if ($(_self.options.country_filter).get(0)) {
                  // this is a dynamic filter from an input form
                  selectedCountry = $(_self.options.country_filter).val();
                  if (typeof selectedCountry === 'string') {
                    selectedCountry = selectedCountry.toLowerCase();
                  } else {
                    selectedCountry = null;
                  }
                  // check value length ?
                  if (typeof selectedCountry !== 'string' || selectedCountry.length !== 2) {
                    selectedCountry = null;
                  }
                } else {
                  if (typeof _self.options.country_filter === 'string' && _self.options.country_filter.length === 2) {
                    selectedCountry = _self.options.country_filter.toLowerCase();
                  }
                }
              }
              if (selectedCountry !== null) {
                // Debug info
                if (_self.options.debug) {
                  console.log('w3wAddress country_filter: ');
                  console.log($(_self.options.country_filter));
                  console.log('Selected Country is: ' + selectedCountry);
                  console.log('#################################');
                }

                if (item.country === selectedCountry) {
                  if (counter < _self.options.results) {
                    counter++;
                    return true; // Will add the item to the result list
                  }
                  return false; // Will skip the item
                } else {
                  return false;
                }
              } else {
                if (counter < _self.options.results) {
                  counter++;
                  return true; // Will add the item to the result list
                }
                // Will skip the item
              }
            },
            display: ['words'],
            template: function (query, item) {
              return [
                '<div class="typeahead__list-inner">',
                '<span class="typeahead__twa-flag w3w-flags-{{country}}">',
                '</span>',
                '<span class="typeahead__twa">{{words}}</span>', '<br>',
                '<span class="typeahead__info">', '{{place}}', '</span>',
                '</div>'
              ].join('\n');
            },
            ajax: function (query) {
              var addr = query;
              if (addr.indexOf('///') === 0) {
                addr = addr.replace(/\/\/\//, '');
              }
              var m = twaPartialRegex.exec(addr);
              if (m !== null) {
                // trigger searched event
                $(_self.element).trigger('searched', [query]);
                // build query data
                var data = {
                  addr: addr,
                  format: 'json',
                  key: _self.options.key,
                  count: _self.options.count,
                  display: 'full'
                };

                if (typeof _self.options.lang !== 'undefined' && _self.options.lang) {
                  data.lang = _self.options.lang;
                }
                if (typeof _self.options.focus !== 'undefined' && _self.options.focus) {
                  data.focus = _self.options.focus;
                }
                if (typeof _self.options.clip !== 'undefined' && _self.options.clip) {
                  data.clip = _self.options.clip;
                }
                // if method is autosuggest, lang is mandatory and set default to 'en'
                if (!_self.options.multilingual && typeof data.lang === 'undefined') {
                  data.lang = 'en';
                }
                var autosuggest = _self.options.multilingual ? 'autosuggest-ml' : 'autosuggest';
                return {
                  type: 'GET',
                  url: _self._api_end_point + autosuggest,
                  data: data,
                  path: 'suggestions'
                };
              } else {
                // cancel request
                return false;
              }
            } // end ajax-autosuggest
          } // end standardblend
        },
        callback: {
          onSearch: function (node, query) {
            counter = 0; // Reset counter on every new search
            $(_self.element).attr('aria-invalid', true);
          },
          onInit: function (node) {
            // Debug
            if (_self.options.debug) {
              console.log('w3wAddress typeahead initiated on field: ' + node.selector);
            }
          },
          onResult: function (node, query, result, resultCount) {
            // console.log('callback::onResult() ' + result.length);
            if (query === '') {
              return;
            }
            var text = '';
            if (result.length === 0) {
              text = 'No results matching "' + query + '"';
            } else if (result.length > 0 && result.length < resultCount) {
              text = 'Showing ' + result.length + ' of ' + resultCount +
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

            if (_self.options.debug) {
              console.log(text);
            }
          },
          onNavigateAfter: function (node, lis, a, item, query, event) {
            if (typeof item === 'undefined' || typeof item.words === 'undefined') {
              // marks input as a valid 3wa
              $(_self.element).attr('aria-invalid', true);
            } else {
              $(_self.element).attr('aria-invalid', false);
              // if (typeof item !== 'undefined') {
              //   $(_self.element).trigger('selection', [item]);
              // }
            }
          },
          onClickAfter: function (node, a, item, event) {
            if (_self.options.validation) {
              // validate field when result being clicked
              var form = $(_self.element).closest('form');
              if (form.length && form.length > 0) {
                // fire form.validate()
                form.validate().element('.typeahead__w3w_valid');

                $(_self.element).closest('.typeahead__container').nextAll('.typeahead__w3w_validation').empty();
                if (!$(_self.element).closest('.typeahead__query').hasClass('valid')) {
                  $(_self.element).closest('.typeahead__query').addClass('valid');
                }
                clearTimeout(validationTypingTimer);
                // user is "finished typing," run regex and validate
                var clearValidationMark = function () {
                  // remove valid mark every time
                  $(_self.element).closest('.typeahead__query').removeClass('valid');
                };
                validationTypingTimer = setTimeout(clearValidationMark, 500);
              }
            }
            if (typeof item === 'undefined' || typeof item.words === 'undefined') {
              $(_self.element).attr('aria-invalid', true);
            } else {
              $(_self.element).attr('aria-invalid', false);
              if (typeof item !== 'undefined') {
                $(_self.element).trigger('selection', [item]);
              }
            }
          },
          onCancel: function (node, event) {
            if (_self.options.validation) {
              $(_self.element).closest('.typeahead__container').nextAll('.typeahead__w3w_validation').empty();
            }
            $(_self.element).attr('aria-invalid', true);
            $(_self.element).trigger('cancel');
          }
        } // callback
      });
    },

    validation: function () {
      // Return, don't run validation if Options set validation to false
      if (this.options.validation === false) {
        return;
      }

      // log Debug
      if (this.options.debug) {
        console.log('Validating the w3wAddress field');
      }

      var noMatchingCountry = false;

      var _self = this;

      // Create a Custom W3W address validation
      $.validator.addMethod('w3w_valid', function (value, element) {
        // IF empty
        if (this.optional(element) || value.replace(/ /g, '') === '') {
          // send valid for empty
          return true;
        } else {
          // IF has content
          var isSuccess = false;
          var twaRegex = (/^(\D{3,})\.(\D{3,})\.(\D{3,})$/i);
          var m = twaRegex.exec(value);
          if (m !== null) {
            // check from result list first
            var suggestions = $(element).closest('.typeahead__container').find('span.typeahead__twa');
            if (typeof suggestions !== 'undefined' && suggestions.length > 0) {
              for (var i = 0; i < suggestions.length && !isSuccess; i++) {
                if (suggestions[i].innerText === value) {
                  isSuccess = true;
                }
              }
            }
            // still not a sucess ?
            if (!isSuccess) {
              // check with a forward geocoding
              $.ajax({
                url: _self._api_end_point + 'forward',
                type: 'GET',
                // async: false,
                data: {
                  addr: value,
                  key: _self.options.key,
                  format: 'json'
                },
                dataType: 'json',
                success: function (result) {
                  var response = result;
                  // If W3A is VALID
                  if (response.hasOwnProperty('geometry')) {
                    isSuccess = true;
                  }
                } // end success
              });
            }
          }
          return isSuccess;
        }
      }, function () {
        // not implemented yet
        if (noMatchingCountry === true) {
          return _self.options.valid_country_error;
        } else {
          return _self.options.valid_error;
        }
      });

      // Add Custom W3W validation to $validator
      $.validator.addClassRules('typeahead__w3w_valid', {
        w3w_valid: true
      });

      var typingTimer; // timer identifier
      var doneTypingInterval = 500;
      var regex = /^(\D{1,})\.(\D{1,})\.(\D{1,})$/i;

      var form = $(this.element).closest('form');
      if (form.length && form.length > 0) {
        // Init validation
        form.validate({
          // $(this.element).validate({
          onfocusout: false,
          onkeyup: function (element) {
            if ($(element).hasClass('typeahead__w3w_valid')) {
              clearTimeout(typingTimer);

              // user is "finished typing," run regex and validate
              var doneTyping = function () {
                // remove valid mark every time
                $(element).closest('.typeahead__query').removeClass('valid');

                // Only check for validation when regex match
                if (regex.test($(element).val())) {
                  $(element).valid();
                }
              };

              typingTimer = setTimeout(doneTyping, doneTypingInterval);
            }
          },
          errorPlacement: function (error, element) {
            var valid_container = element.closest('.typeahead__container');
            error.appendTo(valid_container.siblings('.typeahead__w3w_validation'));
          }
        });
      }
    }
  });

  /**
   * [w3wAddress description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  $.fn.w3wAddress = function (options) {
    this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new AutoSuggest(this, options));
      }
    });
    return this;
  };

  /**
   * Default plugin options
   *
   * @type {object}
   */
  $.fn.w3wAddress.defaults = {
    country_filter: null,
    key: '',
    debug: false,
    hint: false,
    count: 50,
    results: 3,
    logo: true,
    lang: 'en',
    focus: null,
    clip: null,
    multilingual: true,
    direction: 'ltr',
    placeholder: 'e.g. lock.spout.radar',
    validation: true,
    valid_error: 'Please enter a valid 3 word address.',
    typeaheadDelay: 100
  };
}));
