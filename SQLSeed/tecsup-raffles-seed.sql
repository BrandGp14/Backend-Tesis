-- =====================================================
-- SEEDERS PARA RIFAS DE CADA DEPARTAMENTO DE TECSUP
-- Crear una rifa por cada departamento de la institución TECSUP
-- =====================================================

DO $$
DECLARE
    tecsup_institution_id UUID;
    dept_td_id UUID;
    dept_ma_id UUID;
    dept_mpqm_id UUID;
    dept_ee_id UUID;
    dept_gp_id UUID;
    -- Organizadores específicos por departamento
    organizer_td_id UUID := '79d0df85-9705-46ab-bd0a-74959f806b2c'; -- flor.alex@tecsup.edu.pe
    organizer_ma_id UUID := 'cccf20b7-79fd-4688-a843-6221db14b77f'; -- karl@tecsup.edu.pe
    organizer_mpqm_id UUID := '5195f3bb-8993-4042-83d7-005e9e35eb9b'; -- lua@tecsup.edu.pe
    organizer_ee_id UUID := '9d8e5cce-775a-4ff5-af6b-52994bbaa89e'; -- wilder@tecsup.edu.pe
    organizer_gp_id UUID := '465d5c9a-cdd4-47ec-b81e-8f2fbc2eedd1'; -- klaustec@tecsup.edu.pe
    raffle_td_id UUID;
    raffle_ma_id UUID;
    raffle_mpqm_id UUID;
    raffle_ee_id UUID;
    raffle_gp_id UUID;
BEGIN
    -- Obtener ID de la institución TECSUP
    SELECT id INTO tecsup_institution_id FROM institutions WHERE domain = 'tecsup.edu.pe';
    
    IF tecsup_institution_id IS NULL THEN
        RAISE NOTICE 'No se encontró la institución TECSUP. Ejecute primero el seeder principal.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Iniciando creación de rifas para TECSUP (ID: %)', tecsup_institution_id;
    
    -- Usar IDs exactos de los departamentos proporcionados
    dept_td_id := 'a610d0cf-e519-4563-a4c7-1083f2724374';   -- TD - Tecnología Digital
    dept_ma_id := '8172de83-2be9-4a15-a51a-a89c1d2fc29c';   -- MA - Mecánica y Aviación  
    dept_mpqm_id := '7dee0193-cee4-43be-8853-8a54c7b85969'; -- MPQM - Minería, Procesos Químicos y Metalúrgicos
    dept_ee_id := '11ac063e-9a7b-4bc4-9d95-f8ddd4bd3586';   -- EE - Electricidad y Electrónica
    dept_gp_id := 'c0af3a10-6817-4d98-bbaf-863c034432e0';   -- GP - Gestión y Producción
    
    RAISE NOTICE 'Usando departamentos específicos de TECSUP con sus organizadores asignados';
    RAISE NOTICE 'TD: % → Organizador: flor.alex@tecsup.edu.pe (%)', dept_td_id, organizer_td_id;
    RAISE NOTICE 'MA: % → Organizador: karl@tecsup.edu.pe (%)', dept_ma_id, organizer_ma_id;
    RAISE NOTICE 'MPQM: % → Organizador: lua@tecsup.edu.pe (%)', dept_mpqm_id, organizer_mpqm_id;
    RAISE NOTICE 'EE: % → Organizador: wilder@tecsup.edu.pe (%)', dept_ee_id, organizer_ee_id;
    RAISE NOTICE 'GP: % → Organizador: klaustec@tecsup.edu.pe (%)', dept_gp_id, organizer_gp_id;

    -- 1. RIFA PARA TECNOLOGÍA DIGITAL
    raffle_td_id := gen_random_uuid();
    IF NOT EXISTS (SELECT 1 FROM raffles WHERE title = 'Rifa Tech Digital - Mega Sorteo' AND institution_department_id = dept_td_id) THEN
        INSERT INTO raffles (
            id, title, description, "currencyCode", "currencySymbol", "awardDescription", 
            price, available, sold, "assignedPerUser", "startDate", "endDate", 
            "allowExternalParticipants", "drawDate", status, institution_id, 
            institution_department_id, organizer_id, enabled, deleted, 
            "createdBy", "createdAt", "updatedBy", "updatedAt"
        ) VALUES (
            raffle_td_id,
            'Rifa Tech Digital - Mega Sorteo',
            'Participa en nuestra rifa del Departamento de Tecnología Digital y gana increíbles premios tecnológicos: 1er Premio - Laptop Gaming ASUS ROG, 2do Premio - iPhone 15 Pro, 3er Premio - Auriculares Gaming Profesional.',
            'PEN', 'S/.',
            '1er Premio: Laptop Gaming ASUS ROG | 2do Premio: iPhone 15 Pro | 3er Premio: Auriculares Gaming HyperX',
            15.00, 1000, 0, NULL,
            NOW() + INTERVAL '1 day',
            NOW() + INTERVAL '30 days',
            true,
            NOW() + INTERVAL '32 days',
            '10',
            tecsup_institution_id,
            dept_td_id,
            organizer_td_id,
            true, false,
            organizer_td_id, NOW(), organizer_td_id, NOW()
        );
        RAISE NOTICE 'Rifa de Tecnología Digital creada correctamente (ID: %)', raffle_td_id;
    ELSE
        RAISE NOTICE 'Rifa de Tecnología Digital ya existe';
    END IF;

    -- 2. RIFA PARA MECÁNICA Y AVIACIÓN
    raffle_ma_id := gen_random_uuid();
    IF NOT EXISTS (SELECT 1 FROM raffles WHERE title = 'Rifa Mecánica - Mega Sorteo' AND institution_department_id = dept_ma_id) THEN
        INSERT INTO raffles (
            id, title, description, "currencyCode", "currencySymbol", "awardDescription", 
            price, available, sold, "assignedPerUser", "startDate", "endDate", 
            "allowExternalParticipants", "drawDate", status, institution_id, 
            institution_department_id, organizer_id, enabled, deleted, 
            "createdBy", "createdAt", "updatedBy", "updatedAt"
        ) VALUES (
            raffle_ma_id,
            'Rifa Mecánica - Mega Sorteo',
            'El Departamento de Mecánica y Aviación te ofrece la oportunidad de ganar increíbles premios: 1er Premio - Kit Herramientas Snap-on Profesional, 2do Premio - Drone DJI Mavic Air 2, 3er Premio - Multímetro Fluke Industrial.',
            'PEN', 'S/.',
            '1er Premio: Kit Herramientas Snap-on | 2do Premio: Drone DJI Mavic Air 2 | 3er Premio: Multímetro Fluke 87V',
            12.00, 1000, 0, NULL,
            NOW() + INTERVAL '2 days',
            NOW() + INTERVAL '25 days',
            true,
            NOW() + INTERVAL '27 days',
            '10',
            tecsup_institution_id,
            dept_ma_id,
            organizer_ma_id,
            true, false,
            organizer_ma_id, NOW(), organizer_ma_id, NOW()
        );
        RAISE NOTICE 'Rifa de Mecánica y Aviación creada correctamente (ID: %)', raffle_ma_id;
    ELSE
        RAISE NOTICE 'Rifa de Mecánica y Aviación ya existe';
    END IF;

    -- 3. RIFA PARA MINERÍA, PROCESOS QUÍMICOS Y METALÚRGICOS
    raffle_mpqm_id := gen_random_uuid();
    IF NOT EXISTS (SELECT 1 FROM raffles WHERE title = 'Rifa Minería - Mega Sorteo' AND institution_department_id = dept_mpqm_id) THEN
        INSERT INTO raffles (
            id, title, description, "currencyCode", "currencySymbol", "awardDescription", 
            price, available, sold, "assignedPerUser", "startDate", "endDate", 
            "allowExternalParticipants", "drawDate", status, institution_id, 
            institution_department_id, organizer_id, enabled, deleted, 
            "createdBy", "createdAt", "updatedBy", "updatedAt"
        ) VALUES (
            raffle_mpqm_id,
            'Rifa Minería - Mega Sorteo',
            'Participa en la rifa del Departamento de Minería, Procesos Químicos y Metalúrgicos. Gana increíbles premios: 1er Premio - Kit Seguridad Minera Premium, 2do Premio - Analizador de Gases Portátil, 3er Premio - Casco Inteligente con Comunicación.',
            'PEN', 'S/.',
            '1er Premio: Kit Seguridad Minera Premium | 2do Premio: Analizador de Gases Drager | 3er Premio: Casco Inteligente MSA',
            20.00, 1000, 0, NULL,
            NOW() + INTERVAL '3 days',
            NOW() + INTERVAL '28 days',
            false,
            NOW() + INTERVAL '30 days',
            '10',
            tecsup_institution_id,
            dept_mpqm_id,
            organizer_mpqm_id,
            true, false,
            organizer_mpqm_id, NOW(), organizer_mpqm_id, NOW()
        );
        RAISE NOTICE 'Rifa de Minería, Procesos Químicos y Metalúrgicos creada correctamente (ID: %)', raffle_mpqm_id;
    ELSE
        RAISE NOTICE 'Rifa de Minería, Procesos Químicos y Metalúrgicos ya existe';
    END IF;

    -- 4. RIFA PARA ELECTRICIDAD Y ELECTRÓNICA
    raffle_ee_id := gen_random_uuid();
    IF NOT EXISTS (SELECT 1 FROM raffles WHERE title = 'Rifa Electrónica - Mega Sorteo' AND institution_department_id = dept_ee_id) THEN
        INSERT INTO raffles (
            id, title, description, "currencyCode", "currencySymbol", "awardDescription", 
            price, available, sold, "assignedPerUser", "startDate", "endDate", 
            "allowExternalParticipants", "drawDate", status, institution_id, 
            institution_department_id, organizer_id, enabled, deleted, 
            "createdBy", "createdAt", "updatedBy", "updatedAt"
        ) VALUES (
            raffle_ee_id,
            'Rifa Electrónica - Mega Sorteo',
            'El Departamento de Electricidad y Electrónica te da la oportunidad de ganar increíbles premios: 1er Premio - Estación de Soldadura JBC Digital, 2do Premio - Osciloscopio Digital Rigol, 3er Premio - Kit Arduino con Sensores.',
            'PEN', 'S/.',
            '1er Premio: Estación Soldadura JBC | 2do Premio: Osciloscopio Rigol DS1054Z | 3er Premio: Kit Arduino Mega',
            10.00, 1000, 0, NULL,
            NOW() + INTERVAL '1 day',
            NOW() + INTERVAL '35 days',
            true,
            NOW() + INTERVAL '37 days',
            '10',
            tecsup_institution_id,
            dept_ee_id,
            organizer_ee_id,
            true, false,
            organizer_ee_id, NOW(), organizer_ee_id, NOW()
        );
        RAISE NOTICE 'Rifa de Electricidad y Electrónica creada correctamente (ID: %)', raffle_ee_id;
    ELSE
        RAISE NOTICE 'Rifa de Electricidad y Electrónica ya existe';
    END IF;

    -- 5. RIFA PARA GESTIÓN Y PRODUCCIÓN
    raffle_gp_id := gen_random_uuid();
    IF NOT EXISTS (SELECT 1 FROM raffles WHERE title = 'Rifa Gestión - Mega Sorteo' AND institution_department_id = dept_gp_id) THEN
        INSERT INTO raffles (
            id, title, description, "currencyCode", "currencySymbol", "awardDescription", 
            price, available, sold, "assignedPerUser", "startDate", "endDate", 
            "allowExternalParticipants", "drawDate", status, institution_id, 
            institution_department_id, organizer_id, enabled, deleted, 
            "createdBy", "createdAt", "updatedBy", "updatedAt"
        ) VALUES (
            raffle_gp_id,
            'Rifa Gestión - Mega Sorteo',
            'Participa en la rifa del Departamento de Gestión y Producción. Gana increíbles premios: 1er Premio - Samsung Galaxy Tab S8+ con accesorios, 2do Premio - Impresora 3D Ender, 3er Premio - Proyector Portátil 4K.',
            'PEN', 'S/.',
            '1er Premio: Samsung Galaxy Tab S8+ | 2do Premio: Impresora 3D Ender 3 V2 | 3er Premio: Proyector XGIMI MoGo 2',
            8.00, 1000, 0, NULL,
            NOW() + INTERVAL '4 days',
            NOW() + INTERVAL '40 days',
            true,
            NOW() + INTERVAL '42 days',
            '10',
            tecsup_institution_id,
            dept_gp_id,
            organizer_gp_id,
            true, false,
            organizer_gp_id, NOW(), organizer_gp_id, NOW()
        );
        RAISE NOTICE 'Rifa de Gestión y Producción creada correctamente (ID: %)', raffle_gp_id;
    ELSE
        RAISE NOTICE 'Rifa de Gestión y Producción ya existe';
    END IF;

    -- CREAR SERIES DE RIFAS
    RAISE NOTICE 'Creando series de rifas...';
    
    -- Series para cada rifa
    INSERT INTO raffle_series (id, prefix, correlative, size, raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'TD', 0, 1000, raffle_td_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_series WHERE raffle_id = raffle_td_id);
    
    INSERT INTO raffle_series (id, prefix, correlative, size, raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'MA', 0, 1000, raffle_ma_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_series WHERE raffle_id = raffle_ma_id);
    
    INSERT INTO raffle_series (id, prefix, correlative, size, raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'MQ', 0, 1000, raffle_mpqm_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_series WHERE raffle_id = raffle_mpqm_id);
    
    INSERT INTO raffle_series (id, prefix, correlative, size, raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'EE', 0, 1000, raffle_ee_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_series WHERE raffle_id = raffle_ee_id);
    
    INSERT INTO raffle_series (id, prefix, correlative, size, raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'GP', 0, 1000, raffle_gp_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_series WHERE raffle_id = raffle_gp_id);

    -- CREAR IMÁGENES DE LAS RIFAS
    RAISE NOTICE 'Creando imágenes de rifas...';
    
    -- Imágenes para Rifa de Tecnología Digital (3 premios)
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', 1, raffle_td_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_td_id AND "displayOrder" = 1);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800', 2, raffle_td_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_td_id AND "displayOrder" = 2);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800', 3, raffle_td_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_td_id AND "displayOrder" = 3);

    -- Imágenes para Rifa de Mecánica y Aviación (3 premios)
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1530368091829-7e939ce7e7f8?w=800', 1, raffle_ma_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_ma_id AND "displayOrder" = 1);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800', 2, raffle_ma_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_ma_id AND "displayOrder" = 2);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800', 3, raffle_ma_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_ma_id AND "displayOrder" = 3);

    -- Imágenes para Rifa de Minería (3 premios)
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800', 1, raffle_mpqm_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_mpqm_id AND "displayOrder" = 1);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800', 2, raffle_mpqm_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_mpqm_id AND "displayOrder" = 2);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800', 3, raffle_mpqm_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_mpqm_id AND "displayOrder" = 3);

    -- Imágenes para Rifa de Electricidad y Electrónica (3 premios)
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1581092582731-88e7ac74da6c?w=800', 1, raffle_ee_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_ee_id AND "displayOrder" = 1);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800', 2, raffle_ee_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_ee_id AND "displayOrder" = 2);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800', 3, raffle_ee_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_ee_id AND "displayOrder" = 3);

    -- Imágenes para Rifa de Gestión y Producción (3 premios)
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800', 1, raffle_gp_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_gp_id AND "displayOrder" = 1);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800', 2, raffle_gp_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_gp_id AND "displayOrder" = 2);
    
    INSERT INTO raffle_images (id, "imageUrl", "displayOrder", raffle_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
    SELECT 
        gen_random_uuid(), 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', 3, raffle_gp_id, true, false, 'system', NOW(), 'system', NOW()
    WHERE NOT EXISTS (SELECT 1 FROM raffle_images WHERE raffle_id = raffle_gp_id AND "displayOrder" = 3);

    RAISE NOTICE 'Proceso de inserción de rifas completado exitosamente';
    RAISE NOTICE 'Se crearon 5 rifas, una para cada departamento de TECSUP';
    RAISE NOTICE 'Cada rifa incluye imágenes y series configuradas';

END $$;

-- Verificar las rifas creadas
SELECT 
    r.title,
    r.price,
    r.available,
    r."startDate",
    r."endDate",
    d.code as dept_code,
    d.description as department,
    i.description as institution,
    (SELECT COUNT(*) FROM raffle_images ri WHERE ri.raffle_id = r.id AND ri.deleted = false) as image_count
FROM raffles r
JOIN departments d ON r.institution_department_id = d.id
JOIN institutions i ON r.institution_id = i.id
WHERE i.domain = 'tecsup.edu.pe' 
  AND r.deleted = false
ORDER BY d.code;

-- =====================================================
-- RESUMEN DE RIFAS CREADAS PARA TECSUP
-- =====================================================
/*
🎯 RIFAS CREADAS POR DEPARTAMENTO (MEGA SORTEOS):

1. TD (Tecnología Digital) - S/. 15.00
   🏆 1er Premio: Laptop Gaming ASUS ROG
   🥈 2do Premio: iPhone 15 Pro
   🥉 3er Premio: Auriculares Gaming HyperX
   🎟️ 1000 números disponibles - Sin límite por usuario

2. MA (Mecánica y Aviación) - S/. 12.00
   🏆 1er Premio: Kit Herramientas Snap-on
   🥈 2do Premio: Drone DJI Mavic Air 2
   🥉 3er Premio: Multímetro Fluke 87V
   🎟️ 1000 números disponibles - Sin límite por usuario

3. MPQM (Minería, Procesos Químicos y Metalúrgicos) - S/. 20.00
   🏆 1er Premio: Kit Seguridad Minera Premium
   🥈 2do Premio: Analizador de Gases Drager
   🥉 3er Premio: Casco Inteligente MSA
   🎟️ 1000 números disponibles - Solo estudiantes internos

4. EE (Electricidad y Electrónica) - S/. 10.00
   🏆 1er Premio: Estación Soldadura JBC
   🥈 2do Premio: Osciloscopio Rigol DS1054Z
   🥉 3er Premio: Kit Arduino Mega
   🎟️ 1000 números disponibles - Sin límite por usuario

5. GP (Gestión y Producción) - S/. 8.00
   🏆 1er Premio: Samsung Galaxy Tab S8+
   🥈 2do Premio: Impresora 3D Ender 3 V2
   🥉 3er Premio: Proyector XGIMI MoGo 2
   🎟️ 1000 números disponibles - Sin límite por usuario

🔧 CARACTERÍSTICAS:
- Cada rifa tiene 3 premios con 3 imágenes cada una
- 1000 números disponibles por rifa
- Sin límite de compra por usuario
- Series configuradas con prefijos departamentales
- Fechas escalonadas de inicio (1-4 días)
- Sorteos programados después del cierre
- Todas las rifas están habilitadas y activas

📊 INSTRUCCIONES:
1. Ejecutar después de database-seed.sql y tecsup-departments-seed.sql
2. Los organizadores están asignados específicamente por departamento:
   • TD: flor.alex@tecsup.edu.pe (79d0df85-9705-46ab-bd0a-74959f806b2c)
   • MA: karl@tecsup.edu.pe (cccf20b7-79fd-4688-a843-6221db14b77f)
   • MPQM: lua@tecsup.edu.pe (5195f3bb-8993-4042-83d7-005e9e35eb9b)
   • EE: wilder@tecsup.edu.pe (9d8e5cce-775a-4ff5-af6b-52994bbaa89e)
   • GP: klaustec@tecsup.edu.pe (465d5c9a-cdd4-47ec-b81e-8f2fbc2eedd1)
3. Las imágenes son URLs de Unsplash (pueden cambiar)
4. Cada rifa sortea 3 ganadores diferentes
5. Cada rifa solo puede ser administrada por su organizador departamental
*/