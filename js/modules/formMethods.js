// Template module
// Depedencies go in [...]
// Add your filename to _main.js "paths"
// Add your app below intersection in the require part

define(['jquery', 'global'], function ($, global) {
    
	var FormMethods = function( window ){

            this.window = window;

    };

    FormMethods.prototype = {

        constructor: FormMethods,

       	getFormParams: function( formTarget ) {
			// get parameters
			var formParams = {};
			var theForm = $( formTarget );

			$.each(theForm.serializeArray(), function(_, kv) {
				if (formParams.hasOwnProperty(kv.name)) {
					formParams[kv.name] = $.makeArray(formParams[kv.name]);
					formParams[kv.name].push(kv.value);
				} else {
					formParams[kv.name] = kv.value;
				}
			});

			return formParams;
		}

    };

    return new FormMethods();

});
