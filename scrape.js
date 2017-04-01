/**
 * A module to help scraping data from websites.
 *
 * @module scrape
 * @author Tristan Maat
 */

const cheerio = require("cheerio");
const jsonld = require("jsonld");
const knwl = require("knwl.js");
const async = require("async");

/**
 * Extract information made available through json-ld in standard
 * script[type="application/ld+json"] tags, if available.
 *
 * @argument $ - The cheerio context.
 * @argument callback - A result callback as specified by async.js.
 */
function extract_json_ld ($, callback) {
    let data_tags = $("script[type=\"application/ld+json\"]");

    async.map(data_tags, (json, callback) => {
        json = JSON.parse($(json).html());

        if (!json["@context"])
            jsonld.compact(json, "http://schema.org", (error, json) => {
                if (error)
                    callback(error, null);
                else
                    callback(null, json);
            });
        else
            callback(null, json);
    }, (error, results) => {
        callback(error, results.reduce((acc, e) => {
            return $.extend(acc, e);
        }));
    });
}

/**
 * Scrape any interesting data from the given HTML document.
 *
 * @argument html - The html to scrape data from.
 * @argument callback - A result callback as specified by async.js.
 */
function get_data (html, callback) {
    let $ = cheerio.load(html);
    extract_json_ld($, callback);
}

module.exports = {
    get_data: get_data,
    _private: {
        extract_json_ld: extract_json_ld
    }
};
