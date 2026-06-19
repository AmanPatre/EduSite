
const axios = require('axios');
require('dotenv').config();

async function testSearch() {
    const key = process.env.GOOGLE_CSE_KEY;
    const cx = process.env.GOOGLE_CSE_CX;

    console.log("Using Key:", key ? "PRESENT" : "MISSING");
    console.log("Using CX:", cx ? "PRESENT" : "MISSING");

    if (!key || !cx) {
        console.error("Missing credentials");
        return;
    }

    const query = "React.js for Beginners (site:react.dev OR site:nextjs.org)";
    const count = 15;

    try {
        const res = await axios.get("https://www.googleapis.com/customsearch/v1", {
            params: { key, cx, q: query, num: count },
        });
        console.log("Success!", res.data.items?.length, "results");
    } catch (error) {
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error:", error.message);
        }
    }
}

testSearch();
