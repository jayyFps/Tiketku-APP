const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key';

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', (req, res) => {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate role (default to 'user' if not provided)
    const userRole = role && (role === 'admin' || role === 'user') ? role : 'user';

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user with specified role
    const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;

    db.run(sql, [username, email, hashedPassword, userRole], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }
            return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
            message: 'User registered successfully',
            userId: this.lastID,
            role: userRole
        });
    });
});

/**
 * POST /api/auth/login
 * Unified login for both users and admins
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user (both regular users and admins)
    const sql = `SELECT * FROM users WHERE username = ? OR email = ?`;

    db.get(sql, [username, username], (err, user) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const validPassword = bcrypt.compareSync(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Generate JWT token with role information
        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                role: user.role || 'user',
                isAdmin: user.role === 'admin'
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role || 'user'
            }
        });
    });
});

/**
 * POST /api/auth/admin-login
 * Admin login (kept for backward compatibility, but now uses unified users table)
 */
router.post('/admin-login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find admin in users table
    const sql = `SELECT * FROM users WHERE username = ? AND role = 'admin'`;

    db.get(sql, [username], (err, admin) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify password
        const validPassword = bcrypt.compareSync(password, admin.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin.id, username: admin.username, role: 'admin', isAdmin: true },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Admin login successful',
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                role: 'admin'
            }
        });
    });
});

module.exports = router;
