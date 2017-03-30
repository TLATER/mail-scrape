#!/usr/bin/env node

var Knwl = require('knwl.js');
var parser = require('commander');

/**
 * Get the domain from the given email address and parse any available
 * data on that page, printing it in a nice, human-readable form.
 *
 * @argument address - The email address whose domain to parse.
 */
function main (address) {

}

parser
    .arguments('<address>')
    .action((address) => main(address));
