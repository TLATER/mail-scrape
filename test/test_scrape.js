const scrape = require("../scrape.js");

const cheerio = require("cheerio");
const chai = require("chai");
const fs = require("fs");

const expect = chai.expect;

describe("scrape.merge_deep", () => {
    it("should combine two objects with nested arrays", () => {
        let a = {
            emails: [
                "a@a.com",
                "b@b.net"
            ],
            peter: {
                emails: [
                    "test@test.net"
                ]
            }
        };
        let b = {
            emails: [
                "a@a.com",
                "c@c.net"
            ],
            name: "test"
        };

        let result = {
            name: "test",
            emails: [
                "a@a.com",
                "b@b.net",
                "c@c.net"
            ],
            peter: {
                emails: [
                    "test@test.net"
                ]
            }

        };

        let test = scrape._private.merge_deep(a, b);
        expect(test).to.deep.equal(result);
    });
});


/**
 * Test module:scrape.extract_unstructured
 */
describe("scrape.extract_unstructured", () => {
    it.skip("should extract phone numbers and put them in the correct tag", done => {
        let numbers = {
            html: () => "+44 161 414 1080"
        };
        let expected = {
            "@context": "http://schema.org",
            telephone : [
                "+44 (161) 414-1080"
            ]
        };

        scrape._private.extract_unstructured(numbers, (err, res) => {
            expect(res).to.deep.equal(expected);
            done();
        });
    });

    it("should extract urls and put them in the correct tag", done => {
        let urls = {
            html: () => "http://www.facebook.com"
        };
        let expected = {
            "@context": "http://schema.org",
            sameAs: ["http://www.facebook.com"]
        };

        scrape._private.extract_unstructured(urls, (err, res) => {
            expect(res).to.deep.equal(expected);
            done();
        });
    });

    it("should extract emails and put them in the correct tag", done => {
        let emails = {
            html: () => "tim@candii.com\ntw@tlater.net"
        };
        let expected = {
            "@context": "http://schema.org",
            email: [
                "tim@candii.com",
                "tw@tlater.net"
            ]
        };

        scrape._private.extract_unstructured(emails, (err, res) => {
            expect(res).to.deep.equal(expected);
            done();
        });
    });

    it("should extract places and put them in the correct tag", done => {
        let places = {
            html: () => "at New York\n at Madrid"
        };
        let expected = {
            "@context": "http://schema.org",
            place: [
                {
                    "@type": "Place",
                    name: "New York"
                },
                {
                    "@type": "Place",
                    name: "Madrid"
                }
            ]
        };

        scrape._private.extract_unstructured(places, (err, res) => {
            expect(res).to.deep.equal(expected);
            done();
        });
    });
});

/**
 * Test module:scrape.extract_json_ld
 *
 */
describe("scrape.extract_json_ld", () => {
    /** Ensure that json_ld extraction works for canddi.com */
    it("should extract the correct data from canddi.com", done => {
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
                    {
                        "@type": "PostalAddress",
                        streetAddress: "47 Newton Street",
                        addressLocality: "Manchester",
                        addressRegion: "Manchester",
                        postalCode: "M1 1FT",
                        addressCountry: "GB"
                    },
                    contactPoint:
                    {
                        "@type": "ContactPoint",
                        contactType: "customer support",
                        telephone: "+44 161 1080",
                        email: "hello@canddi.com"
                    },
                    sameAs:
                    [
                        "https://www.facebook.com/thisiscanddi",
                        "https://www.linkedin.com/company/1079436",
                        "https://twitter.com/canddi/"
                    ]
                });

                done();
            });
        });
    });
});
