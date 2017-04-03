#!/usr/bin/env node

/**
 * The main CLI script.
 *
 * @module index
 * @author Tristan Maat
 */

const extract_domain = require("./extract_domain.js");
const scrape = require("./scrape.js");
const print = require("./print.js");

const parser = require("commander");
const request = require("request");
const async = require("async");
const url = require("url");

/**
 * A helper function to scrape data from a domain.
 *
 * Returns a list of metadata objects for the domain as the second
 * argument to callback, or an error message if there was an issue
 * with the request.
 *
 * @argument domain - The domain to scrape the data from.
 * @argument callback - A callback as specified by async.js.
 */
function load_from_domain (domain, callback) {
    request.get(url.format("http://" + domain), (error, response, html) => {
        if (error || response.statusCode !== 200) {
            let message;

            if (error)
                message = "Encountered a problem loading "
                + "http://" + domain + ": "
                + error.message;
            else
                message = "Encountered a problem loading "
                + response.request.uri.href + ": "
                + response.statusCode + ": "
                + response.statusMessage;

            callback(null, message);
        }

        else
            scrape.get_data(html, (error, data) => {
                if (error)
                    callback(null, error.message);
                else
                    callback(null, data);
            });
    });
}

/**
 * Get the domains from the given email addresses and parse any
 * available data on those pages, printing it in a nice,
 * human-readable form.
 *
 * @argument addresses - The email addresses whose domain to parse.
 */
function process_addresses (addresses) {
    let domains = addresses.map(extract_domain.from_email);

    async.map(domains, load_from_domain, (err, results) => {
        print.human_readable(results);
    });
}

/**
 * The main CLI script.
 */
function main () {
    let addresses = null;

    parser
        .arguments("<addresses...>")
        .action(address_input => { addresses = address_input; })
        .option("-j --json-ld", "Output the result as json-ld.")
        .parse(process.argv);

    if (addresses === null) {
        console.error("No address specified.");
        parser.outputHelp();
        process.exit(1);
    }

    process_addresses(addresses);
}

/**
 * Run the script if we are called from a CLI.
 */
if (require.main === module)
    main();

module.exports = {
    _private: {
        load_from_domain: load_from_domain
    }
};
