/**
 * A module to help printing scraped data.
 *
 * @module print
 * @author Tristan Maat
 */

/**
 * Print a horizontal line.
 */
function print_horizontal_line () {
    let column_width = parseInt(process.env.COLUMNS)
            || process.stdout.columns
            || 80;
    let vertical_line = Array(column_width).join("─");

    console.log(vertical_line);
}

/**
 * Remove jsonld metatags from a json object.
 * @param {Object} data - The object to remove tags from.
 */
function remove_metatags (data) {
    for (var key in data)
        if (key.substr(0, 1) === "@")
            delete data[key];
}

/**
 * Split camel case words up to human-readable words.
 * @param {String} string - The string to split.
 * @returns {String} A decamelized string.
 */
function split_camel_case (string) {
    return string.split(/(?=[A-Z])/).map(function(p) {
        return p.charAt(0).toUpperCase() + p.slice(1);
    }).join(" ");
}

/**
 * Turn a jsonld object into a pretty string.
 * @param {Object} data - A jsonld-based object.
 * @returns {String} A human-readable string.
 */
function pretty_jsonld (data) {
    let string = "";

    if (data["name"])
        string += data["name"] + "\n";

    // Remove unnecessary data
    remove_metatags(data);
    delete data["name"];
    delete data["potentialAction"];

    Object.keys(data).forEach(key => {
        if (Array.isArray(data[key])) {
            string += split_camel_case(key) + ":\n";

            for (let element of data[key]) {
                if (typeof element === "object")
                    string += pretty_jsonld(element).replace(/^/gm, "  ") + "\n";
                else
                    string += "  " + element + "\n";
            }
        } else if (typeof data[key] === "object") {
            string += split_camel_case(key) + ":\n";
            string += pretty_jsonld(data[key]).replace(/^/gm, "  ") + "\n";
        } else {
            string += split_camel_case(key) + ": " + data[key] + "\n";
        }
    });

    return string.substr(0, string.length - 1);
}

/**
 * Print jsonld objects to the console more readably.
 * @param {Array} data - Jsonld-based objects.
 */
function human_readable (data) {
    for (let object of data) {
        print_horizontal_line();

        if (typeof object === "string")
            console.log(object);
        else
            console.log(pretty_jsonld(object));
    }

    print_horizontal_line();
}

module.exports = {
    human_readable: human_readable
};
