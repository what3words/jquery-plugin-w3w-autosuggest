# <img src="https://what3words.com/assets/images/w3w_square_red.png" width="32" height="32" alt="what3words">&nbsp;what3words autosuggest jQuery plugin

[![Build Status](https://travis-ci.org/what3words/jquery-plugin-w3w-autosuggest.svg?branch=master)](https://travis-ci.org/what3words/jquery-plugin-w3w-autosuggest)

Easily capture 3 word addresses on your website with the *3 word address validation* JQuery plugin by what3words.

what3words is a global addressing system. It has divided the world into a grid of 3m x 3m squares and assigned each one a unique 3 word address. what3words is more accurate than traditional street addressing, and even allows location information to be captured for places without addresses, such as parks or beaches.
The 3 word address validation plugin created by what3words allows you to easily integrate 3 word addresses into your site by applying what3words AutoSuggest on an input field, including default styling.


## AutoSuggest jQuery Plugin

The plugin provides a simple way to get started using AutoSuggest on your website. It has been designed to be used when you want a user to input a 3 word address in a form field.
Based on a full or partial address, it returns a list of the most relevant 3 word address candidates. Corrections are provided for input errors.

### Visualising the results
The `autosuggest` results are displayed in the same way as the search box on [map.what3words.com](https://map.what3words.com/) and in the what3words mobile apps.

The resulting candidate list contains the 3 word address, the nearest place to that address.

While `autosuggest` uses the `clipping` parameter to determine the geographical boundary of results, the plugin makes use of a `country_filter` This allows you to more easily limit results to a specific country. Please note that using the `country_filter` may impact the number of results returned to the user.


# Getting Started

### Prerequisites
- jQuery 1.7.2 and above because of .on event handler

### Dependencies
The plugin uses these dependencies.
- jquery-Typeahead plugin 2.10.4 https://www.npmjs.com/package/jquery-typeahead
- jquery-validation plugin  1.17.0 https://www.npmjs.com/package/jquery-validation
Distribution contains a bundle version including these libraries:

### Using the plugin
Make sure to include jQuery in your page, for example:
```html
<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
```

Include the what3words plugin files from the `./dist` folder into your HTML source:

Include JQuery plugin bundled with jquery-typeahead and jquery-validation plugins
```html
<script src="[path-to-plugin]/js/jquery.w3w-autosuggest-plugin.bundle.min.js"></script>
```

or separately
```html
<script src="path/to/jquery.typeahead"></script>
<script src="path/to/jquery.validation"></script>
<script src="[path-to-plugin]/js/jquery.w3w-autosuggest-plugin.min.js"></script>
```
Add the input element which will become the what3words autosuggest field. This must be within a form element for example:
```html
<div>
      <div>
        <form>
          <input id="twa-input" class="w3w-address-field" type="text" >
        </form>
      </div>
    </div>
```
Add the CSS to the  `<header>`:
```html
<link rel="stylesheet" href="[path-to-plugin]/css/jquery.w3w-autosuggest-plugin.bundle.min.css">
```

or separately
```html
<link rel="stylesheet" href="path/to/jquery.typeahead.css">
<link rel="stylesheet" href="[path-to-plugin]/css/jquery.w3w-autosuggest-plugin.min.css">
```

**NB**: Do not forget to copy the `flags.png` file with the css files

You'll need to [register](https://what3words.com/register?dev=true) for a what3words API key to access AutoSuggest. The key should be passed to a new instance of the plugin which is initialised on an input field. Initialisation should preferably occur after jQuery and before the </body> tag.


```javascript
<script>
 $('#w3w-address').w3wAddress({
  key: 'YOUR-API-KEY-HERE'
 });
</script>
```

## AutoSuggest

The plugin authenticates and interacts with the [what3words RESTful API](https://docs.what3words.com/api/v2/) `autosuggest` method.
It returns a list of 3 word addresses based on user input and other parameters.
This method provides corrections for the following types of input error:

- typing errors
- spelling errors
- misremembered words (e.g. singular vs. plural) words in the wrong order

The `autosuggest` method determines possible corrections to the supplied 3 word address string based on the probability of the input errors listed above and returns a ranked list of suggestions.

See also the [what3words API AutoSuggest documentation](https://docs.what3words.com/api/v2/#autosuggest) for more detailed information.


### Input 3 word address

You will only receive results back if the partial 3 word address string you submit contains the first two words and at least the first character of the third word; otherwise an error message will be returned.

### Language

The `lang` parameter is mandatory for `autosuggest`; we recommend that you set this according to the language of your user interface, or the browser/device language of your user. If your software displays 3 word addresses to users (in addition to accepting 3 words as a search/input) then we recommend you set the `lang` parameter for this method to the same language that 3 word addresses are displayed to your users.

You can use the what3words API [Get Languages](https://docs.what3words.com/api/v2/#lang) method for a list of all currently loaded and available 3 word address languages.

### Results
 By default, 3 results are displayed with a 50 background suggestions available to filter by country.


## Options

Parameters to be passed to the AutoSuggest plugin.

| Option         | Type       | Optional? | Default | Description |
| ---------------|------------|-----------|---------|----------------------|
| `key`          | `String`   | mandatory | | Your API key, mandatory unless you bring your proxy page as `api_end_point` to hide your key |
| `debug`        | `Boolean`  |  optional | false | Enables debug info in console |
| `hint`         | `Boolean`  |  optional | true | Displays hint result (default is `false` for Arabic) |
| `logo`         | `Boolean`  |  optional | true | displays what3words logo on the input as a svg image |
| `multilingual` | `Boolean`  |  optional | true |  Enables the multilingual variant of autosuggest |
| `lang`         | `String`   |  optional | `en` | A supported 3 word address language as an [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) 2 letter code. |
| `results`        | `Number`   |  optional | 3 | Number of items to show in the result list |
| `country_filter` | `String`   |  optional | null | Set country code as an [ISO 3166-1 alpha-2]https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 2 letter code  |
| `count`          | `Number`   |  optional | 50 | Number of items to retrieve from API |
| `direction`      | `String`   |  optional | ltr | default is `ltr`, can be set to `rtl` e.g. for Arabic |
| `placeholder`    | `String`   |  optional |  | Sets the placeholder text of the input field (default is `placeholder: 'e.g. lock.spout.radar'). |
| `validation`       | `Boolean`  |  optional | true | Adds UI validation result using [jquery-validation](https://www.npmjs.com/package/jquery-validation) |
| `typeaheadDelay`       | `Number`  |  optional | 100 | delay in ms before sending new API request  |
| `api_end_point`       | `String`  |  optional |  | for advanced integration, allow you to proxy request to our API and then hide your key  |

## NOTES
#### aria-invalid
The attribute `aria-invalid` is used even if validation is set to false. Without `validation`, selecting a 3 word address from the result list ensure the address is valid.
For references see:
- 1 : https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_aria-invalid_attribute
- 2 : https://www.w3.org/TR/wai-aria/states_and_properties#aria-invalid

#### api_end_point
this new feature (since version 1.5) allow you to proxy requests to your own server and then hide your what3words API key from your endusers.

The trailing `/` is needed as the plugin append `autosuggest-ml` or `autosuggest` regarding your constructor options.

This API endpoint must then provide a rest endpoint with the desired operations `autosuggest-ml` and/or `autosuggest` according your needs.

## Building

### Prerequisites
- node, gulp

### Set up
```
$ npm install

```

>Recommended : install gulp as global

> `$ npm install --global gulp-cli`

#### Build
```
$ gulp build
```

#### Clean Dist folder
```
$ gulp clean
```

#### Watch for Development
```
$ gulp
```

The build process is automatic using `gulp watch`. Gulp is watching for Javascript & CSS changes and processing final files to the `./dist` folder automatically.

To add or customise styling, set up the development environment, and simply edit / add SCSS files in `./src` folder.


### sprite
What was done:
- upload images from ./src/images/flags into http://responsive-css.us/ ,
- save sprite and css in src/images/sprite
- use https://tinypng.com/ to shrink image weight

#### Use sample

The sample page uses the browser localStorage to store your API key. You can find it [here](./demo/sample.html) where multiple configurations can be found.

Try it live : [sample.html](https://what3words.github.io/jquery-plugin-w3w-autosuggest/demo/sample.html)

# Revision History

| Version  | Date     | Description |
| -------- | -------- | ----------- |
| `v1.5.4` | 29/11/18 | add validation when focus out from input field & fix logo styling for rtl languages
| `v1.5.3` | 08/11/18 | updated to use new 3 word address branding and improved 3 word address validation |
| `v1.5.2` | 06/09/18 | a validated 3 word address field now maintains its green checkbox state |
| `v1.5.1` | 01/05/18 | clearing the field now removes the "valid" CSS class rather than leaving it |
| `v1.5.0` | 01/05/18 | update 3 word address validation for Japanese with interpunct |
| `v1.4.0` | 06/02/18 | bump jquery version to prevent security issues |
| `v1.3.1` | 27/09/17 | change w3w svg logo url |
| `v1.3.0` | 24/04/17 | fixes conflict with standard jquery-typeahead css, adds searched, selection and cancel events |
| `v1.2.1` | 29/03/17 | prevent warning message on ajax request and test closest form for validation |
| `v1.2.0` | 10/03/17 | refactoring plugin : tidying up dependencies, building single and bundle distribution files. Parameters : `multilingual` replace `auto_detect_lang`, `country_filter` replaces `country_selector` using only an ISO_3166-1_alpha-2 code |
| `v1.1.0` | 13/02/17 | uses API method `autosuggest-ml` with number of background results increased to 50 |
| `v1.0.0` | 07/02/17 | Initial release |

**Nb** Using European Date Format :smile: sorry :us:
