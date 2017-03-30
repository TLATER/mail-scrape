/**
 * Tests for module:extract_domain.
 *
 * @module test/test_extract_domain
 * @author Tristan Maat
 */

const extract_domain = require("../extract_domain");
const chai = require("chai");

const expect = chai.expect;

/**
 * Test module:extract_domain.from_email.
 *
 * Note that which part of an email address is the domain according to
 * the spec (https://www.cs.tut.fi/~jkorpela/rfc/822addr.html) may be
 * ambiguous (such as test@test@test.com), since @ may be used in both
 * the local and the domain part, as well as as a separator.
 *
 * Since it is impossible to parse such a domain correctly, at least
 * one test will fail.
 *
 * @todo Confirm the email spec.
 */
describe("extract_domain.from_email", () => {
    /** Test for simple email addresses such as canddi.com. */
    it("should extract canddi.com from tim@canddi.com", () => {
        let domain = extract_domain.from_email("tim@canddi.com");

        expect(domain)
            .to.equal("canddi.com");
    });

    /** Test for more complex email addresses with multiple subdomains. */
    it("should extract foo.bar.zap.example from tim@foo.bar.zap.ex", () => {
        let domain = extract_domain.from_email("tim@foo.bar.zap.ex");

        expect(domain)
            .to.equal("foo.bar.zap.ex");
    });

    /**
     * Test for email addresses with no domain. This is valid
     * according to the spec.
     *
     * @todo Ask whether these should actually be parsed like this.
     */
    it("should extract \"\" from tim@", () => {
        let domain = extract_domain.from_email("tim@");

        expect(domain)
            .to.equal("");
    });

    /** Test for email addresses with a local part including @s. */
    it("should extract canddi.com from tim@tim@canddi.com", () => {
        let domain = extract_domain.from_email("tim@tim@canddi.com");

        expect(domain)
            .to.equal("canddi.com");
    });

    /** Test for email addresses with a domain part including @s. */
    it("should extract canddi.com from tim@tim@canddi.com", () => {
        let domain = extract_domain.from_email("tim@tim@canddi.com");

        expect(domain)
            .to.equal("tim@canddi.com");
    });

    /** Test for email addresses with domain-literals. */
    it("should extract 10.0.3.19 from tim@[10.0.3.19]", () => {
        let domain = extract_domain.from_email("tim@[10.0.3.19]");

        expect(domain)
            .to.equal("10.0.3.19");
    });
});
