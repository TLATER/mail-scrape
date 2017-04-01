const scrape = require("../scrape.js");

const cheerio = require("cheerio");
const chai = require("chai");
const fs = require("fs");

const expect = chai.expect;

/**
 * Test module:scrape.extract_json_ld
 *
 */
describe("scrape.extract_json_ld", () => {
    /** Ensure that json_ld extraction works for canddi.com */
    it("should extract the correct data from canddi.com", (done) => {
        fs.readFile("test/test_data/canddi.html", "utf8", (error, html) => {
            if (error) {
                done(error);
                return;
            }

            let $ = cheerio.load(html);
            scrape._private.extract_json_ld($, (err, result) => {
                expect(result).to.deep.equal({
                    "@context": "http://schema.org",
                    "@type": "Organization",
                    name: "CANDDi",
                    legalName: "Campaign and Digital Intelligence Limited",
                    alternateName: "CANDDi",
                    url: "https://www.canddi.com",
                    logo: "https://www.canddi.com/static/img/logo2x.png",
                    foundingDate: "2009",
                    address:
                    { "@type": "PostalAddress",
                      streetAddress: "47 Newton Street",
                      addressLocality: "Manchester",
                      addressRegion: "Manchester",
                      postalCode: "M1 1FT",
                      addressCountry: "GB" },
                    contactPoint:
                    { "@type": "ContactPoint",
                      contactType: "customer support",
                        telephone: "+44 161 1080",
                      email: "hello@canddi.com" },
                    sameAs:
                      [ "https://www.facebook.com/thisiscanddi",
                        "https://www.linkedin.com/company/1079436",
                        "https://twitter.com/canddi/" ]
                });

                done();
            });
        });
    });

    it("should extract the correct data from a non-compact json_ld", (done) => {
        var doc = {
            "http://schema.org/name": "Manu Sporny",
            "http://schema.org/url": {"@id": "http://manu.sporny.org/"},
            "http://schema.org/image": {"@id": "http://manu.sporny.org/images/manu.png"}
        };


    });
});
