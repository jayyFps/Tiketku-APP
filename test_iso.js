const fetch = require('node-fetch');

async function test() {
    try {
        console.log('--- STARTING SIMPLE TEST ---');

        // 1. Register/Login Admin2
        console.log('Registering/Logging in Admin2...');
        // Register (ignore error if exists)
        await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin2', email: 'admin2@test.com', password: 'password123', role: 'admin' })
        });

        // Login
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin2@test.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);

        if (!loginData.token) {
            console.error('LOGIN FAILED:', loginData);
            return;
        }
        const token = loginData.token;
        console.log('Got Token for Admin2');

        // 2. Fetch Managed Events
        console.log('Fetching Managed Events for Admin2...');
        const eventRes = await fetch('http://localhost:3000/api/events/managed', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const eventData = await eventRes.json();
        console.log('Managed Events Count:', eventData.events ? eventData.events.length : eventData);

    } catch (e) {
        console.error('CRASH:', e);
    }
}

test();
