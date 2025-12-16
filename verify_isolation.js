const fetch = require('node-fetch');
// Helper for logging
const log = (msg) => console.log(`[TEST] ${msg}`);

async function runTest() {
    const API_URL = 'http://localhost:3000/api';

    // 1. Register Admin 2
    log('Registering admin2...');
    // We try to register, if exists we proceed to login
    await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin2', email: 'admin2@test.com', password: 'password123', role: 'admin' })
    });

    // 2. Login Admin 2
    log('Logging in admin2...');
    const login2 = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin2@test.com', password: 'password123' })
    }).then(r => r.json());

    if (!login2.token) {
        throw new Error('Failed to login admin2');
    }
    const token2 = login2.token;

    // 3. Login Admin 1 (default)
    log('Logging in admin1...');
    const login1 = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' }) // Assuming default credentials
    }).then(r => r.json());

    if (!login1.token) {
        // Try registering admin if not exists (init-db should have created it though)
        throw new Error('Failed to login admin1');
    }
    const token1 = login1.token;

    // 4. Create Event as Admin 2
    log('Creating event as admin2...');
    const event2Res = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token2}`
        },
        body: JSON.stringify({
            name: 'Admin2 Exclusive Event',
            date: '2025-05-05',
            location: 'Secret Base',
            price: 50000,
            stock: 100,
            description: 'Only for admin2'
        })
    }).then(r => r.json());

    if (!event2Res.eventId) {
        console.error(event2Res);
        throw new Error('Failed to create event for admin2');
    }
    log(`Event created: ${event2Res.eventId}`);

    // 5. Fetch Managed Events as Admin 1
    log('Fetching events for Admin 1...');
    const events1 = await fetch(`${API_URL}/events/managed`, {
        headers: { 'Authorization': `Bearer ${token1}` }
    }).then(r => r.json());

    // 6. Fetch Managed Events as Admin 2
    log('Fetching events for Admin 2...');
    const events2 = await fetch(`${API_URL}/events/managed`, {
        headers: { 'Authorization': `Bearer ${token2}` }
    }).then(r => r.json());

    // 7. Verify Isolation
    const admin1SeesEvent = events1.events.find(e => e.name === 'Admin2 Exclusive Event');
    const admin2SeesEvent = events2.events.find(e => e.name === 'Admin2 Exclusive Event');

    log('--- RESULTS ---');
    if (!admin1SeesEvent) {
        log('SUCCESS: Admin 1 CANNOT see Admin 2 event.');
    } else {
        log('FAILURE: Admin 1 CAN see Admin 2 event!');
    }

    if (admin2SeesEvent) {
        log('SUCCESS: Admin 2 CAN see their own event.');
    } else {
        log('FAILURE: Admin 2 CANNOT see their own event!');
    }
}

runTest().catch(console.error);
