const bcrypt = require('bcryptjs');
const db = require('./db');

console.log('Initializing database with sample data...');

// Wait for database to be ready
setTimeout(() => {
    db.serialize(() => {
        // Create default admin in users table with role='admin'
        const adminPassword = bcrypt.hashSync('admin123', 10);
        db.run(`
      INSERT OR IGNORE INTO users (username, email, password, role)
      VALUES ('admin', 'admin@tiketku.com', ?, 'admin')
    `, [adminPassword], (err) => {
            if (err) {
                console.error('Error creating admin:', err.message);
            } else {
                console.log('✓ Default admin created (username: admin, password: admin123)');
            }
        });

        // Sample events
        const events = [
            {
                name: 'Konser Musik Rock Festival 2024',
                description: 'Festival musik rock terbesar tahun ini dengan headliner band-band ternama. Nikmati pengalaman musik live yang tak terlupakan!',
                date: '2024-12-25',
                location: 'Gelora Bung Karno, Jakarta',
                price: 250000,
                stock: 500,
                image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800'
            },
            {
                name: 'Tech Conference Indonesia',
                description: 'Konferensi teknologi dengan pembicara dari perusahaan teknologi global. Workshop, networking, dan insight terbaru tentang AI, Cloud, dan Web Development.',
                date: '2024-12-30',
                location: 'Jakarta Convention Center',
                price: 500000,
                stock: 200,
                image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
            },
            {
                name: 'Stand Up Comedy Night',
                description: 'Malam penuh tawa bersama komika-komika terbaik Indonesia. Siapkan perut Anda untuk tertawa lepas!',
                date: '2024-12-28',
                location: 'Balai Sarbini, Jakarta',
                price: 150000,
                stock: 300,
                image_url: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=800'
            },
            {
                name: 'Food Festival 2024',
                description: 'Festival kuliner dengan 100+ vendor makanan dari seluruh nusantara. Dari street food hingga fine dining!',
                date: '2025-01-05',
                location: 'Pantai Indah Kapuk, Jakarta',
                price: 50000,
                stock: 1000,
                image_url: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
            },
            {
                name: 'Workshop Fotografi',
                description: 'Belajar teknik fotografi dari fotografer profesional. Cocok untuk pemula hingga intermediate. Bawa kamera Anda!',
                date: '2025-01-10',
                location: 'Kota Tua, Jakarta',
                price: 300000,
                stock: 50,
                image_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800'
            },
            {
                name: 'Marathon Jakarta 2025',
                description: 'Lomba lari marathon 10K, 21K, dan 42K. Dapatkan medali finisher dan jersey eksklusif!',
                date: '2025-01-15',
                location: 'Bundaran HI, Jakarta',
                price: 200000,
                stock: 5000,
                image_url: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800'
            }
        ];

        const stmt = db.prepare(`
      INSERT INTO events (name, description, date, location, price, stock, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

        events.forEach((event) => {
            stmt.run(
                event.name,
                event.description,
                event.date,
                event.location,
                event.price,
                event.stock,
                event.image_url,
                (err) => {
                    if (err) {
                        console.error('Error inserting event:', err.message);
                    }
                }
            );
        });

        stmt.finalize(() => {
            console.log('✓ Sample events created');
            console.log('\n=================================');
            console.log('Database initialization complete!');
            console.log('=================================\n');

            // Close database connection
            db.close((err) => {
                if (err) {
                    console.error(err.message);
                }
                console.log('Database connection closed.');
                process.exit(0);
            });
        });
    });
}, 1000);
