var Filter = require('broccoli-filter');

/**
 * Escape strings where needed
 * Taken from: http://stackoverflow.com/questions/770523/escaping-strings-in-javascript
 *
 * @param {string} str The string to escape
 */
function addSlashes (str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}

/**
 * Take an input tree with text files in it and return them embedded into new JS module files
 *
 * @class
 * @param {string,broccoliTree} inputTree The tree of files to search for appropriate text files
 * @param {object} options The options object
 */
function ToJSFilter (inputTree, options) {
    if (!(this instanceof ToJSFilter)) {
        return new ToJSFilter(inputTree, options);
    }
    options = options || {};
    options.extensions = options.extensions || ['txt'];
    options.targetExtension = 'js';
    Filter.call(this, inputTree, options);
    this.trimFiles = options.trimFiles || false;
}

ToJSFilter.prototype = Object.create(Filter.prototype);
ToJSFilter.prototype.constructor = ToJSFilter;

/**
 * This does the heavy lifting of turning the old text file into a js module
 *
 * @function
 * @param {processString} string The contents of the file to embed
 */
ToJSFilter.prototype.processString = function (string) {
    // TODO: Add support for AMD, CommonJS, and any other module types
    // Error handling code taken from:
    // https://github.com/joliss/broccoli-coffee/blob/0d6bf64bfbd977c72bbc9558744861f95d9e798f/index.js#L23-L29
    try {
        // Clean up the string and then split it
        if (this.trimFiles) {
            string = string.trim();
        }
        string = addSlashes(string);
        var lines = string.split('\n');

        // Build the output string
        var combined = "export default ";
        for (var i = 0; i < lines.length; i++) {
            combined += "'" + lines[i] + "' +\n";
        }

        // We need to remove the last addition if there were any lines
        // If there were no lines then we need to insert and empty string
        if (combined.lastIndexOf(" +\n") === combined.length - " +\n".length) {
            combined = combined.slice(0,-(" +\n".length));
        } else {
            combined += "''";
        }

        combined += ";\n";

        return combined;
    } catch (err) {
        err.line = err.location && err.location.first_line;
        err.column = err.location && err.location.first_column;
        throw err;
    }
};

module.exports = ToJSFilter;
