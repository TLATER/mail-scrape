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
/**
 * Merge the given objects.
 * @param {Object} objects - The objects to merge.
 * @returns {Object} An object containing all unique elements of the
 *                   merged objects.
 */
function merge_deep(...objects) {
    let target = Object.assign({}, objects[0]);

    for (let i = 1; i < objects.length; i++) {
        let source = objects[i];

        if (is_object(source)) {
            Object.keys(source).forEach(key => {
                // If it is a nested object we need to deeply merge
                // its children
                if (is_object(target[key]))
                    target[key] = merge_deep(target[key], source[key]);

                // If it is an array we need to deeply merge the
                // arrays, but we skip any values already in the
                // target array.
                else if (Array.isArray(target[key]))
                    if (Array.isArray(source[key])) {
                        for (let element of source[key])
                            if (!target[key].includes(element))
                                target[key].push(element);
                    } else {
                        target[key].push(source[key]);
                    }

                // If it is a simple type, we just put it in the
                // target.
                else
                    Object.assign(target, {[key]: source[key]});
            });
        }
    }

    return target;
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
        // Find and parse all jsonld data
        json = JSON.parse($(json).html());

        // If @context is not in the jsonld data, it is not in compact
        // notation. We use compact notation as an IR.
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
        // Return all found jsonld data as a single object
        if (results.length < 1)
            callback(error, null);
        else
            callback(error, merge_deep(...results));
    });
}

/**
 * Extract unstructured information.
 * @param {Object} $ - The cheerio-based jQuery context to parse.
 * @param {Function} callback - The callback function as defined by async.js.
 */
function extract_unstructured ($, callback) {
    let parser = new knwl();

    parser.init($.html());

    let knwl_parsers = [
        "phones",
        "emails",
        "places",
        "links"
    ];

    let data = knwl_parsers.map(e => parser.get(e));
    data = data.reduce((acc, result) => {
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

    callback(null, data);
}

/**
 * Scrape any interesting data from the given HTML document.
 *
 * @argument html - The html to scrape data from.
 * @argument callback - A result callback as specified by async.js.
 */
function get_data (html, callback) {
    let $ = cheerio.load(html);
    async.applyEach([extract_json_ld, extract_unstructured], $, (err, data) => {
        callback(null, merge_deep(...data));
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
