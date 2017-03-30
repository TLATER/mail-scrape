#!/usr/bin/env node

const extract_domain = require("./extract_domain.js");
const parser = require("commander");

/**
 * Get the domains from the given email addresses and parse any
 * available data on those pages, printing it in a nice,
 * human-readable form.
 *
 * @argument addresses - The email addresses whose domain to parse.
 */
function main (addresses) {
    addresses.forEach((e) => {
        let domain = extract_domain.from_email(e);
        console.log(domain);
    });
}

let addresses = null;

parser
    .arguments("<addresses...>")
    .action((address_input) => { addresses = address_input; })
    .parse(process.argv);

if (addresses === null) {
    console.error("No address specified.");
    parser.outputHelp();
    process.exit(1);
}

main(addresses);
