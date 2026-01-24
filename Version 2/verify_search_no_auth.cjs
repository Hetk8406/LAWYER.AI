const http = require('http');

function makeRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: 'GET'
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

async function verify() {
    console.log("Testing Search API (No Auth)...");

    // Test 1: Regular
    console.log("1. Search query='302'");
    const res1 = await makeRequest('/api/ipc/search?query=302');
    console.log(`Status: ${res1.statusCode}`);
    if (res1.data.data && res1.data.data.length > 0) {
        console.log(`Result: ${res1.data.data[0].section}`);
    } else {
        console.log("No results found.");
    }

    // Test 2: Quoted
    console.log("\n2. Search query='%22302%22' (quoted)");
    const res2 = await makeRequest('/api/ipc/search?query=%22302%22');
    console.log(`Status: ${res2.statusCode}`);
    if (res2.data.data && res2.data.data.length > 0) {
        console.log(`Result: ${res2.data.data[0].section}`);
    } else {
        console.log("No results found.");
    }
}

verify();
