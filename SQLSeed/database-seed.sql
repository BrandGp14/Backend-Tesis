-- =====================================================
-- SCRIPT DE SEEDERS PARA WASIRIFA BACKEND
-- Ejecutar después de crear la base de datos
-- =====================================================

-- Limpiar datos existentes (opcional)
-- DELETE FROM user_roles WHERE "createdBy" = 'seeder';
-- DELETE FROM users WHERE "createdBy" = 'seeder';  
-- DELETE FROM roles WHERE "createdBy" = 'seeder';
-- DELETE FROM institutions WHERE "createdBy" = 'seeder';

-- 1. Insertar Instituciones
DO $$
BEGIN
    -- WasiRifa Digital
    IF NOT EXISTS (SELECT 1 FROM institutions WHERE domain = 'wasirifa.digital') THEN
        INSERT INTO institutions (id, description, document_number, document_type, address, phone, email, website, domain, picture, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt") 
        VALUES (
            gen_random_uuid(),
            'WasiRifa Digital',
            '20123456789',
            'RUC',
            'Av. Tecnológica 123, Lima, Perú',
            '+51-1-234-5678',
            'contacto@wasirifa.digital',
            'https://wasirifa.digital',
            'wasirifa.digital',
            'https://wasirifa.digital/logo.png',
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;

    -- Tecsup
    IF NOT EXISTS (SELECT 1 FROM institutions WHERE domain = 'tecsup.edu.pe') THEN
        INSERT INTO institutions (id, description, document_number, document_type, address, phone, email, website, domain, picture, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt") 
        VALUES (
            gen_random_uuid(),
            'Instituto de Educación Superior Tecnológico Privado Tecsup',
            '20131380268',
            'RUC',
            'Av. Cascanueces 2221, Santa Anita, Lima',
            '+51-1-317-3900',
            'informes@tecsup.edu.pe',
            'https://www.tecsup.edu.pe',
            'tecsup.edu.pe',
            'https://tecsup.edu.pe/logo.png',
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;
END $$;

-- 2. Insertar Roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM roles WHERE code = 'ADMINSUPREMO') THEN
        INSERT INTO roles (id, code, description, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), 'ADMINSUPREMO', 'Administrador Supremo del Sistema', true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE code = 'ADMIN') THEN
        INSERT INTO roles (id, code, description, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), 'ADMIN', 'Administrador Institucional', true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE code = 'ORGANIZADOR') THEN
        INSERT INTO roles (id, code, description, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), 'ORGANIZADOR', 'Organizador de Rifas', true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE code = 'ESTUDIANTE') THEN
        INSERT INTO roles (id, code, description, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), 'ESTUDIANTE', 'Estudiante', true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM roles WHERE code = 'USUARIO') THEN
        INSERT INTO roles (id, code, description, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), 'USUARIO', 'Usuario General', true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;
END $$;

-- 3. Insertar Usuarios
-- Contraseña hasheada para todos: "password123"
DO $$
BEGIN
    -- ADMIN SUPREMO - WasiRifa
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'carlos.rodriguez@wasirifa.digital') THEN
        INSERT INTO users (id, email, "firstName", "lastName", student_code, document_number, document_type, phone, profile_photo_url, password, last_login, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'carlos.rodriguez@wasirifa.digital',
            'Carlos Alberto',
            'Rodríguez Mendoza',
            NULL,
            '12345678',
            'DNI',
            '+51987654321',
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
            '$2b$12$LQv3c1yqBWVHjGdqEKLaLOf7sC7PpB.xbQ4cFWWQ7A8ZgOe/EXhbO',
            NOW(),
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;

    -- ADMIN - Tecsup
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'maria.garcia@tecsup.edu.pe') THEN
        INSERT INTO users (id, email, "firstName", "lastName", student_code, document_number, document_type, phone, profile_photo_url, password, last_login, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'maria.garcia@tecsup.edu.pe',
            'María Elena',
            'García Vásquez',
            NULL,
            '87654321',
            'DNI',
            '+51976543210',
            'https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150',
            '$2b$12$LQv3c1yqBWVHjGdqEKLaLOf7sC7PpB.xbQ4cFWWQ7A8ZgOe/EXhbO',
            NOW(),
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;

    -- ORGANIZADOR - Tecsup
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'luis.torres@tecsup.edu.pe') THEN
        INSERT INTO users (id, email, "firstName", "lastName", student_code, document_number, document_type, phone, profile_photo_url, password, last_login, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'luis.torres@tecsup.edu.pe',
            'Luis Fernando',
            'Torres Castillo',
            'ORG2024001',
            '11223344',
            'DNI',
            '+51965432109',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
            '$2b$12$LQv3c1yqBWVHjGdqEKLaLOf7sC7PpB.xbQ4cFWWQ7A8ZgOe/EXhbO',
            NOW(),
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;

    -- ESTUDIANTE 1 - Tecsup
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'ana.lopez@tecsup.edu.pe') THEN
        INSERT INTO users (id, email, "firstName", "lastName", student_code, document_number, document_type, phone, profile_photo_url, password, last_login, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'ana.lopez@tecsup.edu.pe',
            'Ana Sofía',
            'López Hernández',
            '202012345',
            '55667788',
            'DNI',
            '+51954321098',
            'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
            '$2b$12$LQv3c1yqBWVHjGdqEKLaLOf7sC7PpB.xbQ4cFWWQ7A8ZgOe/EXhbO',
            NOW(),
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;

    -- ESTUDIANTE 2 - Tecsup
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'diego.morales@tecsup.edu.pe') THEN
        INSERT INTO users (id, email, "firstName", "lastName", student_code, document_number, document_type, phone, profile_photo_url, password, last_login, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'diego.morales@tecsup.edu.pe',
            'Diego Alejandro',
            'Morales Quispe',
            '202098765',
            '99887766',
            'DNI',
            '+51943210987',
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
            '$2b$12$LQv3c1yqBWVHjGdqEKLaLOf7sC7PpB.xbQ4cFWWQ7A8ZgOe/EXhbO',
            NOW(),
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;

    -- ESTUDIANTE 3 - Tecsup (Extranjero)
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sofia.ramirez@tecsup.edu.pe') THEN
        INSERT INTO users (id, email, "firstName", "lastName", student_code, document_number, document_type, phone, profile_photo_url, password, last_login, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (
            gen_random_uuid(),
            'sofia.ramirez@tecsup.edu.pe',
            'Sofía Valentina',
            'Ramírez González',
            '202054321',
            'CE001234567',
            'CARNET_EXTRANJERIA',
            '+51932109876',
            'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150',
            '$2b$12$LQv3c1yqBWVHjGdqEKLaLOf7sC7PpB.xbQ4cFWWQ7A8ZgOe/EXhbO',
            NOW(),
            true,
            false,
            'seeder',
            NOW(),
            'seeder',
            NOW()
        );
    END IF;
END $$;

-- 4. Insertar User_Roles (Asignar roles a usuarios)
DO $$
DECLARE
    user_carlos_id UUID;
    user_maria_id UUID;
    user_luis_id UUID;
    user_ana_id UUID;
    user_diego_id UUID;
    user_sofia_id UUID;
    inst_wasirifa_id UUID;
    inst_tecsup_id UUID;
    role_adminsupremo_id UUID;
    role_admin_id UUID;
    role_organizador_id UUID;
    role_estudiante_id UUID;
BEGIN
    -- Obtener IDs
    SELECT id INTO user_carlos_id FROM users WHERE email = 'carlos.rodriguez@wasirifa.digital';
    SELECT id INTO user_maria_id FROM users WHERE email = 'maria.garcia@tecsup.edu.pe';
    SELECT id INTO user_luis_id FROM users WHERE email = 'luis.torres@tecsup.edu.pe';
    SELECT id INTO user_ana_id FROM users WHERE email = 'ana.lopez@tecsup.edu.pe';
    SELECT id INTO user_diego_id FROM users WHERE email = 'diego.morales@tecsup.edu.pe';
    SELECT id INTO user_sofia_id FROM users WHERE email = 'sofia.ramirez@tecsup.edu.pe';
    
    SELECT id INTO inst_wasirifa_id FROM institutions WHERE domain = 'wasirifa.digital';
    SELECT id INTO inst_tecsup_id FROM institutions WHERE domain = 'tecsup.edu.pe';
    
    SELECT id INTO role_adminsupremo_id FROM roles WHERE code = 'ADMINSUPREMO';
    SELECT id INTO role_admin_id FROM roles WHERE code = 'ADMIN';
    SELECT id INTO role_organizador_id FROM roles WHERE code = 'ORGANIZADOR';
    SELECT id INTO role_estudiante_id FROM roles WHERE code = 'ESTUDIANTE';

    -- Carlos - Admin Supremo en WasiRifa
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_carlos_id AND role_id = role_adminsupremo_id) THEN
        INSERT INTO user_roles (id, user_id, role_id, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), user_carlos_id, role_adminsupremo_id, inst_wasirifa_id, true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    -- María - Admin en Tecsup
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_maria_id AND role_id = role_admin_id) THEN
        INSERT INTO user_roles (id, user_id, role_id, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), user_maria_id, role_admin_id, inst_tecsup_id, true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    -- Luis - Organizador en Tecsup
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_luis_id AND role_id = role_organizador_id) THEN
        INSERT INTO user_roles (id, user_id, role_id, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), user_luis_id, role_organizador_id, inst_tecsup_id, true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    -- Ana - Estudiante en Tecsup
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_ana_id AND role_id = role_estudiante_id) THEN
        INSERT INTO user_roles (id, user_id, role_id, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), user_ana_id, role_estudiante_id, inst_tecsup_id, true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    -- Diego - Estudiante en Tecsup
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_diego_id AND role_id = role_estudiante_id) THEN
        INSERT INTO user_roles (id, user_id, role_id, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), user_diego_id, role_estudiante_id, inst_tecsup_id, true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;

    -- Sofía - Estudiante en Tecsup
    IF NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_sofia_id AND role_id = role_estudiante_id) THEN
        INSERT INTO user_roles (id, user_id, role_id, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
        VALUES (gen_random_uuid(), user_sofia_id, role_estudiante_id, inst_tecsup_id, true, false, 'seeder', NOW(), 'seeder', NOW());
    END IF;
END $$;

-- =====================================================
-- RESUMEN DE USUARIOS CREADOS
-- =====================================================
/*
CREDENCIALES DE ACCESO:

🔑 ADMIN SUPREMO (WasiRifa):
   DNI: 12345678
   Contraseña: password123
   Email: carlos.rodriguez@wasirifa.digital

🔑 ADMIN (Tecsup):
   DNI: 87654321
   Contraseña: password123
   Email: maria.garcia@tecsup.edu.pe

🔑 ORGANIZADOR (Tecsup):
   DNI: 11223344
   Contraseña: password123
   Email: luis.torres@tecsup.edu.pe

🔑 ESTUDIANTES (Tecsup):
   DNI: 55667788 | Email: ana.lopez@tecsup.edu.pe
   DNI: 99887766 | Email: diego.morales@tecsup.edu.pe
   DNI: CE001234567 | Email: sofia.ramirez@tecsup.edu.pe
   Contraseña para todos: password123

ENDPOINTS DE PRUEBA:
   POST /api/auth/login
   GET /api/users/search
   PUT /api/users/{id}/profile
   POST /api/file/upload
*/

-- Verificar que los datos se insertaron correctamente
SELECT 
    u.email,
    u."firstName",
    u."lastName", 
    u.document_number,
    r.code as role,
    i.domain as institution
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id  
JOIN institutions i ON ur.institution_id = i.id
WHERE u.deleted = false
ORDER BY r.code, u.email;