/**
 * A module to help extracting domains from various formats.
 *
 * @module extract_domain
 * @author Tristan Maat
 */

/**
 * Extract the domain from an email address (e.g. for tim@canddi.com,
 * canddi.com).
 *
 * @argument mail_address - The mail address to extract from.
 * @returns The extracted domain.
 */
function extract_domain_from_email (mail_address) {
    let split_copy = mail_address.split("@");
    let domain = split_copy[split_copy.length - 1];

    if (domain.match(/\[.*\]/))
        domain = domain.substr(1, domain.length - 2);

    return domain;
}

module.exports = {
    from_email: extract_domain_from_email
};
