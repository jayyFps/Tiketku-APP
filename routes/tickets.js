const express = require('express');
const db = require('../database/db');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const { generateBarcodeString, generateBarcodeImage } = require('../utils/barcode');
const router = express.Router();

/**
 * POST /api/tickets/purchase
 * Purchase ticket (authenticated user)
 */
router.post('/purchase', authenticateToken, async (req, res) => {
    const { eventId, quantity } = req.body;
    const userId = req.user.id;

    if (!eventId || !quantity || quantity < 1) {
        return res.status(400).json({ error: 'Invalid request data' });
    }

    // Get event details
    db.get('SELECT * FROM events WHERE id = ?', [eventId], async (err, event) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        // Check stock
        if (event.stock < quantity) {
            return res.status(400).json({ error: 'Insufficient ticket stock' });
        }

        // Calculate total price
        const totalPrice = event.price * quantity;

        // Generate barcode
        const barcodeString = generateBarcodeString();

        try {
            // Generate barcode image
            const barcodeImage = await generateBarcodeImage(barcodeString);

            // Insert ticket
            const insertSql = `
        INSERT INTO tickets (user_id, event_id, barcode, quantity, total_price)
        VALUES (?, ?, ?, ?, ?)
      `;

            db.run(insertSql, [userId, eventId, barcodeString, quantity, totalPrice], function (err) {
                if (err) {
                    return res.status(500).json({ error: 'Failed to create ticket' });
                }

                // Update event stock
                const updateSql = `UPDATE events SET stock = stock - ? WHERE id = ?`;

                db.run(updateSql, [quantity, eventId], (err) => {
                    if (err) {
                        console.error('Failed to update stock:', err);
                    }

                    res.status(201).json({
                        message: 'Ticket purchased successfully',
                        ticket: {
                            id: this.lastID,
                            barcode: barcodeString,
                            barcodeImage: barcodeImage,
                            eventName: event.name,
                            quantity: quantity,
                            totalPrice: totalPrice,
                            purchaseDate: new Date().toISOString()
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Barcode generation error:', error);
            res.status(500).json({ error: 'Failed to generate barcode' });
        }
    });
});

/**
 * GET /api/tickets/my-tickets
 * Get user's tickets (authenticated user)
 */
router.get('/my-tickets', authenticateToken, (req, res) => {
    const userId = req.user.id;

    const sql = `
    SELECT 
      t.id,
      t.barcode,
      t.quantity,
      t.total_price,
      t.status,
      t.purchase_date,
      t.used_at,
      e.name as event_name,
      e.date as event_date,
      e.location as event_location
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    WHERE t.user_id = ?
    ORDER BY t.purchase_date DESC
  `;

    db.all(sql, [userId], (err, tickets) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ tickets });
    });
});

/**
 * GET /api/tickets/barcode/:barcode
 * Get barcode image for a ticket
 */
router.get('/barcode/:barcode', authenticateToken, async (req, res) => {
    const { barcode } = req.params;

    try {
        const barcodeImage = await generateBarcodeImage(barcode);
        res.json({ barcodeImage });
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate barcode image' });
    }
});

/**
 * POST /api/tickets/scan
 * Scan and validate ticket (admin only)
 */
router.post('/scan', authenticateAdmin, (req, res) => {
    const { barcode } = req.body;

    if (!barcode) {
        return res.status(400).json({ error: 'Barcode is required' });
    }

    // Find ticket
    const sql = `
    SELECT 
      t.id,
      t.barcode,
      t.quantity,
      t.status,
      t.purchase_date,
      t.used_at,
      e.name as event_name,
      e.date as event_date,
      e.location as event_location,
      u.username,
      u.email
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    JOIN users u ON t.user_id = u.id
    WHERE t.barcode = ?
  `;

    db.get(sql, [barcode], (err, ticket) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }

        if (!ticket) {
            return res.json({
                valid: false,
                message: 'Ticket not found'
            });
        }

        if (ticket.status === 'used') {
            return res.json({
                valid: false,
                message: 'Ticket already used',
                usedAt: ticket.used_at,
                ticket
            });
        }

        // Mark ticket as used
        const updateSql = `UPDATE tickets SET status = 'used', used_at = CURRENT_TIMESTAMP WHERE barcode = ?`;

        db.run(updateSql, [barcode], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to update ticket' });
            }

            res.json({
                valid: true,
                message: 'Ticket validated successfully',
                ticket: {
                    ...ticket,
                    status: 'used',
                    used_at: new Date().toISOString()
                }
            });
        });
    });
});

/**
 * GET /api/tickets/all
 * Get all tickets (admin only)
 */
router.get('/all', authenticateAdmin, (req, res) => {
    const sql = `
    SELECT 
      t.id,
      t.barcode,
      t.quantity,
      t.total_price,
      t.status,
      t.purchase_date,
      t.used_at,
      e.name as event_name,
      e.date as event_date,
      u.username,
      u.email
    FROM tickets t
    JOIN events e ON t.event_id = e.id
    JOIN users u ON t.user_id = u.id
    ORDER BY t.purchase_date DESC
  `;

    db.all(sql, [], (err, tickets) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ tickets });
    });
});

/**
 * GET /api/tickets/stats
 * Get ticket statistics (admin only)
 */
router.get('/stats', authenticateAdmin, (req, res) => {
    const sql = `
    SELECT 
      COUNT(*) as total_tickets,
      SUM(quantity) as total_quantity,
      SUM(total_price) as total_revenue,
      SUM(CASE WHEN status = 'used' THEN 1 ELSE 0 END) as used_tickets,
      SUM(CASE WHEN status = 'unused' THEN 1 ELSE 0 END) as unused_tickets
    FROM tickets
  `;

    db.get(sql, [], (err, stats) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ stats });
    });
});

module.exports = router;
