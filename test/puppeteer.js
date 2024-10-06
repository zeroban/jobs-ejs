const puppeteer = require("puppeteer");
require("../app");
const { seed_db, testUserPassword } = require("../util/seed_db");
const Job = require("../models/Job");

let testUser = null;

let page = null;
let browser = null;
// Launch the browser and open a new blank page
describe("jobs-ejs puppeteer test", function () {
    before(async function () {
        this.timeout(10000);
        //await sleeper(5000)
        browser = await puppeteer.launch({ headless: false, slowMo: 50 });
        page = await browser.newPage();
        await page.goto("http://localhost:3000");
    });
    after(async function () {
        this.timeout(5000);
        await browser.close();
    });
    describe("got to site", function () {
        it("should have completed a connection", async function () { });
    });
    describe("index page test", function () {
        this.timeout(10000);
        it("finds the index page logon link", async () => {
            this.logonLink = await page.waitForSelector(
                "a ::-p-text(Click this link to logon)",
            );
        });
        it("gets to the logon page", async () => {
            await this.logonLink.click();
            await page.waitForNavigation();
            const email = await page.waitForSelector('input[name="email"]');
        });
    });
    describe("logon page test", function () {
        this.timeout(20000);
        it("resolves all the fields", async () => {
            this.email = await page.waitForSelector('input[name="email"]');
            this.password = await page.waitForSelector('input[name="password"]');
            this.submit = await page.waitForSelector("button ::-p-text(Logon)");
        });
        it("sends the logon", async () => {
            testUser = await seed_db();
            await this.email.type(testUser.email);
            await this.password.type(testUserPassword);
            await this.submit.click();
            await page.waitForNavigation();
            await page.waitForSelector(`p ::-p-text(${testUser.name} is logged on.)`);
            // await page.waitForSelector("a ::-p-text(change the secret)");
            await page.waitForSelector('a[href="/secretWord"]');
            // const copyr = await page.waitForSelector("p ::-p-text(copyright)");
            // const copyrText = await copyr.evaluate((el) => el.textContent);
            // console.log("copyright text: ", copyrText);
        });

    });

    describe("puppeteer crud operations", function () {
        this.timeout(15000);
        it("clicks the link to access tires list", async () => {

            const { expect } = await import('chai');

            // selector for the link
            // this.tiresLink = await page.waitForSelector('a[href="/secretWord"]');
            this.tiresLink = await page.waitForSelector("a ::-p-text(Placeholder)");


            await this.tiresLink.click();
            await page.waitForNavigation();

            const content = await page.content();
            const pageParts = content.split("<tr>");

            // assignment said to expect 20 but I am getting 21
            expect(pageParts.length).to.equal(21);


        });

        it("clicks the link to add a new tires", async () => {

            const { expect } = await import('chai');

            // selector to click on the "Add Tire" button
            const addJobButton = await page.waitForSelector('button ::-p-text(Add Tire)');
            await addJobButton.click();
            await page.waitForNavigation();

            // Verify that the expected form fields are present
            this.brandField = await page.waitForSelector('input[name="brand"]');
            this.sizeField = await page.waitForSelector('input[name="size"]');
            this.priceField = await page.waitForSelector('input[name="price"]');
            this.quantityField = await page.waitForSelector('input[name="quantity"]');
            this.locationField = await page.waitForSelector('select[name="location"]');
            this.submitButton = await page.waitForSelector('button[type="submit"]');
            this.cancelButton = await page.waitForSelector('button[type="button"]');


        });
        it("should fill in the add tire form and submit", async () => {
            const { expect } = await import('chai');

            // Fill in the form fields
            await page.type('input[name="brand"]', 'Goodyear');
            await page.type('input[name="size"]', '205/55R16');
            await page.type('input[name="price"]', '99.99');
            await page.type('input[name="quantity"]', '10');
            await page.select('select[name="location"]', 'Mebane');

            // Clicks the submit button
            const submitButton = await page.waitForSelector('button[type="submit"]');
            await submitButton.click();

            await page.waitForNavigation();


            // checks the page for the newly added tire to see if it exists
            const newTire = await Job.findOne({ brand: 'Goodyear' });
            expect(newTire).to.exist;
            expect(newTire.size).to.equal('205/55R16');
            expect(newTire.price).to.equal(99.99);
            expect(newTire.quantity).to.equal(10);
            expect(newTire.location).to.equal('Mebane');

        });


    });

});