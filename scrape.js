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
 * Test if the given object is a generic object.
 *
 * See http://stackoverflow.com/a/37164538.
 *
 * @param {Object} item - The object to test
 * @returns {boolean} Whether the object is a generic object.
 */
function is_object(item) {
    return (item && typeof item === "object"
            && !Array.isArray(item) && item !== null);
}

/**
 * Merge the given objects.
 *
 * See http://stackoverflow.com/a/37164538. Modified to also deeply
 * merge arrays.
 *
 * @param {Object} a - The first object.
 * @param {Object} b - The second object.
 * @returns {Object} The resulting object.
 */
function merge_deep(a, b) {
    let output = Object.assign({}, a);

    if (is_object(a) && is_object(b)) {
        Object.keys(b).forEach(key => {
            if (is_object(b[key])) {
                if (!(key in a))
                    Object.assign(output, { [key]: b[key] });
                else
                    output[key] = merge_deep(a[key], b[key]);

            } else if (Array.isArray(b[key])) {
                if (Array.isArray(a[key])) {
                    output[key] = a[key];

                    for (let element of b[key])
                        if (!a[key].includes(element))
                            output[key].push(element);
                } else {
                    output[key] = b[key];
                    if (a[key])
                        output[key].push(a[key]);
                }

            } else {
                Object.assign(output, { [key]: b[key] });
            }
        });
    }

    return output;
}

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
        if (results.length < 1)
            callback(error, null);
        else
            callback(error, results.reduce((acc, e) => {
                return merge_deep(acc, e);
            }));
    });
}

function extract_unstructured ($, callback) {
    let parser = new knwl();

    parser.init($.html());

    let knwl_parsers = [
        "phones",
        "emails",
        "places",
        "links"
    ];

    let test = knwl_parsers.map(e => parser.get(e));
    test = test.reduce((acc, result) => {
        // Check which type the result is and add it to the correct
        // schema.org array.
        for (let e of result) {
            // Pointless switch for clarity
            switch(true) {
            case e["address"] !== undefined:
                if (!acc["email"])
                    acc["email"] = [e["address"]];
                else
                    acc["email"].push(e["address"]);
                break;

            case e["place"] !== undefined:
                if (!acc["place"])
                    acc["place"] = [{"@type": "Place", name: e["place"]}];
                else
                    acc["place"].push({"@type": "Place", name: e["place"]});
                break;

            case e["phone"] !== undefined:
                if (!acc["telephone"])
                    acc["telephone"] = [e["phone"]];
                else
                    acc["telephone"].push(e["phone"]);
                break;

            case e["link"] !== undefined:
                if (!acc["sameAs"])
                    acc["sameAs"] = [e["link"]];
                else
                    acc["sameAs"].push(e["link"]);
            }
        }

        return acc;
    }, {"@context": "http://schema.org"});

    callback(null, test);
}

/**
 * Scrape any interesting data from the given HTML document.
 *
 * @argument html - The html to scrape data from.
 * @argument callback - A result callback as specified by async.js.
 */
function get_data (html, callback) {
    let $ = cheerio.load(html);
    extract_json_ld($, (err, data) => {
        extract_unstructured($, (err, more_data) => {
            callback(null, merge_deep(data, more_data));
        });
    });
}

module.exports = {
    get_data: get_data,
    _private: {
        extract_json_ld: extract_json_ld,
        extract_unstructured: extract_unstructured,
        merge_deep: merge_deep
    }
};
