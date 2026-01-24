const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    console.log("Raw body:", body);
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function test() {
    console.log("1. Signing up...");
    const email = `test_ipc_${Date.now()}@example.com`;
    const signupData = {
        name: "Test User",
        email: email,
        password: "password123",
        role: "civilian"
    };

    try {
        const signupRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/signup',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, signupData);

        console.log("Signup Response:", signupRes.statusCode, signupRes.data.status);

        let token;
        if (signupRes.data.token) {
            token = signupRes.data.token;
        } else if (signupRes.statusCode === 400 && signupRes.data.message && signupRes.data.message.includes("exists")) {
            console.log("User exists, trying login...");
            const loginRes = await makeRequest({
                hostname: 'localhost',
                port: 5000,
                path: '/api/auth/login',
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }, { email: email, password: "password123" });
            token = loginRes.data.token;
        }

        if (!token) {
            console.error("Failed to get token. Aborting.");
            return;
        }

        console.log("2. Searching for '302'...");
        const searchRes = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/ipc/search?query=302',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Search '302' Result:", JSON.stringify(searchRes.data, null, 2));

        console.log("3. Searching for '\"302\"' (quoted)...");
        const searchResQuoted = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            // Encode the query parameter properly
            path: '/api/ipc/search?query=%22302%22',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log("Search '\"302\"' Result:", JSON.stringify(searchResQuoted.data, null, 2));

    } catch (err) {
        console.error("Error:", err);
    }
}

test();
