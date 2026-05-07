INSERT INTO admin_users (name, email, password_hash, role)
SELECT 'Администратор', 'admin@admin.com', '0192023a7bbd73250516f069df18b500', 'superadmin'
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'admin@admin.com');
