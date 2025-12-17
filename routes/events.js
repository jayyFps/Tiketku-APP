const express = require('express');
const db = require('../database/db');
const { authenticateAdmin } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/events
 * Get all events (public)
 */
router.get('/', (req, res) => {
    const sql = `SELECT * FROM events ORDER BY date ASC`;

    db.all(sql, [], (err, events) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ events });
    });
});

/**
 * GET /api/events/managed
 * Get events managed by the current admin
 */
router.get('/managed', authenticateAdmin, (req, res) => {
    // req.admin is set by authenticateAdmin middleware
    const adminId = req.admin.id;
    const sql = `SELECT * FROM events WHERE admin_id = ? ORDER BY date ASC`;

    db.all(sql, [adminId], (err, events) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ events });
    });
});

/**
 * GET /api/events/:id
 * Get event by ID (public)
 */
router.get('/:id', (req, res) => {
    const sql = `SELECT * FROM events WHERE id = ?`;

    db.get(sql, [req.params.id], (err, event) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json({ event });
    });
});

const upload = require('../middleware/upload');

// ... (GET routes unchanged)

/**
 * POST /api/events
 * Create new event (admin only)
 */
router.post('/', authenticateAdmin, upload.single('image'), (req, res) => {
    try {
        const { name, description, date, location, price, stock } = req.body;
        const adminId = req.admin.id;

        if (!name || !date || !location || price === undefined || stock === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Handle image
        let imageUrl = 'https://via.placeholder.com/400x200?text=Event';
        if (req.file) {
            imageUrl = '/uploads/' + req.file.filename;
        } else if (req.body.image_url) {
            imageUrl = req.body.image_url;
        }

        const sql = `
        INSERT INTO events (name, description, date, location, price, stock, image_url, admin_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

        db.run(sql, [name, description, date, location, price, stock, imageUrl, adminId], function (err) {
            if (err) {
                console.error('DB Error:', err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.status(201).json({
                message: 'Event created successfully',
                eventId: this.lastID
            });
        });
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * PUT /api/events/:id
 * Update event (admin only - ownership check)
 */
router.put('/:id', authenticateAdmin, upload.single('image'), (req, res) => {
    try {
        const { name, description, date, location, price, stock } = req.body;
        const eventId = req.params.id;
        const adminId = req.admin.id;

        // First check ownership
        db.get('SELECT admin_id, image_url FROM events WHERE id = ?', [eventId], (err, event) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (!event) return res.status(404).json({ error: 'Event not found' });

            if (event.admin_id && event.admin_id !== adminId) {
                return res.status(403).json({ error: 'You do not have permission to edit this event' });
            }

            // Determine image URL
            let imageUrl = event.image_url;
            if (req.file) {
                imageUrl = '/uploads/' + req.file.filename;
            } else if (req.body.image_url) {
                // Allow updating URL manually if provided and no file
                imageUrl = req.body.image_url;
            }

            const sql = `
            UPDATE events
            SET name = ?, description = ?, date = ?, location = ?, price = ?, stock = ?, image_url = ?, admin_id = COALESCE(admin_id, ?)
            WHERE id = ?
          `;

            db.run(sql, [name, description, date, location, price, stock, imageUrl, adminId, eventId], function (err) {
                if (err) {
                    console.error('Update DB Error:', err);
                    return res.status(500).json({ error: 'Database error' });
                }
                res.json({ message: 'Event updated successfully' });
            });
        });
    } catch (error) {
        console.error('Update Event Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * DELETE /api/events/:id
 * Delete event (admin only - ownership check)
 */
router.delete('/:id', authenticateAdmin, (req, res) => {
    const eventId = req.params.id;
    const adminId = req.admin.id;

    // Check ownership
    db.get('SELECT admin_id FROM events WHERE id = ?', [eventId], (err, event) => {
        if (err) return res.status(500).json({ error: 'Database error: ' + err.message });
        if (!event) return res.status(404).json({ error: 'Event not found' });

        if (event.admin_id && event.admin_id !== adminId) {
            return res.status(403).json({ error: 'You do not have permission to delete this event' });
        }

        // First delete associated tickets
        db.run('DELETE FROM tickets WHERE event_id = ?', [eventId], function (err) {
            if (err) return res.status(500).json({ error: 'Database error deleting tickets: ' + err.message });

            // Then delete the event
            const sql = `DELETE FROM events WHERE id = ?`;

            db.run(sql, [eventId], function (err) {
                if (err) return res.status(500).json({ error: 'Database error deleting event: ' + err.message });
                res.json({ message: 'Event and associated tickets deleted successfully' });
            });
        });
    });
});

module.exports = router;
