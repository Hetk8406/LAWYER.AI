const http = require('http');

const makeRequest = (options, postData) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
        });
        req.on('error', (e) => reject(e));
        if (postData) req.write(postData);
        req.end();
    });
};

const runTest = async () => {
    try {
        console.log("1. Creating Lawyer...");
        const lawyerData = JSON.stringify({
            name: "Test Lawyer",
            email: `test_lawyer_${Date.now()}@example.com`,
            password: "password123",
            role: "lawyer",
            barCouncilId: `BC_${Date.now()}`, // Required for lawyer
            experience: 5
        });

        let res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/signup',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, lawyerData);
        const lawyer = JSON.parse(res.body);
        console.log("Lawyer Created:", lawyer.success || lawyer.token ? "Yes" : res.body);

        console.log("2. Creating Civilian...");
        const civilianData = JSON.stringify({
            name: "Test Civilian",
            email: `test_civilian_${Date.now()}@example.com`,
            password: "password123",
            role: "civilian"
        });

        res = await makeRequest({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/signup',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, civilianData);
        const civilian = JSON.parse(res.body);
        const civilianToken = civilian.token;
        const civilianId = civilian.data?.user?._id || civilian.data?.user?.id;
        console.log("Civilian Created:", civilianToken ? "Yes" : res.body);
        console.log("Civilian ID:", civilianId);

        if (civilianToken && civilianId) {
            console.log("Waiting 5s for verification update...");
            await new Promise(r => setTimeout(r, 5000));

            console.log("3. Fetching Contacts for Civilian...");
            res = await makeRequest({
                hostname: 'localhost',
                port: 5000,
                path: `/api/courtroom/${civilianId}/contacts`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${civilianToken}`
                }
            });
            console.log("Status:", res.statusCode);
            console.log("Contacts Response:", res.body.substring(0, 500)); // Log first 500 chars
        }

    } catch (err) {
        console.error("Test Error:", err);
    }
};

runTest();
