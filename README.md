# <img src="https://what3words.com/assets/images/w3w_square_red.png" width="32" height="32" alt="what3words">&nbsp;what3words Autosuggest jQuery plugin
A jQuery plugin that applies what3words AutoSuggest on an input field, including default styling, based on user input and other parameters.

## AutoSuggest jQuery Plugin

The plugin provides a simple way to get started using AutoSuggest on your website. It has been designed to be used when you want a user to input a 3 word address in a form field.
Based on a full or partial address, it returns a list of the most relevant 3 word address candidates. Corrections are provided for input errors.

### Visualising the results
The `autosuggest` results are displayed in the same way as the search box on [map.what3words.com](https://map.what3words.com/) and in the what3words mobile apps.

The resulting candidate list contains the 3 word address, the nearest place to that address.

While `autosuggest` uses the `clipping` parameter to determine the geographical boundary of results, the plugin makes use of a `country_selector` This allows you to more easily limit results to a specific country. Please note that using the `country_selector` may impact the number of results returned to the user.


# Getting Started

### _TBD_ Prerequisites
- jQuery 1.7.2 and above because of .on event handler
- jquery-Typeahead plugin 2.8.0 https://www.npmjs.com/package/jquery-typeahead
- jquery-validation plugin  1.16.0 https://www.npmjs.com/package/jquery-validation

Make sure to include jQuery in your page:
```markup
<script src="https://code.jquery.com/jquery-2.2.4.min.js"></script>
```

Include JQuery pllugin bundled with jquery-typeahead plugin
```markup
<script src="https://assets.what3words.com/js/jquery.w3w-autosuggest-plugin.bundle.min.js"></script>
```

or separately
```
<script src="path/to/jquery.typeahead.min.js"></script>
<script src="https://assets.what3words.com/js/jquery.w3w-autosuggest-plugin.min.js"></script>
```


Include the what3words plugin files from the `./dist` folder into your HTML source:

Add the CSS to the  `<header>`:
```
<link rel="stylesheet" href="[path-to-plugin]/css/jquery.w3w-autosuggest-plugin.css">
```

You'll need to [register](https://what3words.com/register?dev=true) for a what3words API key to access AutoSuggest. The key should be passed to a new instance of the plugin which is initialised on an input field. Initialisation should preferably occur after jQuery and before the </body> tag.


```
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

You can use the what3words [Get Languages API](https://docs.what3words.com/api/v2/#lang) method for a list of all currently loaded and available 3 word address languages.

### Results
 By default, 3 results are displayed with a 50 background suggestions available to filter by country.


## Options

Parameters to be passed to the AutoSuggest plugin.

| Option             | Type       | Optional? | Default | Description |
| -------------------|------------|-----------|---------|----------------------|
| `key`              | `String`   | mandatory | | Your API key |
| `debug`            | `Boolean`  |  optional | false | Enables debug info in console |
| `use_multilingual` | `Boolean`  |  optional | true |  Uses the multilingulal API methode |
| `lang`             | `String`   |  optional | see description | A supported 3 word address language as an [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) 2 letter code. Default is `en` if `use_multilingual` is `false` |
| `results`          | `Number`   |  optional | 3 | Number of items to show in the result list |
| `country_filter`   | `String`   |  optional | null | Set country code as an [ISO 3166-1 alpha-2]https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2 2 letter code  |
| `count`            | `Number`   |  optional | 50 | Number of items to retrieve from API |
| `direction`        | `String`   |  optional | ltr | default is `ltr`, can be set to `rtl` for example when language is Arabic |
| `placeholder`      | `String`   |  optional |  | Sets the placeholder text of the input field (default is `placeholder: 'e.g. lock.spout.radar'). |
| `validate`         | `Boolean`  |  optional | true | _TBD_ Adds validation input using [jquery-validation](https://www.npmjs.com/package/jquery-validation) |


## Building

### Prerequisites
node, gulp

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


# Revision History

* `v1.2.0` TBD      - refactoring plugin : tidying up dependencies, building single and bundle distribution files. Parameters : `use_multilingual` replace `auto_detect_lang`, `country_filter` replaces `country_selector` using only an ISO_3166-1_alpha-2 code, adds setters
* `v1.1.0` 13/02/17 - uses API method `autosuggest-ml` with number of background results increased to 50
* `v1.0.0` 07/02/17 - Initial release
