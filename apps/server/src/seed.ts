const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

const DB = {
  host: '127.0.0.1',
  port: 5530,
  user: 'root',
  password: 'admin123',
  database: 'admin_yarsalam',
};

async function main() {
  const conn = await mysql.createConnection(DB);

  try {
    // شروع تراکنش
    await conn.beginTransaction();

    // پاک‌سازی کامل
    await conn.execute('DELETE FROM admin_users');

    const users = [
      {
        email: 'admin@yarsalam.com',
        password: 'Admin123!',
        role: 'superadmin',
        permissions: ['manage_users', 'edit_content', 'delete_content', 'view_analytics'],
      },
      {
        email: 'support@yarsalam.com',
        password: 'Support123!',
        role: 'support',
        permissions: ['manage_users', 'view_analytics'],
      },
      {
        email: 'marketing@yarsalam.com',
        password: 'Marketing123!',
        role: 'marketing',
        permissions: ['edit_content', 'view_analytics'],
      },
      {
        email: 'product@yarsalam.com',
        password: 'Product123!',
        role: 'product',
        permissions: ['edit_content', 'delete_content'],
      },
    ];

    for (const user of users) {
      try {
        const hash = await bcrypt.hash(user.password, 12);
        await conn.execute(
          `INSERT INTO admin_users (email, passwordHash, role, permissions, isActive, isVerified, setupToken)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            user.email,
            hash,
            user.role,
            JSON.stringify(user.permissions),
            true,
            true,
            null,
          ],
        );
        console.log(`✅ ${user.role} created: ${user.email}`);
      } catch (insertError) {
        console.error(`❌ Failed to insert ${user.email}:`, insertError.message);
        await conn.rollback();
        throw insertError; // متوقف می‌شود تا کل تراکنش برگردد
      }
    }

    await conn.commit();
    console.log('✅ All admin users seeded successfully');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    try { await conn.rollback(); } catch {}
  } finally {
    await conn.end();
  }
}

main();