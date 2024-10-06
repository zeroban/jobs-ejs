const Job = require("../models/Job")
const { seed_db, testUserPassword } = require("../util/seed_db");
const get_chai = require("../util/get_chai");
const { app } = require("../app");
const { default: factory } = require("factory-bot");


describe("puppeteer tire operations", function () {
    before(async () => {
        const { expect, request } = await get_chai();
        this.test_user = await seed_db();
        let req = request.execute(app).get("/sessions/logon").send();
        let res = await req;
        const textNoLineEnd = res.text.replaceAll("\n", "");
        this.csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];
        let cookies = res.headers["set-cookie"];
        this.csrfCookie = cookies.find((element) =>
            element.startsWith("csrfToken")
        );
        const dataToPost = {
            email: this.test_user.email,
            password: testUserPassword,
            _csrf: this.csrfToken,
        };
        req = request
            .execute(app)
            .post("/sessions/logon")
            .set("Cookie", this.csrfCookie)
            .set("content-type", "application/x-www-form-urlencoded")
            .redirects(0)
            .send(dataToPost);
        res = await req;
        cookies = res.headers["set-cookie"];
        this.sessionCookie = cookies.find((element) =>
            element.startsWith("connect.sid")
        );
        expect(this.csrfToken).to.not.be.undefined;
        expect(this.sessionCookie).to.not.be.undefined;
        expect(this.csrfCookie).to.not.be.undefined;
    });

    it("should get the Tires List", async () => {
        const { expect, request } = await get_chai();
        const req = request
            .execute(app)
            .get("/tires")
            .set("Cookie", this.sessionCookie)
            .send();
        const res = await req;
        expect(res).to.have.status(200);
        const pageParts = res.text.split("<tr>");
        // console.log(pageParts);  
        expect(pageParts.length).to.equal(21);
    });


    // Not 100% sure about this one - looks to be working 
    it("should POST a new tire entry using a job", async () => {
        const { expect, request } = await get_chai();

        // Create a new tire using the factory.build
        this.job = await factory.build("job", { createdBy: this.test_user._id });

        // creates the tire based off the job model
        const dataToPost = {
            brand: this.job.brand,
            model: this.job.model,
            size: this.job.size,
            price: this.job.price,
            _csrf: this.csrfToken
        };

        // Make the POST request to /tires
        const req = request
            .execute(app)
            .post("/tires")
            .set("Cookie", [this.csrfCookie, this.sessionCookie])
            .set("content-type", "application/x-www-form-urlencoded") // Don't forget to add this in
            .send(dataToPost);

        const res = await req;

        // Checks to make sure successful status code is recieved
        expect(res).to.have.status(200);

        // Check the response text and split it by table rows <tr>, similar to the GET test
        const pageParts = res.text.split("<tr>");

        // a bit confused here. Instructions mentioned to have it set to 21 but it expects 22
        const jobs = await Job.find({ createdBy: this.test_user._id })
        // console.log(jobs);

        expect(pageParts.length).to.equal(22);

    });


});
