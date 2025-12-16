const fetch = require('node-fetch');

const API = 'http://localhost:3000/api';

async function verify() {
    try {
        console.log('--- FINAL VERIFICATION ---');

        // 1. Get Token for Admin (ID 1)
        const login1 = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        }).then(r => r.json());
        const token1 = login1.token;
        console.log('Admin1 Token:', !!token1);

        // 2. Get/Register Token for Admin2 (ID ?)
        await fetch(`${API}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin2', email: 'admin2@test.com', password: 'password123', role: 'admin' })
        });
        const login2 = await fetch(`${API}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin2@test.com', password: 'password123' })
        }).then(r => r.json());
        const token2 = login2.token;
        console.log('Admin2 Token:', !!token2);

        // 3. Admin2 Creates Event
        const newEvent = await fetch(`${API}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token2}` },
            body: JSON.stringify({
                name: 'Exclusive Admin2 Event ' + Date.now(),
                date: '2025-12-12',
                location: 'Test',
                price: 100,
                stock: 10
            })
        }).then(r => r.json());
        console.log('Admin2 Created Event:', newEvent.eventId);

        // 4. Admin2 Fetches Managed
        const events2 = await fetch(`${API}/events/managed`, {
            headers: { 'Authorization': `Bearer ${token2}` }
        }).then(r => r.json());
        const found2 = events2.events.find(e => e.id === newEvent.eventId);
        console.log('Admin2 sees event?', !!found2);

        // 5. Admin1 Fetches Managed
        const events1 = await fetch(`${API}/events/managed`, {
            headers: { 'Authorization': `Bearer ${token1}` }
        }).then(r => r.json());
        const found1 = events1.events.find(e => e.id === newEvent.eventId);
        console.log('Admin1 sees event?', !!found1);

        if (found2 && !found1) {
            console.log('SUCCESS: Isolation verified.');
        } else {
            console.error('FAILURE: Isolation failed.');
        }

    } catch (e) {
        console.error('ERROR:', e);
    }
}

verify();
