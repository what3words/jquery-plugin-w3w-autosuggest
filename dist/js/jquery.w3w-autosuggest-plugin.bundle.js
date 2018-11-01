/*!
 * what3words autosuggest jQuery plugin
 * Copyright (C) 2017 what3words Limited
 * Licensed under the MIT license
 *
 * @author what3words
 * @version 1.5.2
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

  var twaPartialRegex = (/^[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}[・.][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{1,}$/i);
  var twaRegex = (/^[^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{2,}[・.][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{2,}[・.][^0-9`~!@#$%^&*()+\-_=[{\]}\\|'<,.>?/";:£§º©®\s]{2,}$/i);

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
    // override API endpoint to proxy the request and for instance hide API key
    if (typeof this.options.api_end_point !== 'undefined') {
      this._api_end_point = this.options.api_end_point;
    }
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

      $(this.element).wrapAll(
        '<div class="typeahead__container ' + direction + '"><div class="typeahead__field"><span class="typeahead__query"></span></div></div>'
      );

      if (this.options.logo) {
        $(this.element).addClass('typeahead__padlogo');
        // $(this.element).closest('.typeahead__container').prepend('<img class="typeahead__w3w-logo" src="https://assets.what3words.com/images/w3w_grid-logo.svg" alt="w3w-logo">');
        var logo = '<svg class="typeahead__w3w-logo" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 32 32" xml:space="preserve"><path fill="currentColor" d="M10.7,4h2L4,28H2L10.7,4z M19.7,4h2L13,28h-2L19.7,4z M28.7,4h2L22,28h-2L28.7,4z"></path></svg>';
        $(this.element).closest('.typeahead__container').prepend(logo);
      }
      if (this.options.validation) {
        $(this.element).closest('.typeahead__container').after('<div class="typeahead__w3w_validation"></div>');
      }
      $(this.element).addClass('typeahead__w3w_valid').attr('placeholder', this.options.placeholder + ' ').attr('autocomplete', 'off').attr('dir', 'auto').attr('aria-invalid', 'true');
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
      if (this.options.key === '' || this.options.key === null) {
        console.log('No what3words API key found in constructor!');
        // check if user provide a proxy endpoint
        if (typeof this.options.api_end_point === 'undefined') {
          console.log('A what3words API key is required to use the AutoSuggest plugin. Information on how to register for a key can be found in the README');
        }
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

      $(this.element).focusout(function () {
        if (/ /.test(this.value)) {
          this.value = this.value.replace(/ /g, '');
          if (_self.options.validation) {
            // validate field when result being clicked
            var form = $(_self.element).closest('form');
            if (form.length && form.length > 0) {
              // fire form.validate()
              form.validate().element('.typeahead__w3w_valid');
            }
          } else {
            var isSuccess = false;
            var suggestions = $(_self.element).closest('.typeahead__container').find('span.typeahead__twa');
            if (typeof suggestions !== 'undefined' && suggestions.length > 0) {
              for (var i = 0; i < suggestions.length && !isSuccess; i++) {
                if (suggestions[i].innerText === this.value) {
                  isSuccess = true;
                  // marks input as a valid 3wa
                  $(_self.element).attr('aria-invalid', false);
                }
              }
            }
          }
        }
      });

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

                '<svg class="typeahead__w3w-logo-inline" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 32 32" xml:space="preserve"><path fill="currentColor" d="M10.7,4h2L4,28H2L10.7,4z M19.7,4h2L13,28h-2L19.7,4z M28.7,4h2L22,28h-2L28.7,4z"></path></svg>',
                '<div class="typeahead__twa-flag w3w-flags-{{country}}"></div>',
                '<div class="typeahead__twa">{{words}}</div>',
                '<div class="typeahead__info">{{place}}</div>',
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
                var autosuggest = _self.options.multilingual
                  ? 'autosuggest-ml'
                  : 'autosuggest';
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
              text = 'Showing ' + result.length + ' of ' + resultCount + ' elements matching "' + query + '"';
            } else if (result.length > 0) {
              text = 'Showing ' + result.length + ' elements matching addr= ' + query + '"';
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
              $(_self.element).attr('aria-invalid', true);
            } else {
              // marks input as a valid 3wa
              $(_self.element).attr('aria-invalid', false);
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

                $.ajax({
                  url: _self._api_end_point + 'forward',
                  type: 'GET',
                  async: false,
                  data: {
                    addr: item.words,
                    key: _self.options.key,
                    format: 'json'
                  },
                  dataType: 'json'
                });

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
            $(_self.element).removeClass('valid');
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
          var addr = value;
          if (/ /.test(addr)) {
            addr = value.replace(/ /g, '');
            $(element).val(addr);
          }
          var m = twaRegex.exec(addr);
          if (m !== null) {
            // check from result list first
            var suggestions = $(element).closest('.typeahead__container').find('span.typeahead__twa');
            if (typeof suggestions !== 'undefined' && suggestions.length > 0) {
              for (var i = 0; i < suggestions.length && !isSuccess; i++) {
                if (suggestions[i].innerText === addr) {
                  isSuccess = true;
                }
              }
            }
            // still not a sucess ?
            // meant to be used when autosuggest was monlingual
            // if (!isSuccess) {
            //   // check with a forward geocoding
            //   $.ajax({
            //     url: _self._api_end_point + 'forward',
            //     type: 'GET',
            //     // async: false,
            //     data: {
            //       addr: addr,
            //       key: _self.options.key,
            //       format: 'json'
            //     },
            //     dataType: 'json',
            //     success: function (result) {
            //       var response = result;
            //       // If W3A is VALID
            //       if (response.hasOwnProperty('geometry')) {
            //         isSuccess = true; // TODO fix it: already returned with false
            //       }
            //     } // end success
            //   });
            // }
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
      $.validator.addClassRules('typeahead__w3w_valid', {w3w_valid: true});

      var typingTimer; // timer identifier
      var doneTypingInterval = 500;

      var form = $(this.element).closest('form');
      if (form.length && form.length > 0) {
        // Init validation
        form.validate({
          onfocusout: false, // custom made
          onkeyup: function (element) {
            if ($(element).hasClass('typeahead__w3w_valid')) {
              clearTimeout(typingTimer);

              // user is "finished typing," run regex and validate
              var doneTyping = function () {
                // remove valid mark every time
                $(element).closest('.typeahead__query').removeClass('valid');

                const value = $(element).val();

                if (value.substr(0, 3) === '///') {
                  $(element).val(value.substring(3));
                }

                // Only check for validation when regex match
                if (twaPartialRegex.test($(element).val())) {
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

/*!
 * jQuery Typeahead
 * Copyright (C) 2017 RunningCoder.org
 * Licensed under the MIT license
 *
 * @author Tom Bertrand
 * @version 2.10.4 (2017-10-17)
 * @link http://www.runningcoder.org/jquerytypeahead/
 */
!function(t){"function"==typeof define&&define.amd?define("jquery-typeahead",["jquery"],function(e){return t(e)}):"object"==typeof module&&module.exports?module.exports=function(e,i){return void 0===e&&(e="undefined"!=typeof window?require("jquery"):require("jquery")(i)),t(e)}():t(jQuery)}(function(t){"use strict";window.Typeahead={version:"2.10.4"};var e={input:null,minLength:2,maxLength:!1,maxItem:8,dynamic:!1,delay:300,order:null,offset:!1,hint:!1,accent:!1,highlight:!0,multiselect:null,group:!1,groupOrder:null,maxItemPerGroup:null,dropdownFilter:!1,dynamicFilter:null,backdrop:!1,backdropOnFocus:!1,cache:!1,ttl:36e5,compression:!1,searchOnFocus:!1,blurOnTab:!0,resultContainer:null,generateOnLoad:null,mustSelectItem:!1,href:null,display:["display"],template:null,templateValue:null,groupTemplate:null,correlativeTemplate:!1,emptyTemplate:!1,cancelButton:!0,loadingAnimation:!0,filter:!0,matcher:null,source:null,callback:{onInit:null,onReady:null,onShowLayout:null,onHideLayout:null,onSearch:null,onResult:null,onLayoutBuiltBefore:null,onLayoutBuiltAfter:null,onNavigateBefore:null,onNavigateAfter:null,onEnter:null,onLeave:null,onClickBefore:null,onClickAfter:null,onDropdownFilter:null,onSendRequest:null,onReceiveRequest:null,onPopulateSource:null,onCacheSave:null,onSubmit:null,onCancel:null},selector:{container:"typeahead__container",result:"typeahead__result",list:"typeahead__list",group:"typeahead__group",item:"typeahead__item",empty:"typeahead__empty",display:"typeahead__display",query:"typeahead__query",filter:"typeahead__filter",filterButton:"typeahead__filter-button",dropdown:"typeahead__dropdown",dropdownItem:"typeahead__dropdown-item",labelContainer:"typeahead__label-container",label:"typeahead__label",button:"typeahead__button",backdrop:"typeahead__backdrop",hint:"typeahead__hint",cancelButton:"typeahead__cancel-button"},debug:!1},i=".typeahead",s={from:"ãàáäâẽèéëêìíïîõòóöôùúüûñç",to:"aaaaaeeeeeiiiiooooouuuunc"},o=~window.navigator.appVersion.indexOf("MSIE 9."),n=~window.navigator.appVersion.indexOf("MSIE 10"),r=~window.navigator.userAgent.indexOf("Trident")?~window.navigator.userAgent.indexOf("rv:11"):!1,a=function(t,e){this.rawQuery=t.val()||"",this.query=t.val()||"",this.selector=t[0].selector,this.deferred=null,this.tmpSource={},this.source={},this.dynamicGroups=[],this.hasDynamicGroups=!1,this.generatedGroupCount=0,this.groupBy="group",this.groups=[],this.searchGroups=[],this.generateGroups=[],this.requestGroups=[],this.result=[],this.tmpResult={},this.groupTemplate="",this.resultHtml=null,this.resultCount=0,this.resultCountPerGroup={},this.options=e,this.node=t,this.namespace="."+this.helper.slugify.call(this,this.selector)+i,this.isContentEditable="undefined"!=typeof this.node.attr("contenteditable")&&"false"!==this.node.attr("contenteditable"),this.container=null,this.resultContainer=null,this.item=null,this.items=null,this.comparedItems=null,this.xhr={},this.hintIndex=null,this.filters={dropdown:{},dynamic:{}},this.dropdownFilter={"static":[],dynamic:[]},this.dropdownFilterAll=null,this.isDropdownEvent=!1,this.requests={},this.backdrop={},this.hint={},this.label={},this.hasDragged=!1,this.focusOnly=!1,this.__construct()};a.prototype={_validateCacheMethod:function(t){var e,i=["localStorage","sessionStorage"];if(t===!0)t="localStorage";else if("string"==typeof t&&!~i.indexOf(t))return!1;e="undefined"!=typeof window[t];try{window[t].setItem("typeahead","typeahead"),window[t].removeItem("typeahead")}catch(s){e=!1}return e&&t||!1},extendOptions:function(){if(this.options.cache=this._validateCacheMethod(this.options.cache),this.options.compression&&("object"==typeof LZString&&this.options.cache||(this.options.compression=!1)),(!this.options.maxLength||isNaN(this.options.maxLength))&&(this.options.maxLength=1/0),"undefined"!=typeof this.options.maxItem&&~[0,!1].indexOf(this.options.maxItem)&&(this.options.maxItem=1/0),this.options.maxItemPerGroup&&!/^\d+$/.test(this.options.maxItemPerGroup)&&(this.options.maxItemPerGroup=null),this.options.display&&!Array.isArray(this.options.display)&&(this.options.display=[this.options.display]),this.options.multiselect&&(this.items=[],this.comparedItems=[],"string"==typeof this.options.multiselect.matchOn&&(this.options.multiselect.matchOn=[this.options.multiselect.matchOn])),this.options.group&&(Array.isArray(this.options.group)||("string"==typeof this.options.group?this.options.group={key:this.options.group}:"boolean"==typeof this.options.group&&(this.options.group={key:"group"}),this.options.group.key=this.options.group.key||"group")),this.options.highlight&&!~["any",!0].indexOf(this.options.highlight)&&(this.options.highlight=!1),this.options.dropdownFilter&&this.options.dropdownFilter instanceof Object){Array.isArray(this.options.dropdownFilter)||(this.options.dropdownFilter=[this.options.dropdownFilter]);for(var i=0,o=this.options.dropdownFilter.length;o>i;++i)this.dropdownFilter[this.options.dropdownFilter[i].value?"static":"dynamic"].push(this.options.dropdownFilter[i])}this.options.dynamicFilter&&!Array.isArray(this.options.dynamicFilter)&&(this.options.dynamicFilter=[this.options.dynamicFilter]),this.options.accent&&("object"==typeof this.options.accent?this.options.accent.from&&this.options.accent.to&&this.options.accent.from.length!==this.options.accent.to.length:this.options.accent=s),this.options.groupTemplate&&(this.groupTemplate=this.options.groupTemplate),this.options.resultContainer&&("string"==typeof this.options.resultContainer&&(this.options.resultContainer=t(this.options.resultContainer)),this.options.resultContainer instanceof t&&this.options.resultContainer[0]&&(this.resultContainer=this.options.resultContainer)),this.options.maxItemPerGroup&&this.options.group&&this.options.group.key&&(this.groupBy=this.options.group.key),this.options.callback&&this.options.callback.onClick&&(this.options.callback.onClickBefore=this.options.callback.onClick,delete this.options.callback.onClick),this.options.callback&&this.options.callback.onNavigate&&(this.options.callback.onNavigateBefore=this.options.callback.onNavigate,delete this.options.callback.onNavigate),this.options=t.extend(!0,{},e,this.options)},unifySourceFormat:function(){this.dynamicGroups=[],Array.isArray(this.options.source)&&(this.options.source={group:{data:this.options.source}}),"string"==typeof this.options.source&&(this.options.source={group:{ajax:{url:this.options.source}}}),this.options.source.ajax&&(this.options.source={group:{ajax:this.options.source.ajax}}),(this.options.source.url||this.options.source.data)&&(this.options.source={group:this.options.source});var t,e,i;for(t in this.options.source)if(this.options.source.hasOwnProperty(t)){if(e=this.options.source[t],"string"==typeof e&&(e={ajax:{url:e}}),i=e.url||e.ajax,Array.isArray(i)?(e.ajax="string"==typeof i[0]?{url:i[0]}:i[0],e.ajax.path=e.ajax.path||i[1]||null,delete e.url):("object"==typeof e.url?e.ajax=e.url:"string"==typeof e.url&&(e.ajax={url:e.url}),delete e.url),!e.data&&!e.ajax)return!1;e.display&&!Array.isArray(e.display)&&(e.display=[e.display]),e.minLength="number"==typeof e.minLength?e.minLength:this.options.minLength,e.maxLength="number"==typeof e.maxLength?e.maxLength:this.options.maxLength,e.dynamic="boolean"==typeof e.dynamic||this.options.dynamic,e.minLength>e.maxLength&&(e.minLength=e.maxLength),this.options.source[t]=e,this.options.source[t].dynamic&&this.dynamicGroups.push(t),e.cache="undefined"!=typeof e.cache?this._validateCacheMethod(e.cache):this.options.cache,e.compression&&("object"==typeof LZString&&e.cache||(e.compression=!1))}return this.hasDynamicGroups=this.options.dynamic||!!this.dynamicGroups.length,!0},init:function(){this.helper.executeCallback.call(this,this.options.callback.onInit,[this.node]),this.container=this.node.closest("."+this.options.selector.container)},delegateEvents:function(){var e=this,i=["focus"+this.namespace,"input"+this.namespace,"propertychange"+this.namespace,"keydown"+this.namespace,"keyup"+this.namespace,"search"+this.namespace,"generate"+this.namespace];t("html").on("touchmove",function(){e.hasDragged=!0}).on("touchstart",function(){e.hasDragged=!1}),this.node.closest("form").on("submit",function(t){return e.options.mustSelectItem&&e.helper.isEmpty(e.item)?void t.preventDefault():(e.options.backdropOnFocus||e.hideLayout(),e.options.callback.onSubmit?e.helper.executeCallback.call(e,e.options.callback.onSubmit,[e.node,this,e.item||e.items,t]):void 0)}).on("reset",function(){setTimeout(function(){e.node.trigger("input"+e.namespace),e.hideLayout()})});var s=!1;if(this.node.attr("placeholder")&&(n||r)){var a=!0;this.node.on("focusin focusout",function(){a=!(this.value||!this.placeholder)}),this.node.on("input",function(t){a&&(t.stopImmediatePropagation(),a=!1)})}this.node.off(this.namespace).on(i.join(" "),function(i,n){switch(i.type){case"generate":e.generateSource(Object.keys(e.options.source));break;case"focus":if(e.focusOnly){e.focusOnly=!1;break}e.options.backdropOnFocus&&(e.buildBackdropLayout(),e.showLayout()),e.options.searchOnFocus&&!e.item&&(e.deferred=t.Deferred(),e.assignQuery(),e.generateSource());break;case"keydown":8===i.keyCode&&e.options.multiselect&&e.options.multiselect.cancelOnBackspace&&""===e.query&&e.items.length?e.cancelMultiselectItem(e.items.length-1,null,i):i.keyCode&&~[9,13,27,38,39,40].indexOf(i.keyCode)&&(s=!0,e.navigate(i));break;case"keyup":o&&e.node[0].value.replace(/^\s+/,"").toString().length<e.query.length&&e.node.trigger("input"+e.namespace);break;case"propertychange":if(s){s=!1;break}case"input":e.deferred=t.Deferred(),e.assignQuery(),""===e.rawQuery&&""===e.query&&(i.originalEvent=n||{},e.helper.executeCallback.call(e,e.options.callback.onCancel,[e.node,i])),e.options.cancelButton&&e.toggleCancelButtonVisibility(),e.options.hint&&e.hint.container&&""!==e.hint.container.val()&&0!==e.hint.container.val().indexOf(e.rawQuery)&&(e.hint.container.val(""),e.isContentEditable&&e.hint.container.text("")),e.hasDynamicGroups?e.helper.typeWatch(function(){e.generateSource()},e.options.delay):e.generateSource();break;case"search":e.searchResult(),e.buildLayout(),e.result.length||e.searchGroups.length&&e.options.emptyTemplate&&e.query.length?e.showLayout():e.hideLayout(),e.deferred&&e.deferred.resolve()}return e.deferred&&e.deferred.promise()}),this.options.generateOnLoad&&this.node.trigger("generate"+this.namespace)},assignQuery:function(){this.isContentEditable?this.rawQuery=this.node.text():this.rawQuery=this.node.val().toString(),this.rawQuery=this.rawQuery.replace(/^\s+/,""),this.rawQuery!==this.query&&(this.item=null,this.query=this.rawQuery)},filterGenerateSource:function(){if(this.searchGroups=[],this.generateGroups=[],!this.focusOnly||this.options.multiselect)for(var t in this.options.source)if(this.options.source.hasOwnProperty(t)&&this.query.length>=this.options.source[t].minLength&&this.query.length<=this.options.source[t].maxLength){if(this.searchGroups.push(t),!this.options.source[t].dynamic&&this.source[t])continue;this.generateGroups.push(t)}},generateSource:function(e){if(this.filterGenerateSource(),Array.isArray(e)&&e.length)this.generateGroups=e;else if(!this.generateGroups.length)return void this.node.trigger("search"+this.namespace);if(this.requestGroups=[],this.generatedGroupCount=0,this.options.loadingAnimation&&this.container.addClass("loading"),!this.helper.isEmpty(this.xhr)){for(var i in this.xhr)this.xhr.hasOwnProperty(i)&&this.xhr[i].abort();this.xhr={}}for(var s,o,n,r,a,l,h,c=this,i=0,u=this.generateGroups.length;u>i;++i){if(s=this.generateGroups[i],n=this.options.source[s],r=n.cache,a=n.compression,r&&(l=window[r].getItem("TYPEAHEAD_"+this.selector+":"+s))){a&&(l=LZString.decompressFromUTF16(l)),h=!1;try{l=JSON.parse(l+""),l.data&&l.ttl>(new Date).getTime()?(this.populateSource(l.data,s),h=!0):window[r].removeItem("TYPEAHEAD_"+this.selector+":"+s)}catch(p){}if(h)continue}!n.data||n.ajax?n.ajax&&(this.requests[s]||(this.requests[s]=this.generateRequestObject(s)),this.requestGroups.push(s)):"function"==typeof n.data?(o=n.data.call(this),Array.isArray(o)?c.populateSource(o,s):"function"==typeof o.promise&&!function(e){t.when(o).then(function(t){t&&Array.isArray(t)&&c.populateSource(t,e)})}(s)):this.populateSource(t.extend(!0,[],n.data),s)}return this.requestGroups.length&&this.handleRequests(),!!this.generateGroups.length},generateRequestObject:function(t){var e=this,i=this.options.source[t],s={request:{url:i.ajax.url||null,dataType:"json",beforeSend:function(s,o){e.xhr[t]=s;var n=e.requests[t].callback.beforeSend||i.ajax.beforeSend;"function"==typeof n&&n.apply(null,arguments)}},callback:{beforeSend:null,done:null,fail:null,then:null,always:null},extra:{path:i.ajax.path||null,group:t},validForGroup:[t]};if("function"!=typeof i.ajax&&(i.ajax instanceof Object&&(s=this.extendXhrObject(s,i.ajax)),Object.keys(this.options.source).length>1))for(var o in this.requests)this.requests.hasOwnProperty(o)&&(this.requests[o].isDuplicated||s.request.url&&s.request.url===this.requests[o].request.url&&(this.requests[o].validForGroup.push(t),s.isDuplicated=!0,delete s.validForGroup));return s},extendXhrObject:function(e,i){return"object"==typeof i.callback&&(e.callback=i.callback,delete i.callback),"function"==typeof i.beforeSend&&(e.callback.beforeSend=i.beforeSend,delete i.beforeSend),e.request=t.extend(!0,e.request,i),"jsonp"!==e.request.dataType.toLowerCase()||e.request.jsonpCallback||(e.request.jsonpCallback="callback_"+e.extra.group),e},handleRequests:function(){var e,i=this,s=this.requestGroups.length;if(this.helper.executeCallback.call(this,this.options.callback.onSendRequest,[this.node,this.query])!==!1)for(var o=0,n=this.requestGroups.length;n>o;++o)e=this.requestGroups[o],this.requests[e].isDuplicated||!function(e,o){if("function"==typeof i.options.source[e].ajax){var n=i.options.source[e].ajax.call(i,i.query);if(o=i.extendXhrObject(i.generateRequestObject(e),"object"==typeof n?n:{}),"object"!=typeof o.request||!o.request.url)return void i.populateSource([],e);i.requests[e]=o}var r,a=!1,l={};if(~o.request.url.indexOf("{{query}}")&&(a||(o=t.extend(!0,{},o),a=!0),o.request.url=o.request.url.replace("{{query}}",encodeURIComponent(i.query))),o.request.data)for(var h in o.request.data)if(o.request.data.hasOwnProperty(h)&&~String(o.request.data[h]).indexOf("{{query}}")){a||(o=t.extend(!0,{},o),a=!0),o.request.data[h]=o.request.data[h].replace("{{query}}",i.query);break}t.ajax(o.request).done(function(t,e,s){for(var n,a=0,h=o.validForGroup.length;h>a;a++)n=o.validForGroup[a],r=i.requests[n],r.callback.done instanceof Function&&(l[n]=r.callback.done.call(i,t,e,s))}).fail(function(t,e,s){for(var n=0,a=o.validForGroup.length;a>n;n++)r=i.requests[o.validForGroup[n]],r.callback.fail instanceof Function&&r.callback.fail.call(i,t,e,s)}).always(function(t,e,n){for(var a,h=0,c=o.validForGroup.length;c>h;h++){if(a=o.validForGroup[h],r=i.requests[a],r.callback.always instanceof Function&&r.callback.always.call(i,t,e,n),"object"!=typeof n)return;i.populateSource(null!==t&&"function"==typeof t.promise&&[]||l[a]||t,r.extra.group,r.extra.path||r.request.path),s-=1,0===s&&i.helper.executeCallback.call(i,i.options.callback.onReceiveRequest,[i.node,i.query])}}).then(function(t,e){for(var s=0,n=o.validForGroup.length;n>s;s++)r=i.requests[o.validForGroup[s]],r.callback.then instanceof Function&&r.callback.then.call(i,t,e)})}(e,this.requests[e])},populateSource:function(e,i,s){var o=this,n=this.options.source[i],r=n.ajax&&n.data;s&&"string"==typeof s&&(e=this.helper.namespace.call(this,s,e)),Array.isArray(e)||(e=[]),r&&("function"==typeof r&&(r=r()),Array.isArray(r)&&(e=e.concat(r)));for(var a,l=n.display?"compiled"===n.display[0]?n.display[1]:n.display[0]:"compiled"===this.options.display[0]?this.options.display[1]:this.options.display[0],h=0,c=e.length;c>h;h++)null!==e[h]&&"boolean"!=typeof e[h]&&("string"==typeof e[h]&&(a={},a[l]=e[h],e[h]=a),e[h].group=i);if(!this.hasDynamicGroups&&this.dropdownFilter.dynamic.length)for(var u,p,d={},h=0,c=e.length;c>h;h++)for(var f=0,m=this.dropdownFilter.dynamic.length;m>f;f++)u=this.dropdownFilter.dynamic[f].key,p=e[h][u],p&&(this.dropdownFilter.dynamic[f].value||(this.dropdownFilter.dynamic[f].value=[]),d[u]||(d[u]=[]),~d[u].indexOf(p.toLowerCase())||(d[u].push(p.toLowerCase()),this.dropdownFilter.dynamic[f].value.push(p)));if(this.options.correlativeTemplate){var g=n.template||this.options.template,y="";if("function"==typeof g&&(g=g.call(this,"",{})),g){if(Array.isArray(this.options.correlativeTemplate))for(var h=0,c=this.options.correlativeTemplate.length;c>h;h++)y+="{{"+this.options.correlativeTemplate[h]+"}} ";else y=g.replace(/<.+?>/g," ").replace(/\s{2,}/," ").trim();for(var h=0,c=e.length;c>h;h++)e[h].compiled=t("<textarea />").html(y.replace(/\{\{([\w\-\.]+)(?:\|(\w+))?}}/g,function(t,i){return o.helper.namespace.call(o,i,e[h],"get","")}).trim()).text();n.display?~n.display.indexOf("compiled")||n.display.unshift("compiled"):~this.options.display.indexOf("compiled")||this.options.display.unshift("compiled")}else;}this.options.callback.onPopulateSource&&(e=this.helper.executeCallback.call(this,this.options.callback.onPopulateSource,[this.node,e,i,s])),this.tmpSource[i]=Array.isArray(e)&&e||[];var v=this.options.source[i].cache,b=this.options.source[i].compression,k=this.options.source[i].ttl||this.options.ttl;if(v&&!window[v].getItem("TYPEAHEAD_"+this.selector+":"+i)){this.options.callback.onCacheSave&&(e=this.helper.executeCallback.call(this,this.options.callback.onCacheSave,[this.node,e,i,s]));var w=JSON.stringify({data:e,ttl:(new Date).getTime()+k});b&&(w=LZString.compressToUTF16(w)),window[v].setItem("TYPEAHEAD_"+this.selector+":"+i,w)}this.incrementGeneratedGroup()},incrementGeneratedGroup:function(){if(this.generatedGroupCount++,this.generatedGroupCount===this.generateGroups.length){this.xhr={};for(var t=0,e=this.generateGroups.length;e>t;t++)this.source[this.generateGroups[t]]=this.tmpSource[this.generateGroups[t]];this.hasDynamicGroups||this.buildDropdownItemLayout("dynamic"),this.options.loadingAnimation&&this.container.removeClass("loading"),this.node.trigger("search"+this.namespace)}},navigate:function(t){if(this.helper.executeCallback.call(this,this.options.callback.onNavigateBefore,[this.node,this.query,t]),27===t.keyCode)return t.preventDefault(),void(this.query.length?(this.resetInput(),this.node.trigger("input"+this.namespace,[t])):(this.node.blur(),this.hideLayout()));if(this.result.length){var e=this.resultContainer.find("."+this.options.selector.item).not("[disabled]"),i=e.filter(".active"),s=i[0]?e.index(i):null,o=i[0]?i.attr("data-index"):null,n=null,r=null;if(this.clearActiveItem(),this.helper.executeCallback.call(this,this.options.callback.onLeave,[this.node,null!==s&&e.eq(s)||void 0,null!==o&&this.result[o]||void 0,t]),13===t.keyCode)return t.preventDefault(),void(i.length>0?"javascript:;"===i.find("a:first")[0].href?i.find("a:first").trigger("click",t):i.find("a:first")[0].click():this.node.closest("form").trigger("submit"));if(39===t.keyCode)return void(null!==s?e.eq(s).find("a:first")[0].click():this.options.hint&&""!==this.hint.container.val()&&this.helper.getCaret(this.node[0])>=this.query.length&&e.filter('[data-index="'+this.hintIndex+'"]').find("a:first")[0].click());9===t.keyCode?this.options.blurOnTab?this.hideLayout():i.length>0?s+1<e.length?(t.preventDefault(),n=s+1,this.addActiveItem(e.eq(n))):this.hideLayout():e.length?(t.preventDefault(),n=0,this.addActiveItem(e.first())):this.hideLayout():38===t.keyCode?(t.preventDefault(),i.length>0?s-1>=0&&(n=s-1,this.addActiveItem(e.eq(n))):e.length&&(n=e.length-1,this.addActiveItem(e.last()))):40===t.keyCode&&(t.preventDefault(),i.length>0?s+1<e.length&&(n=s+1,this.addActiveItem(e.eq(n))):e.length&&(n=0,this.addActiveItem(e.first()))),r=null!==n?e.eq(n).attr("data-index"):null,this.helper.executeCallback.call(this,this.options.callback.onEnter,[this.node,null!==n&&e.eq(n)||void 0,null!==r&&this.result[r]||void 0,t]),t.preventInputChange&&~[38,40].indexOf(t.keyCode)&&this.buildHintLayout(null!==r&&r<this.result.length?[this.result[r]]:null),this.options.hint&&this.hint.container&&this.hint.container.css("color",t.preventInputChange?this.hint.css.color:null===r&&this.hint.css.color||this.hint.container.css("background-color")||"fff");var a=null===r||t.preventInputChange?this.rawQuery:this.getTemplateValue.call(this,this.result[r]);this.node.val(a),this.isContentEditable&&this.node.text(a),this.helper.executeCallback.call(this,this.options.callback.onNavigateAfter,[this.node,e,null!==n&&e.eq(n).find("a:first")||void 0,null!==r&&this.result[r]||void 0,this.query,t])}},getTemplateValue:function(t){if(t){var e=t.group&&this.options.source[t.group].templateValue||this.options.templateValue;if("function"==typeof e&&(e=e.call(this)),!e)return this.helper.namespace.call(this,t.matchedKey,t).toString();var i=this;return e.replace(/\{\{([\w\-.]+)}}/gi,function(e,s){return i.helper.namespace.call(i,s,t,"get","")})}},clearActiveItem:function(){this.resultContainer.find("."+this.options.selector.item).removeClass("active")},addActiveItem:function(t){t.addClass("active")},searchResult:function(){this.resetLayout(),this.helper.executeCallback.call(this,this.options.callback.onSearch,[this.node,this.query])!==!1&&(!this.searchGroups.length||this.options.multiselect&&this.options.multiselect.limit&&this.items.length>=this.options.multiselect.limit||this.searchResultData(),this.helper.executeCallback.call(this,this.options.callback.onResult,[this.node,this.query,this.result,this.resultCount,this.resultCountPerGroup]),this.isDropdownEvent&&(this.helper.executeCallback.call(this,this.options.callback.onDropdownFilter,[this.node,this.query,this.filters.dropdown,this.result]),this.isDropdownEvent=!1))},searchResultData:function(){var e,i,s,o,n,r,a,l,h,c,u,p,d,f=this,m=this.groupBy,g=null,y=this.query.toLowerCase(),v=this.options.maxItem,b=this.options.maxItemPerGroup,k=this.filters.dynamic&&!this.helper.isEmpty(this.filters.dynamic),w="function"==typeof this.options.matcher&&this.options.matcher;this.options.accent&&(y=this.helper.removeAccent.call(this,y));for(var x=0,C=this.searchGroups.length;C>x;++x)if(e=this.searchGroups[x],!this.filters.dropdown||"group"!==this.filters.dropdown.key||this.filters.dropdown.value===e){a="undefined"!=typeof this.options.source[e].filter?this.options.source[e].filter:this.options.filter,h="function"==typeof this.options.source[e].matcher&&this.options.source[e].matcher||w;for(var q=0,A=this.source[e].length;A>q&&(!(this.resultItemCount>=v)||this.options.callback.onResult);q++)if((!k||this.dynamicFilter.validate.apply(this,[this.source[e][q]]))&&(i=this.source[e][q],null!==i&&"boolean"!=typeof i&&(!this.options.multiselect||this.isMultiselectUniqueData(i))&&(!this.filters.dropdown||(i[this.filters.dropdown.key]||"").toLowerCase()===(this.filters.dropdown.value||"").toLowerCase()))){if(g="group"===m?e:i[m]?i[m]:i.group,g&&!this.tmpResult[g]&&(this.tmpResult[g]=[],this.resultCountPerGroup[g]=0),b&&"group"===m&&this.tmpResult[g].length>=b&&!this.options.callback.onResult)break;n=this.options.source[e].display||this.options.display;for(var O=0,S=n.length;S>O;++O){if(a!==!1){if(r=/\./.test(n[O])?this.helper.namespace.call(this,n[O],i):i[n[O]],"undefined"==typeof r||""===r)continue;r=this.helper.cleanStringFromScript(r)}if("function"==typeof a){if(l=a.call(this,i,r),void 0===l)break;if(!l)continue;"object"==typeof l&&(i=l)}if(~[void 0,!0].indexOf(a)){if(o=r,o=o.toString().toLowerCase(),this.options.accent&&(o=this.helper.removeAccent.call(this,o)),s=o.indexOf(y),this.options.correlativeTemplate&&"compiled"===n[O]&&0>s&&/\s/.test(y)){u=!0,p=y.split(" "),d=o;for(var F=0,L=p.length;L>F;F++)if(""!==p[F]){if(!~d.indexOf(p[F])){u=!1;break}d=d.replace(p[F],"")}}if(0>s&&!u)continue;if(this.options.offset&&0!==s)continue;if(h){if(c=h.call(this,i,r),void 0===c)break;if(!c)continue;"object"==typeof c&&(i=c)}}if(this.resultCount++,this.resultCountPerGroup[g]++,this.resultItemCount<v){if(b&&this.tmpResult[g].length>=b)break;this.tmpResult[g].push(t.extend(!0,{matchedKey:n[O]},i)),this.resultItemCount++}break}if(!this.options.callback.onResult){if(this.resultItemCount>=v)break;if(b&&this.tmpResult[g].length>=b&&"group"===m)break}}}if(this.options.order){var I,n=[];for(var e in this.tmpResult)if(this.tmpResult.hasOwnProperty(e)){for(var x=0,C=this.tmpResult[e].length;C>x;x++)I=this.options.source[this.tmpResult[e][x].group].display||this.options.display,~n.indexOf(I[0])||n.push(I[0]);this.tmpResult[e].sort(f.helper.sort(n,"asc"===f.options.order,function(t){return t.toString().toUpperCase()}))}}var j=[],G=[];G="function"==typeof this.options.groupOrder?this.options.groupOrder.apply(this,[this.node,this.query,this.tmpResult,this.resultCount,this.resultCountPerGroup]):Array.isArray(this.options.groupOrder)?this.options.groupOrder:"string"==typeof this.options.groupOrder&&~["asc","desc"].indexOf(this.options.groupOrder)?Object.keys(this.tmpResult).sort(f.helper.sort([],"asc"===f.options.groupOrder,function(t){return t.toString().toUpperCase()})):Object.keys(this.tmpResult);for(var x=0,C=G.length;C>x;x++)j=j.concat(this.tmpResult[G[x]]||[]);this.groups=JSON.parse(JSON.stringify(G)),this.result=j},buildLayout:function(){this.buildHtmlLayout(),this.buildBackdropLayout(),this.buildHintLayout(),this.options.callback.onLayoutBuiltBefore&&this.helper.executeCallback.call(this,this.options.callback.onLayoutBuiltBefore,[this.node,this.query,this.result,this.resultHtml]),this.resultHtml instanceof t&&this.resultContainer.html(this.resultHtml),this.options.callback.onLayoutBuiltAfter&&this.helper.executeCallback.call(this,this.options.callback.onLayoutBuiltAfter,[this.node,this.query,this.result])},buildHtmlLayout:function(){if(this.options.resultContainer!==!1){this.resultContainer||(this.resultContainer=t("<div/>",{"class":this.options.selector.result}),this.container.append(this.resultContainer));var e;if(!this.result.length)if(this.options.multiselect&&this.options.multiselect.limit&&this.items.length>=this.options.multiselect.limit)e=this.options.multiselect.limitTemplate?"function"==typeof this.options.multiselect.limitTemplate?this.options.multiselect.limitTemplate.call(this,this.query):this.options.multiselect.limitTemplate.replace(/\{\{query}}/gi,t("<div>").text(this.helper.cleanStringFromScript(this.query)).html()):"Can't select more than "+this.items.length+" items.";else{if(!this.options.emptyTemplate||""===this.query)return;e="function"==typeof this.options.emptyTemplate?this.options.emptyTemplate.call(this,this.query):this.options.emptyTemplate.replace(/\{\{query}}/gi,t("<div>").text(this.helper.cleanStringFromScript(this.query)).html())}var i=this.query.toLowerCase();this.options.accent&&(i=this.helper.removeAccent.call(this,i));var s=this,o=this.groupTemplate||"<ul></ul>",n=!1;this.groupTemplate?o=t(o.replace(/<([^>]+)>\{\{(.+?)}}<\/[^>]+>/g,function(t,i,o,r,a){var l="",h="group"===o?s.groups:[o];if(!s.result.length)return n===!0?"":(n=!0,"<"+i+' class="'+s.options.selector.empty+'">'+e+"</"+i+">");for(var c=0,u=h.length;u>c;++c)l+="<"+i+' data-group-template="'+h[c]+'"><ul></ul></'+i+">";return l})):(o=t(o),this.result.length||o.append(e instanceof t?e:'<li class="'+s.options.selector.empty+'">'+e+"</li>")),o.addClass(this.options.selector.list+(this.helper.isEmpty(this.result)?" empty":""));for(var r,a,l,h,c,u,p,d,f,m,g,y=this.groupTemplate&&this.result.length&&s.groups||[],v=0,b=this.result.length;b>v;++v)l=this.result[v],r=l.group,h=!this.options.multiselect&&this.options.source[l.group].href||this.options.href,d=[],f=this.options.source[l.group].display||this.options.display,this.options.group&&(r=l[this.options.group.key],this.options.group.template&&("function"==typeof this.options.group.template?a=this.options.group.template.call(this,l):"string"==typeof this.options.group.template&&(a=this.options.group.template.replace(/\{\{([\w\-\.]+)}}/gi,function(t,e){return s.helper.namespace.call(s,e,l,"get","")}))),o.find('[data-search-group="'+r+'"]')[0]||(this.groupTemplate?o.find('[data-group-template="'+r+'"] ul'):o).append(t("<li/>",{"class":s.options.selector.group,html:t("<a/>",{href:"javascript:;",html:a||r,tabindex:-1}),"data-search-group":r}))),this.groupTemplate&&y.length&&(g=y.indexOf(r||l.group),~g&&y.splice(g,1)),c=t("<li/>",{"class":s.options.selector.item+" "+s.options.selector.group+"-"+this.helper.slugify.call(this,r),disabled:l.disabled?!0:!1,"data-group":r,"data-index":v,html:t("<a/>",{href:h&&!l.disabled?function(t,e){return e.href=s.generateHref.call(s,t,e)}(h,l):"javascript:;",html:function(){if(u=l.group&&s.options.source[l.group].template||s.options.template)"function"==typeof u&&(u=u.call(s,s.query,l)),p=u.replace(/\{\{([^\|}]+)(?:\|([^}]+))*}}/gi,function(t,e,o){var n=s.helper.cleanStringFromScript(String(s.helper.namespace.call(s,e,l,"get","")));return o=o&&o.split("|")||[],~o.indexOf("slugify")&&(n=s.helper.slugify.call(s,n)),~o.indexOf("raw")||s.options.highlight===!0&&i&&~f.indexOf(e)&&(n=s.helper.highlight.call(s,n,i.split(" "),s.options.accent)),n});else{for(var e=0,o=f.length;o>e;e++)m=/\./.test(f[e])?s.helper.namespace.call(s,f[e],l,"get",""):l[f[e]],"undefined"!=typeof m&&""!==m&&d.push(m);p='<span class="'+s.options.selector.display+'">'+s.helper.cleanStringFromScript(String(d.join(" ")))+"</span>"}(s.options.highlight===!0&&i&&!u||"any"===s.options.highlight)&&(p=s.helper.highlight.call(s,p,i.split(" "),s.options.accent)),t(this).append(p)}})}),function(e,i,o){o.on("click",function(e,o){if(i.disabled)return void e.preventDefault();if(o&&"object"==typeof o&&(e.originalEvent=o),s.options.mustSelectItem&&s.helper.isEmpty(i))return void e.preventDefault();if(s.options.multiselect?(s.items.push(i),s.comparedItems.push(s.getMultiselectComparedData(i))):s.item=i,s.helper.executeCallback.call(s,s.options.callback.onClickBefore,[s.node,t(this),i,e])!==!1&&!(e.originalEvent&&e.originalEvent.defaultPrevented||e.isDefaultPrevented())){var n=s.getTemplateValue.call(s,i);s.options.multiselect?(s.query=s.rawQuery="",s.addMultiselectItemLayout(n)):(s.focusOnly=!0,s.query=s.rawQuery=n,s.isContentEditable&&(s.node.text(s.query),s.helper.setCaretAtEnd(s.node[0]))),s.hideLayout(),s.node.val(s.query).focus(),s.helper.executeCallback.call(s,s.options.callback.onClickAfter,[s.node,t(this),i,e])}}),o.on("mouseenter",function(e){i.disabled||(s.clearActiveItem(),s.addActiveItem(t(this))),s.helper.executeCallback.call(s,s.options.callback.onEnter,[s.node,t(this),i,e])}),o.on("mouseleave",function(e){i.disabled||s.clearActiveItem(),s.helper.executeCallback.call(s,s.options.callback.onLeave,[s.node,t(this),i,e])})}(v,l,c),(this.groupTemplate?o.find('[data-group-template="'+r+'"] ul'):o).append(c);if(this.result.length&&y.length)for(var v=0,b=y.length;b>v;++v)o.find('[data-group-template="'+y[v]+'"]').remove();this.resultHtml=o}},generateHref:function(t,e){var i=this;return"string"==typeof t?t=t.replace(/\{\{([^\|}]+)(?:\|([^}]+))*}}/gi,function(t,s,o){var n=i.helper.namespace.call(i,s,e,"get","");return o=o&&o.split("|")||[],~o.indexOf("slugify")&&(n=i.helper.slugify.call(i,n)),n}):"function"==typeof t&&(t=t.call(this,e)),t},getMultiselectComparedData:function(t){var e="";if(Array.isArray(this.options.multiselect.matchOn))for(var i=0,s=this.options.multiselect.matchOn.length;s>i;++i)e+="undefined"!=typeof t[this.options.multiselect.matchOn[i]]?t[this.options.multiselect.matchOn[i]]:"";else{for(var o=JSON.parse(JSON.stringify(t)),n=["group","matchedKey","compiled","href"],i=0,s=n.length;s>i;++i)delete o[n[i]];e=JSON.stringify(o)}return e},buildBackdropLayout:function(){this.options.backdrop&&(this.backdrop.container||(this.backdrop.css=t.extend({opacity:.6,filter:"alpha(opacity=60)",position:"fixed",top:0,right:0,bottom:0,left:0,"z-index":1040,"background-color":"#000"},this.options.backdrop),this.backdrop.container=t("<div/>",{"class":this.options.selector.backdrop,css:this.backdrop.css}).insertAfter(this.container)),
this.container.addClass("backdrop").css({"z-index":this.backdrop.css["z-index"]+1,position:"relative"}))},buildHintLayout:function(e){if(this.options.hint){if(this.node[0].scrollWidth>Math.ceil(this.node.innerWidth()))return void(this.hint.container&&this.hint.container.val(""));var i=this,s="",e=e||this.result,o=this.query.toLowerCase();if(this.options.accent&&(o=this.helper.removeAccent.call(this,o)),this.hintIndex=null,this.searchGroups.length){if(this.hint.container||(this.hint.css=t.extend({"border-color":"transparent",position:"absolute",top:0,display:"inline","z-index":-1,"float":"none",color:"silver","box-shadow":"none",cursor:"default","-webkit-user-select":"none","-moz-user-select":"none","-ms-user-select":"none","user-select":"none"},this.options.hint),this.hint.container=t("<"+this.node[0].nodeName+"/>",{type:this.node.attr("type"),"class":this.node.attr("class"),readonly:!0,unselectable:"on","aria-hidden":"true",tabindex:-1,click:function(){i.node.focus()}}).addClass(this.options.selector.hint).css(this.hint.css).insertAfter(this.node),this.node.parent().css({position:"relative"})),this.hint.container.css("color",this.hint.css.color),o)for(var n,r,a,l=0,h=e.length;h>l;l++)if(!e[l].disabled){r=e[l].group,n=this.options.source[r].display||this.options.display;for(var c=0,u=n.length;u>c;c++)if(a=String(e[l][n[c]]).toLowerCase(),this.options.accent&&(a=this.helper.removeAccent.call(this,a)),0===a.indexOf(o)){s=String(e[l][n[c]]),this.hintIndex=l;break}if(null!==this.hintIndex)break}var p=s.length>0&&this.rawQuery+s.substring(this.query.length)||"";this.hint.container.val(p),this.isContentEditable&&this.hint.container.text(p)}}},buildDropdownLayout:function(){if(this.options.dropdownFilter){var e=this;t("<span/>",{"class":this.options.selector.filter,html:function(){t(this).append(t("<button/>",{type:"button","class":e.options.selector.filterButton,style:"display: none;",click:function(){e.container.toggleClass("filter");var i=e.namespace+"-dropdown-filter";t("html").off(i),e.container.hasClass("filter")&&t("html").on("click"+i+" touchend"+i,function(s){t(s.target).closest("."+e.options.selector.filter)[0]&&t(s.target).closest(e.container)[0]||e.hasDragged||(e.container.removeClass("filter"),t("html").off(i))})}})),t(this).append(t("<ul/>",{"class":e.options.selector.dropdown}))}}).insertAfter(e.container.find("."+e.options.selector.query))}},buildDropdownItemLayout:function(e){function i(t){"*"===t.value?delete this.filters.dropdown:this.filters.dropdown=t,this.container.removeClass("filter").find("."+this.options.selector.filterButton).html(t.template),this.isDropdownEvent=!0,this.node.trigger("search"+this.namespace),this.options.multiselect&&this.adjustInputSize(),this.node.focus()}if(this.options.dropdownFilter){var s,o,n=this,r="string"==typeof this.options.dropdownFilter&&this.options.dropdownFilter||"All",a=this.container.find("."+this.options.selector.dropdown);"static"!==e||this.options.dropdownFilter!==!0&&"string"!=typeof this.options.dropdownFilter||this.dropdownFilter["static"].push({key:"group",template:"{{group}}",all:r,value:Object.keys(this.options.source)});for(var l=0,h=this.dropdownFilter[e].length;h>l;l++){o=this.dropdownFilter[e][l],Array.isArray(o.value)||(o.value=[o.value]),o.all&&(this.dropdownFilterAll=o.all);for(var c=0,u=o.value.length;u>=c;c++)(c!==u||l===h-1)&&(c===u&&l===h-1&&"static"===e&&this.dropdownFilter.dynamic.length||(s=this.dropdownFilterAll||r,o.value[c]?s=o.template?o.template.replace(new RegExp("{{"+o.key+"}}","gi"),o.value[c]):o.value[c]:this.container.find("."+n.options.selector.filterButton).html(s),function(e,s,o){a.append(t("<li/>",{"class":n.options.selector.dropdownItem+" "+n.helper.slugify.call(n,s.key+"-"+(s.value[e]||r)),html:t("<a/>",{href:"javascript:;",html:o,click:function(t){t.preventDefault(),i.call(n,{key:s.key,value:s.value[e]||"*",template:o})}})}))}(c,o,s)))}this.dropdownFilter[e].length&&this.container.find("."+n.options.selector.filterButton).removeAttr("style")}},dynamicFilter:{isEnabled:!1,init:function(){this.options.dynamicFilter&&(this.dynamicFilter.bind.call(this),this.dynamicFilter.isEnabled=!0)},validate:function(t){var e,i,s=null,o=null;for(var n in this.filters.dynamic)if(this.filters.dynamic.hasOwnProperty(n)&&(i=~n.indexOf(".")?this.helper.namespace.call(this,n,t,"get"):t[n],"|"!==this.filters.dynamic[n].modifier||s||(s=i==this.filters.dynamic[n].value||!1),"&"===this.filters.dynamic[n].modifier)){if(i!=this.filters.dynamic[n].value){o=!1;break}o=!0}return e=s,null!==o&&(e=o,o===!0&&null!==s&&(e=s)),!!e},set:function(t,e){var i=t.match(/^([|&])?(.+)/);e?this.filters.dynamic[i[2]]={modifier:i[1]||"|",value:e}:delete this.filters.dynamic[i[2]],this.dynamicFilter.isEnabled&&this.generateSource()},bind:function(){for(var e,i=this,s=0,o=this.options.dynamicFilter.length;o>s;s++)e=this.options.dynamicFilter[s],"string"==typeof e.selector&&(e.selector=t(e.selector)),e.selector instanceof t&&e.selector[0]&&e.key&&!function(t){t.selector.off(i.namespace).on("change"+i.namespace,function(){i.dynamicFilter.set.apply(i,[t.key,i.dynamicFilter.getValue(this)])}).trigger("change"+i.namespace)}(e)},getValue:function(t){var e;return"SELECT"===t.tagName?e=t.value:"INPUT"===t.tagName&&("checkbox"===t.type?e=t.checked&&t.getAttribute("value")||t.checked||null:"radio"===t.type&&t.checked&&(e=t.value)),e}},buildMultiselectLayout:function(){if(this.options.multiselect){var e,i=this;this.label.container=t("<span/>",{"class":this.options.selector.labelContainer,"data-padding-left":parseFloat(this.node.css("padding-left"))||0,"data-padding-right":parseFloat(this.node.css("padding-right"))||0,"data-padding-top":parseFloat(this.node.css("padding-top"))||0,click:function(e){t(e.target).hasClass(i.options.selector.labelContainer)&&i.node.focus()}}),this.node.closest("."+this.options.selector.query).prepend(this.label.container),this.options.multiselect.data&&(Array.isArray(this.options.multiselect.data)?this.populateMultiselectData(this.options.multiselect.data):"function"==typeof this.options.multiselect.data&&(e=this.options.multiselect.data.call(this),Array.isArray(e)?this.populateMultiselectData(e):"function"==typeof e.promise&&t.when(e).then(function(t){t&&Array.isArray(t)&&i.populateMultiselectData(t)})))}},isMultiselectUniqueData:function(t){for(var e=!0,i=0,s=this.comparedItems.length;s>i;++i)if(this.comparedItems[i]===this.getMultiselectComparedData(t)){e=!1;break}return e},populateMultiselectData:function(t){for(var e=0,i=t.length;i>e;++e)this.isMultiselectUniqueData(t[e])&&(this.items.push(t[e]),this.comparedItems.push(this.getMultiselectComparedData(t[e])),this.addMultiselectItemLayout(this.getTemplateValue(t[e])));this.node.trigger("search"+this.namespace,{origin:"populateMultiselectData"})},addMultiselectItemLayout:function(e){var i=this,s=this.options.multiselect.href?"a":"span",o=t("<span/>",{"class":this.options.selector.label,html:t("<"+s+"/>",{text:e,click:function(e){var s=t(this).closest("."+i.options.selector.label),o=i.label.container.find("."+i.options.selector.label).index(s);i.options.multiselect.callback&&i.helper.executeCallback.call(i,i.options.multiselect.callback.onClick,[i.node,i.items[o],e])},href:this.options.multiselect.href?function(t){return i.generateHref.call(i,i.options.multiselect.href,t)}(i.items[i.items.length-1]):null})});o.append(t("<span/>",{"class":this.options.selector.cancelButton,html:"×",click:function(e){var s=t(this).closest("."+i.options.selector.label),o=i.label.container.find("."+i.options.selector.label).index(s);i.cancelMultiselectItem(o,s,e)}})),this.label.container.append(o),this.adjustInputSize()},cancelMultiselectItem:function(t,e,i){var s=this.items[t];e=e||this.label.container.find("."+this.options.selector.label).eq(t),e.remove(),this.items.splice(t,1),this.comparedItems.splice(t,1),this.options.multiselect.callback&&this.helper.executeCallback.call(this,this.options.multiselect.callback.onCancel,[this.node,s,i]),this.adjustInputSize(),this.focusOnly=!0,this.node.focus().trigger("input"+this.namespace,{origin:"cancelMultiselectItem"})},adjustInputSize:function(){var e=this.node[0].getBoundingClientRect().width-(parseFloat(this.label.container.data("padding-right"))||0)-(parseFloat(this.label.container.css("padding-left"))||0),i=0,s=0,o=0,n=!1,r=0;this.label.container.find("."+this.options.selector.label).filter(function(a,l){0===a&&(r=t(l)[0].getBoundingClientRect().height+parseFloat(t(l).css("margin-bottom")||0)),i=t(l)[0].getBoundingClientRect().width+parseFloat(t(l).css("margin-right")||0),o+i>.7*e&&!n&&(s++,n=!0),e>o+i?o+=i:(n=!1,o=i)});var a=parseFloat(this.label.container.data("padding-left")||0)+(n?0:o),l=s*r+parseFloat(this.label.container.data("padding-top")||0);this.container.find("."+this.options.selector.query).find("input, textarea, [contenteditable], .typeahead__hint").css({paddingLeft:a,paddingTop:l})},showLayout:function(){function e(){var e=this;t("html").off("keydown"+this.namespace).on("keydown"+this.namespace,function(i){i.keyCode&&9===i.keyCode&&setTimeout(function(){t(":focus").closest(e.container).find(e.node)[0]||e.hideLayout()},0)}),t("html").off("click"+this.namespace+" touchend"+this.namespace).on("click"+this.namespace+" touchend"+this.namespace,function(i){t(i.target).closest(e.container)[0]||t(i.target).closest("."+e.options.selector.item)[0]||i.target.className===e.options.selector.cancelButton||e.hasDragged||e.hideLayout()})}!this.container.hasClass("result")&&(this.result.length||this.options.emptyTemplate||this.options.backdropOnFocus)&&(e.call(this),this.container.addClass([this.result.length||this.searchGroups.length&&this.options.emptyTemplate&&this.query.length?"result ":"",this.options.hint&&this.searchGroups.length?"hint":"",this.options.backdrop||this.options.backdropOnFocus?"backdrop":""].join(" ")),this.helper.executeCallback.call(this,this.options.callback.onShowLayout,[this.node,this.query]))},hideLayout:function(){(this.container.hasClass("result")||this.container.hasClass("backdrop"))&&(this.container.removeClass("result hint filter"+(this.options.backdropOnFocus&&t(this.node).is(":focus")?"":" backdrop")),this.options.backdropOnFocus&&this.container.hasClass("backdrop")||(t("html").off(this.namespace),this.helper.executeCallback.call(this,this.options.callback.onHideLayout,[this.node,this.query])))},resetLayout:function(){this.result=[],this.tmpResult={},this.groups=[],this.resultCount=0,this.resultCountPerGroup={},this.resultItemCount=0,this.resultHtml=null,this.options.hint&&this.hint.container&&(this.hint.container.val(""),this.isContentEditable&&this.hint.container.text(""))},resetInput:function(){this.node.val(""),this.isContentEditable&&this.node.text(""),this.item=null,this.query="",this.rawQuery=""},buildCancelButtonLayout:function(){if(this.options.cancelButton){var e=this;t("<span/>",{"class":this.options.selector.cancelButton,html:"×",mousedown:function(t){t.stopImmediatePropagation(),t.preventDefault(),e.resetInput(),e.node.trigger("input"+e.namespace,[t])}}).insertBefore(this.node)}},toggleCancelButtonVisibility:function(){this.container.toggleClass("cancel",!!this.query.length)},__construct:function(){this.extendOptions(),this.unifySourceFormat()&&(this.dynamicFilter.init.apply(this),this.init(),this.buildDropdownLayout(),this.buildDropdownItemLayout("static"),this.buildMultiselectLayout(),this.delegateEvents(),this.buildCancelButtonLayout(),this.helper.executeCallback.call(this,this.options.callback.onReady,[this.node]))},helper:{isEmpty:function(t){for(var e in t)if(t.hasOwnProperty(e))return!1;return!0},removeAccent:function(t){if("string"==typeof t){var e=s;return"object"==typeof this.options.accent&&(e=this.options.accent),t=t.toLowerCase().replace(new RegExp("["+e.from+"]","g"),function(t){return e.to[e.from.indexOf(t)]})}},slugify:function(t){return t=String(t),""!==t&&(t=this.helper.removeAccent.call(this,t),t=t.replace(/[^-a-z0-9]+/g,"-").replace(/-+/g,"-").replace(/^-|-$/g,"")),t},sort:function(t,e,i){var s=function(e){for(var s=0,o=t.length;o>s;s++)if("undefined"!=typeof e[t[s]])return i(e[t[s]]);return e};return e=[-1,1][+!!e],function(t,i){return t=s(t),i=s(i),e*((t>i)-(i>t))}},replaceAt:function(t,e,i,s){return t.substring(0,e)+s+t.substring(e+i)},highlight:function(t,e,i){t=String(t);var s=i&&this.helper.removeAccent.call(this,t)||t,o=[];Array.isArray(e)||(e=[e]),e.sort(function(t,e){return e.length-t.length});for(var n=e.length-1;n>=0;n--)""!==e[n].trim()?e[n]=e[n].replace(/[-[\]{}()*+?.,\\^$|#\s]/g,"\\$&"):e.splice(n,1);s.replace(new RegExp("(?:"+e.join("|")+")(?!([^<]+)?>)","gi"),function(t,e,i){o.push({offset:i,length:t.length})});for(var n=o.length-1;n>=0;n--)t=this.helper.replaceAt(t,o[n].offset,o[n].length,"<strong>"+t.substr(o[n].offset,o[n].length)+"</strong>");return t},getCaret:function(t){var e=0;if(t.selectionStart)return t.selectionStart;if(document.selection){var i=document.selection.createRange();if(null===i)return e;var s=t.createTextRange(),o=s.duplicate();s.moveToBookmark(i.getBookmark()),o.setEndPoint("EndToStart",s),e=o.text.length}else if(window.getSelection){var n=window.getSelection();if(n.rangeCount){var r=n.getRangeAt(0);r.commonAncestorContainer.parentNode==t&&(e=r.endOffset)}}return e},setCaretAtEnd:function(t){if("undefined"!=typeof window.getSelection&&"undefined"!=typeof document.createRange){var e=document.createRange();e.selectNodeContents(t),e.collapse(!1);var i=window.getSelection();i.removeAllRanges(),i.addRange(e)}else if("undefined"!=typeof document.body.createTextRange){var s=document.body.createTextRange();s.moveToElementText(t),s.collapse(!1),s.select()}},cleanStringFromScript:function(t){return"string"==typeof t&&t.replace(/<\/?(?:script|iframe)\b[^>]*>/gm,"")||t},executeCallback:function(t,e){if(t){var i;if("function"==typeof t)i=t;else if(("string"==typeof t||Array.isArray(t))&&("string"==typeof t&&(t=[t,[]]),i=this.helper.namespace.call(this,t[0],window),"function"!=typeof i))return;return i.apply(this,(t[1]||[]).concat(e?e:[]))}},namespace:function(t,e,i,s){if("string"!=typeof t||""===t)return!1;var o="undefined"!=typeof s?s:void 0;if(!~t.indexOf("."))return e[t]||o;for(var n=t.split("."),r=e||window,i=i||"get",a="",l=0,h=n.length;h>l;l++){if(a=n[l],"undefined"==typeof r[a]){if(~["get","delete"].indexOf(i))return"undefined"!=typeof s?s:void 0;r[a]={}}if(~["set","create","delete"].indexOf(i)&&l===h-1){if("set"!==i&&"create"!==i)return delete r[a],!0;r[a]=o}r=r[a]}return r},typeWatch:function(){var t=0;return function(e,i){clearTimeout(t),t=setTimeout(e,i)}}()}},t.fn.typeahead=t.typeahead=function(t){return l.typeahead(this,t)};var l={typeahead:function(e,i){if(i&&i.source&&"object"==typeof i.source){if("function"==typeof e){if(!i.input)return;e=t(i.input)}if("undefined"==typeof e[0].value&&(e[0].value=e.text()),e.length){if(1===e.length)return e[0].selector=e.selector||i.input||e[0].nodeName.toLowerCase(),window.Typeahead[e[0].selector]=new a(e,i);for(var s,o={},n=0,r=e.length;r>n;++n)s=e[n].nodeName.toLowerCase(),"undefined"!=typeof o[s]&&(s+=n),e[n].selector=s,window.Typeahead[s]=o[s]=new a(e.eq(n),i);return o}}}};return window.console=window.console||{log:function(){}},Array.isArray||(Array.isArray=function(t){return"[object Array]"===Object.prototype.toString.call(t)}),"trim"in String.prototype||(String.prototype.trim=function(){return this.replace(/^\s+/,"").replace(/\s+$/,"")}),"indexOf"in Array.prototype||(Array.prototype.indexOf=function(t,e){void 0===e&&(e=0),0>e&&(e+=this.length),0>e&&(e=0);for(var i=this.length;i>e;e++)if(e in this&&this[e]===t)return e;return-1}),Object.keys||(Object.keys=function(t){var e,i=[];for(e in t)Object.prototype.hasOwnProperty.call(t,e)&&i.push(e);return i}),a});
/*! jQuery Validation Plugin - v1.17.0 - 7/29/2017
 * https://jqueryvalidation.org/
 * Copyright (c) 2017 Jörn Zaefferer; Licensed MIT */
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof module&&module.exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){a.extend(a.fn,{validate:function(b){if(!this.length)return void(b&&b.debug&&window.console&&console.warn("Nothing selected, can't validate, returning nothing."));var c=a.data(this[0],"validator");return c?c:(this.attr("novalidate","novalidate"),c=new a.validator(b,this[0]),a.data(this[0],"validator",c),c.settings.onsubmit&&(this.on("click.validate",":submit",function(b){c.submitButton=b.currentTarget,a(this).hasClass("cancel")&&(c.cancelSubmit=!0),void 0!==a(this).attr("formnovalidate")&&(c.cancelSubmit=!0)}),this.on("submit.validate",function(b){function d(){var d,e;return c.submitButton&&(c.settings.submitHandler||c.formSubmitted)&&(d=a("<input type='hidden'/>").attr("name",c.submitButton.name).val(a(c.submitButton).val()).appendTo(c.currentForm)),!c.settings.submitHandler||(e=c.settings.submitHandler.call(c,c.currentForm,b),d&&d.remove(),void 0!==e&&e)}return c.settings.debug&&b.preventDefault(),c.cancelSubmit?(c.cancelSubmit=!1,d()):c.form()?c.pendingRequest?(c.formSubmitted=!0,!1):d():(c.focusInvalid(),!1)})),c)},valid:function(){var b,c,d;return a(this[0]).is("form")?b=this.validate().form():(d=[],b=!0,c=a(this[0].form).validate(),this.each(function(){b=c.element(this)&&b,b||(d=d.concat(c.errorList))}),c.errorList=d),b},rules:function(b,c){var d,e,f,g,h,i,j=this[0];if(null!=j&&(!j.form&&j.hasAttribute("contenteditable")&&(j.form=this.closest("form")[0],j.name=this.attr("name")),null!=j.form)){if(b)switch(d=a.data(j.form,"validator").settings,e=d.rules,f=a.validator.staticRules(j),b){case"add":a.extend(f,a.validator.normalizeRule(c)),delete f.messages,e[j.name]=f,c.messages&&(d.messages[j.name]=a.extend(d.messages[j.name],c.messages));break;case"remove":return c?(i={},a.each(c.split(/\s/),function(a,b){i[b]=f[b],delete f[b]}),i):(delete e[j.name],f)}return g=a.validator.normalizeRules(a.extend({},a.validator.classRules(j),a.validator.attributeRules(j),a.validator.dataRules(j),a.validator.staticRules(j)),j),g.required&&(h=g.required,delete g.required,g=a.extend({required:h},g)),g.remote&&(h=g.remote,delete g.remote,g=a.extend(g,{remote:h})),g}}}),a.extend(a.expr.pseudos||a.expr[":"],{blank:function(b){return!a.trim(""+a(b).val())},filled:function(b){var c=a(b).val();return null!==c&&!!a.trim(""+c)},unchecked:function(b){return!a(b).prop("checked")}}),a.validator=function(b,c){this.settings=a.extend(!0,{},a.validator.defaults,b),this.currentForm=c,this.init()},a.validator.format=function(b,c){return 1===arguments.length?function(){var c=a.makeArray(arguments);return c.unshift(b),a.validator.format.apply(this,c)}:void 0===c?b:(arguments.length>2&&c.constructor!==Array&&(c=a.makeArray(arguments).slice(1)),c.constructor!==Array&&(c=[c]),a.each(c,function(a,c){b=b.replace(new RegExp("\\{"+a+"\\}","g"),function(){return c})}),b)},a.extend(a.validator,{defaults:{messages:{},groups:{},rules:{},errorClass:"error",pendingClass:"pending",validClass:"valid",errorElement:"label",focusCleanup:!1,focusInvalid:!0,errorContainer:a([]),errorLabelContainer:a([]),onsubmit:!0,ignore:":hidden",ignoreTitle:!1,onfocusin:function(a){this.lastActive=a,this.settings.focusCleanup&&(this.settings.unhighlight&&this.settings.unhighlight.call(this,a,this.settings.errorClass,this.settings.validClass),this.hideThese(this.errorsFor(a)))},onfocusout:function(a){this.checkable(a)||!(a.name in this.submitted)&&this.optional(a)||this.element(a)},onkeyup:function(b,c){var d=[16,17,18,20,35,36,37,38,39,40,45,144,225];9===c.which&&""===this.elementValue(b)||a.inArray(c.keyCode,d)!==-1||(b.name in this.submitted||b.name in this.invalid)&&this.element(b)},onclick:function(a){a.name in this.submitted?this.element(a):a.parentNode.name in this.submitted&&this.element(a.parentNode)},highlight:function(b,c,d){"radio"===b.type?this.findByName(b.name).addClass(c).removeClass(d):a(b).addClass(c).removeClass(d)},unhighlight:function(b,c,d){"radio"===b.type?this.findByName(b.name).removeClass(c).addClass(d):a(b).removeClass(c).addClass(d)}},setDefaults:function(b){a.extend(a.validator.defaults,b)},messages:{required:"This field is required.",remote:"Please fix this field.",email:"Please enter a valid email address.",url:"Please enter a valid URL.",date:"Please enter a valid date.",dateISO:"Please enter a valid date (ISO).",number:"Please enter a valid number.",digits:"Please enter only digits.",equalTo:"Please enter the same value again.",maxlength:a.validator.format("Please enter no more than {0} characters."),minlength:a.validator.format("Please enter at least {0} characters."),rangelength:a.validator.format("Please enter a value between {0} and {1} characters long."),range:a.validator.format("Please enter a value between {0} and {1}."),max:a.validator.format("Please enter a value less than or equal to {0}."),min:a.validator.format("Please enter a value greater than or equal to {0}."),step:a.validator.format("Please enter a multiple of {0}.")},autoCreateRanges:!1,prototype:{init:function(){function b(b){!this.form&&this.hasAttribute("contenteditable")&&(this.form=a(this).closest("form")[0],this.name=a(this).attr("name"));var c=a.data(this.form,"validator"),d="on"+b.type.replace(/^validate/,""),e=c.settings;e[d]&&!a(this).is(e.ignore)&&e[d].call(c,this,b)}this.labelContainer=a(this.settings.errorLabelContainer),this.errorContext=this.labelContainer.length&&this.labelContainer||a(this.currentForm),this.containers=a(this.settings.errorContainer).add(this.settings.errorLabelContainer),this.submitted={},this.valueCache={},this.pendingRequest=0,this.pending={},this.invalid={},this.reset();var c,d=this.groups={};a.each(this.settings.groups,function(b,c){"string"==typeof c&&(c=c.split(/\s/)),a.each(c,function(a,c){d[c]=b})}),c=this.settings.rules,a.each(c,function(b,d){c[b]=a.validator.normalizeRule(d)}),a(this.currentForm).on("focusin.validate focusout.validate keyup.validate",":text, [type='password'], [type='file'], select, textarea, [type='number'], [type='search'], [type='tel'], [type='url'], [type='email'], [type='datetime'], [type='date'], [type='month'], [type='week'], [type='time'], [type='datetime-local'], [type='range'], [type='color'], [type='radio'], [type='checkbox'], [contenteditable], [type='button']",b).on("click.validate","select, option, [type='radio'], [type='checkbox']",b),this.settings.invalidHandler&&a(this.currentForm).on("invalid-form.validate",this.settings.invalidHandler)},form:function(){return this.checkForm(),a.extend(this.submitted,this.errorMap),this.invalid=a.extend({},this.errorMap),this.valid()||a(this.currentForm).triggerHandler("invalid-form",[this]),this.showErrors(),this.valid()},checkForm:function(){this.prepareForm();for(var a=0,b=this.currentElements=this.elements();b[a];a++)this.check(b[a]);return this.valid()},element:function(b){var c,d,e=this.clean(b),f=this.validationTargetFor(e),g=this,h=!0;return void 0===f?delete this.invalid[e.name]:(this.prepareElement(f),this.currentElements=a(f),d=this.groups[f.name],d&&a.each(this.groups,function(a,b){b===d&&a!==f.name&&(e=g.validationTargetFor(g.clean(g.findByName(a))),e&&e.name in g.invalid&&(g.currentElements.push(e),h=g.check(e)&&h))}),c=this.check(f)!==!1,h=h&&c,c?this.invalid[f.name]=!1:this.invalid[f.name]=!0,this.numberOfInvalids()||(this.toHide=this.toHide.add(this.containers)),this.showErrors(),a(b).attr("aria-invalid",!c)),h},showErrors:function(b){if(b){var c=this;a.extend(this.errorMap,b),this.errorList=a.map(this.errorMap,function(a,b){return{message:a,element:c.findByName(b)[0]}}),this.successList=a.grep(this.successList,function(a){return!(a.name in b)})}this.settings.showErrors?this.settings.showErrors.call(this,this.errorMap,this.errorList):this.defaultShowErrors()},resetForm:function(){a.fn.resetForm&&a(this.currentForm).resetForm(),this.invalid={},this.submitted={},this.prepareForm(),this.hideErrors();var b=this.elements().removeData("previousValue").removeAttr("aria-invalid");this.resetElements(b)},resetElements:function(a){var b;if(this.settings.unhighlight)for(b=0;a[b];b++)this.settings.unhighlight.call(this,a[b],this.settings.errorClass,""),this.findByName(a[b].name).removeClass(this.settings.validClass);else a.removeClass(this.settings.errorClass).removeClass(this.settings.validClass)},numberOfInvalids:function(){return this.objectLength(this.invalid)},objectLength:function(a){var b,c=0;for(b in a)void 0!==a[b]&&null!==a[b]&&a[b]!==!1&&c++;return c},hideErrors:function(){this.hideThese(this.toHide)},hideThese:function(a){a.not(this.containers).text(""),this.addWrapper(a).hide()},valid:function(){return 0===this.size()},size:function(){return this.errorList.length},focusInvalid:function(){if(this.settings.focusInvalid)try{a(this.findLastActive()||this.errorList.length&&this.errorList[0].element||[]).filter(":visible").focus().trigger("focusin")}catch(b){}},findLastActive:function(){var b=this.lastActive;return b&&1===a.grep(this.errorList,function(a){return a.element.name===b.name}).length&&b},elements:function(){var b=this,c={};return a(this.currentForm).find("input, select, textarea, [contenteditable]").not(":submit, :reset, :image, :disabled").not(this.settings.ignore).filter(function(){var d=this.name||a(this).attr("name");return!d&&b.settings.debug&&window.console&&console.error("%o has no name assigned",this),this.hasAttribute("contenteditable")&&(this.form=a(this).closest("form")[0],this.name=d),!(d in c||!b.objectLength(a(this).rules()))&&(c[d]=!0,!0)})},clean:function(b){return a(b)[0]},errors:function(){var b=this.settings.errorClass.split(" ").join(".");return a(this.settings.errorElement+"."+b,this.errorContext)},resetInternals:function(){this.successList=[],this.errorList=[],this.errorMap={},this.toShow=a([]),this.toHide=a([])},reset:function(){this.resetInternals(),this.currentElements=a([])},prepareForm:function(){this.reset(),this.toHide=this.errors().add(this.containers)},prepareElement:function(a){this.reset(),this.toHide=this.errorsFor(a)},elementValue:function(b){var c,d,e=a(b),f=b.type;return"radio"===f||"checkbox"===f?this.findByName(b.name).filter(":checked").val():"number"===f&&"undefined"!=typeof b.validity?b.validity.badInput?"NaN":e.val():(c=b.hasAttribute("contenteditable")?e.text():e.val(),"file"===f?"C:\\fakepath\\"===c.substr(0,12)?c.substr(12):(d=c.lastIndexOf("/"),d>=0?c.substr(d+1):(d=c.lastIndexOf("\\"),d>=0?c.substr(d+1):c)):"string"==typeof c?c.replace(/\r/g,""):c)},check:function(b){b=this.validationTargetFor(this.clean(b));var c,d,e,f,g=a(b).rules(),h=a.map(g,function(a,b){return b}).length,i=!1,j=this.elementValue(b);if("function"==typeof g.normalizer?f=g.normalizer:"function"==typeof this.settings.normalizer&&(f=this.settings.normalizer),f){if(j=f.call(b,j),"string"!=typeof j)throw new TypeError("The normalizer should return a string value.");delete g.normalizer}for(d in g){e={method:d,parameters:g[d]};try{if(c=a.validator.methods[d].call(this,j,b,e.parameters),"dependency-mismatch"===c&&1===h){i=!0;continue}if(i=!1,"pending"===c)return void(this.toHide=this.toHide.not(this.errorsFor(b)));if(!c)return this.formatAndAdd(b,e),!1}catch(k){throw this.settings.debug&&window.console&&console.log("Exception occurred when checking element "+b.id+", check the '"+e.method+"' method.",k),k instanceof TypeError&&(k.message+=".  Exception occurred when checking element "+b.id+", check the '"+e.method+"' method."),k}}if(!i)return this.objectLength(g)&&this.successList.push(b),!0},customDataMessage:function(b,c){return a(b).data("msg"+c.charAt(0).toUpperCase()+c.substring(1).toLowerCase())||a(b).data("msg")},customMessage:function(a,b){var c=this.settings.messages[a];return c&&(c.constructor===String?c:c[b])},findDefined:function(){for(var a=0;a<arguments.length;a++)if(void 0!==arguments[a])return arguments[a]},defaultMessage:function(b,c){"string"==typeof c&&(c={method:c});var d=this.findDefined(this.customMessage(b.name,c.method),this.customDataMessage(b,c.method),!this.settings.ignoreTitle&&b.title||void 0,a.validator.messages[c.method],"<strong>Warning: No message defined for "+b.name+"</strong>"),e=/\$?\{(\d+)\}/g;return"function"==typeof d?d=d.call(this,c.parameters,b):e.test(d)&&(d=a.validator.format(d.replace(e,"{$1}"),c.parameters)),d},formatAndAdd:function(a,b){var c=this.defaultMessage(a,b);this.errorList.push({message:c,element:a,method:b.method}),this.errorMap[a.name]=c,this.submitted[a.name]=c},addWrapper:function(a){return this.settings.wrapper&&(a=a.add(a.parent(this.settings.wrapper))),a},defaultShowErrors:function(){var a,b,c;for(a=0;this.errorList[a];a++)c=this.errorList[a],this.settings.highlight&&this.settings.highlight.call(this,c.element,this.settings.errorClass,this.settings.validClass),this.showLabel(c.element,c.message);if(this.errorList.length&&(this.toShow=this.toShow.add(this.containers)),this.settings.success)for(a=0;this.successList[a];a++)this.showLabel(this.successList[a]);if(this.settings.unhighlight)for(a=0,b=this.validElements();b[a];a++)this.settings.unhighlight.call(this,b[a],this.settings.errorClass,this.settings.validClass);this.toHide=this.toHide.not(this.toShow),this.hideErrors(),this.addWrapper(this.toShow).show()},validElements:function(){return this.currentElements.not(this.invalidElements())},invalidElements:function(){return a(this.errorList).map(function(){return this.element})},showLabel:function(b,c){var d,e,f,g,h=this.errorsFor(b),i=this.idOrName(b),j=a(b).attr("aria-describedby");h.length?(h.removeClass(this.settings.validClass).addClass(this.settings.errorClass),h.html(c)):(h=a("<"+this.settings.errorElement+">").attr("id",i+"-error").addClass(this.settings.errorClass).html(c||""),d=h,this.settings.wrapper&&(d=h.hide().show().wrap("<"+this.settings.wrapper+"/>").parent()),this.labelContainer.length?this.labelContainer.append(d):this.settings.errorPlacement?this.settings.errorPlacement.call(this,d,a(b)):d.insertAfter(b),h.is("label")?h.attr("for",i):0===h.parents("label[for='"+this.escapeCssMeta(i)+"']").length&&(f=h.attr("id"),j?j.match(new RegExp("\\b"+this.escapeCssMeta(f)+"\\b"))||(j+=" "+f):j=f,a(b).attr("aria-describedby",j),e=this.groups[b.name],e&&(g=this,a.each(g.groups,function(b,c){c===e&&a("[name='"+g.escapeCssMeta(b)+"']",g.currentForm).attr("aria-describedby",h.attr("id"))})))),!c&&this.settings.success&&(h.text(""),"string"==typeof this.settings.success?h.addClass(this.settings.success):this.settings.success(h,b)),this.toShow=this.toShow.add(h)},errorsFor:function(b){var c=this.escapeCssMeta(this.idOrName(b)),d=a(b).attr("aria-describedby"),e="label[for='"+c+"'], label[for='"+c+"'] *";return d&&(e=e+", #"+this.escapeCssMeta(d).replace(/\s+/g,", #")),this.errors().filter(e)},escapeCssMeta:function(a){return a.replace(/([\\!"#$%&'()*+,.\/:;<=>?@\[\]^`{|}~])/g,"\\$1")},idOrName:function(a){return this.groups[a.name]||(this.checkable(a)?a.name:a.id||a.name)},validationTargetFor:function(b){return this.checkable(b)&&(b=this.findByName(b.name)),a(b).not(this.settings.ignore)[0]},checkable:function(a){return/radio|checkbox/i.test(a.type)},findByName:function(b){return a(this.currentForm).find("[name='"+this.escapeCssMeta(b)+"']")},getLength:function(b,c){switch(c.nodeName.toLowerCase()){case"select":return a("option:selected",c).length;case"input":if(this.checkable(c))return this.findByName(c.name).filter(":checked").length}return b.length},depend:function(a,b){return!this.dependTypes[typeof a]||this.dependTypes[typeof a](a,b)},dependTypes:{"boolean":function(a){return a},string:function(b,c){return!!a(b,c.form).length},"function":function(a,b){return a(b)}},optional:function(b){var c=this.elementValue(b);return!a.validator.methods.required.call(this,c,b)&&"dependency-mismatch"},startRequest:function(b){this.pending[b.name]||(this.pendingRequest++,a(b).addClass(this.settings.pendingClass),this.pending[b.name]=!0)},stopRequest:function(b,c){this.pendingRequest--,this.pendingRequest<0&&(this.pendingRequest=0),delete this.pending[b.name],a(b).removeClass(this.settings.pendingClass),c&&0===this.pendingRequest&&this.formSubmitted&&this.form()?(a(this.currentForm).submit(),this.submitButton&&a("input:hidden[name='"+this.submitButton.name+"']",this.currentForm).remove(),this.formSubmitted=!1):!c&&0===this.pendingRequest&&this.formSubmitted&&(a(this.currentForm).triggerHandler("invalid-form",[this]),this.formSubmitted=!1)},previousValue:function(b,c){return c="string"==typeof c&&c||"remote",a.data(b,"previousValue")||a.data(b,"previousValue",{old:null,valid:!0,message:this.defaultMessage(b,{method:c})})},destroy:function(){this.resetForm(),a(this.currentForm).off(".validate").removeData("validator").find(".validate-equalTo-blur").off(".validate-equalTo").removeClass("validate-equalTo-blur")}},classRuleSettings:{required:{required:!0},email:{email:!0},url:{url:!0},date:{date:!0},dateISO:{dateISO:!0},number:{number:!0},digits:{digits:!0},creditcard:{creditcard:!0}},addClassRules:function(b,c){b.constructor===String?this.classRuleSettings[b]=c:a.extend(this.classRuleSettings,b)},classRules:function(b){var c={},d=a(b).attr("class");return d&&a.each(d.split(" "),function(){this in a.validator.classRuleSettings&&a.extend(c,a.validator.classRuleSettings[this])}),c},normalizeAttributeRule:function(a,b,c,d){/min|max|step/.test(c)&&(null===b||/number|range|text/.test(b))&&(d=Number(d),isNaN(d)&&(d=void 0)),d||0===d?a[c]=d:b===c&&"range"!==b&&(a[c]=!0)},attributeRules:function(b){var c,d,e={},f=a(b),g=b.getAttribute("type");for(c in a.validator.methods)"required"===c?(d=b.getAttribute(c),""===d&&(d=!0),d=!!d):d=f.attr(c),this.normalizeAttributeRule(e,g,c,d);return e.maxlength&&/-1|2147483647|524288/.test(e.maxlength)&&delete e.maxlength,e},dataRules:function(b){var c,d,e={},f=a(b),g=b.getAttribute("type");for(c in a.validator.methods)d=f.data("rule"+c.charAt(0).toUpperCase()+c.substring(1).toLowerCase()),this.normalizeAttributeRule(e,g,c,d);return e},staticRules:function(b){var c={},d=a.data(b.form,"validator");return d.settings.rules&&(c=a.validator.normalizeRule(d.settings.rules[b.name])||{}),c},normalizeRules:function(b,c){return a.each(b,function(d,e){if(e===!1)return void delete b[d];if(e.param||e.depends){var f=!0;switch(typeof e.depends){case"string":f=!!a(e.depends,c.form).length;break;case"function":f=e.depends.call(c,c)}f?b[d]=void 0===e.param||e.param:(a.data(c.form,"validator").resetElements(a(c)),delete b[d])}}),a.each(b,function(d,e){b[d]=a.isFunction(e)&&"normalizer"!==d?e(c):e}),a.each(["minlength","maxlength"],function(){b[this]&&(b[this]=Number(b[this]))}),a.each(["rangelength","range"],function(){var c;b[this]&&(a.isArray(b[this])?b[this]=[Number(b[this][0]),Number(b[this][1])]:"string"==typeof b[this]&&(c=b[this].replace(/[\[\]]/g,"").split(/[\s,]+/),b[this]=[Number(c[0]),Number(c[1])]))}),a.validator.autoCreateRanges&&(null!=b.min&&null!=b.max&&(b.range=[b.min,b.max],delete b.min,delete b.max),null!=b.minlength&&null!=b.maxlength&&(b.rangelength=[b.minlength,b.maxlength],delete b.minlength,delete b.maxlength)),b},normalizeRule:function(b){if("string"==typeof b){var c={};a.each(b.split(/\s/),function(){c[this]=!0}),b=c}return b},addMethod:function(b,c,d){a.validator.methods[b]=c,a.validator.messages[b]=void 0!==d?d:a.validator.messages[b],c.length<3&&a.validator.addClassRules(b,a.validator.normalizeRule(b))},methods:{required:function(b,c,d){if(!this.depend(d,c))return"dependency-mismatch";if("select"===c.nodeName.toLowerCase()){var e=a(c).val();return e&&e.length>0}return this.checkable(c)?this.getLength(b,c)>0:b.length>0},email:function(a,b){return this.optional(b)||/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(a)},url:function(a,b){return this.optional(b)||/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[\/?#]\S*)?$/i.test(a)},date:function(a,b){return this.optional(b)||!/Invalid|NaN/.test(new Date(a).toString())},dateISO:function(a,b){return this.optional(b)||/^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/.test(a)},number:function(a,b){return this.optional(b)||/^(?:-?\d+|-?\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(a)},digits:function(a,b){return this.optional(b)||/^\d+$/.test(a)},minlength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e>=d},maxlength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e<=d},rangelength:function(b,c,d){var e=a.isArray(b)?b.length:this.getLength(b,c);return this.optional(c)||e>=d[0]&&e<=d[1]},min:function(a,b,c){return this.optional(b)||a>=c},max:function(a,b,c){return this.optional(b)||a<=c},range:function(a,b,c){return this.optional(b)||a>=c[0]&&a<=c[1]},step:function(b,c,d){var e,f=a(c).attr("type"),g="Step attribute on input type "+f+" is not supported.",h=["text","number","range"],i=new RegExp("\\b"+f+"\\b"),j=f&&!i.test(h.join()),k=function(a){var b=(""+a).match(/(?:\.(\d+))?$/);return b&&b[1]?b[1].length:0},l=function(a){return Math.round(a*Math.pow(10,e))},m=!0;if(j)throw new Error(g);return e=k(d),(k(b)>e||l(b)%l(d)!==0)&&(m=!1),this.optional(c)||m},equalTo:function(b,c,d){var e=a(d);return this.settings.onfocusout&&e.not(".validate-equalTo-blur").length&&e.addClass("validate-equalTo-blur").on("blur.validate-equalTo",function(){a(c).valid()}),b===e.val()},remote:function(b,c,d,e){if(this.optional(c))return"dependency-mismatch";e="string"==typeof e&&e||"remote";var f,g,h,i=this.previousValue(c,e);return this.settings.messages[c.name]||(this.settings.messages[c.name]={}),i.originalMessage=i.originalMessage||this.settings.messages[c.name][e],this.settings.messages[c.name][e]=i.message,d="string"==typeof d&&{url:d}||d,h=a.param(a.extend({data:b},d.data)),i.old===h?i.valid:(i.old=h,f=this,this.startRequest(c),g={},g[c.name]=b,a.ajax(a.extend(!0,{mode:"abort",port:"validate"+c.name,dataType:"json",data:g,context:f.currentForm,success:function(a){var d,g,h,j=a===!0||"true"===a;f.settings.messages[c.name][e]=i.originalMessage,j?(h=f.formSubmitted,f.resetInternals(),f.toHide=f.errorsFor(c),f.formSubmitted=h,f.successList.push(c),f.invalid[c.name]=!1,f.showErrors()):(d={},g=a||f.defaultMessage(c,{method:e,parameters:b}),d[c.name]=i.message=g,f.invalid[c.name]=!0,f.showErrors(d)),i.valid=j,f.stopRequest(c,j)}},d)),"pending")}}});var b,c={};return a.ajaxPrefilter?a.ajaxPrefilter(function(a,b,d){var e=a.port;"abort"===a.mode&&(c[e]&&c[e].abort(),c[e]=d)}):(b=a.ajax,a.ajax=function(d){var e=("mode"in d?d:a.ajaxSettings).mode,f=("port"in d?d:a.ajaxSettings).port;return"abort"===e?(c[f]&&c[f].abort(),c[f]=b.apply(this,arguments),c[f]):b.apply(this,arguments)}),a});