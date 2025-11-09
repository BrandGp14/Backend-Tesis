-- =====================================================
-- SEEDERS PARA DEPARTAMENTOS DE TECSUP
-- Insertar los 5 departamentos de la institución TECSUP
-- =====================================================

-- Insertar Departamentos para TECSUP
DO $$
DECLARE
    tecsup_institution_id UUID;
BEGIN
    -- Obtener ID de la institución TECSUP
    SELECT id INTO tecsup_institution_id FROM institutions WHERE domain = 'tecsup.edu.pe';
    
    IF tecsup_institution_id IS NOT NULL THEN
        RAISE NOTICE 'Insertando departamentos para TECSUP (ID: %)', tecsup_institution_id;
        
        -- 1. Departamento de Tecnología Digital
        IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'TD' AND institution_id = tecsup_institution_id) THEN
            INSERT INTO departments (id, code, description, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
            VALUES (gen_random_uuid(), 'TD', 'Tecnología Digital', tecsup_institution_id, true, false, 'seeder', NOW(), 'seeder', NOW());
            RAISE NOTICE 'Departamento "Tecnología Digital" insertado correctamente';
        ELSE
            RAISE NOTICE 'Departamento "Tecnología Digital" ya existe';
        END IF;

        -- 2. Departamento de Mecánica y Aviación
        IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'MA' AND institution_id = tecsup_institution_id) THEN
            INSERT INTO departments (id, code, description, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
            VALUES (gen_random_uuid(), 'MA', 'Mecánica y Aviación', tecsup_institution_id, true, false, 'seeder', NOW(), 'seeder', NOW());
            RAISE NOTICE 'Departamento "Mecánica y Aviación" insertado correctamente';
        ELSE
            RAISE NOTICE 'Departamento "Mecánica y Aviación" ya existe';
        END IF;

        -- 3. Departamento de Minería, Procesos Químicos y Metalúrgicos
        IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'MPQM' AND institution_id = tecsup_institution_id) THEN
            INSERT INTO departments (id, code, description, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
            VALUES (gen_random_uuid(), 'MPQM', 'Minería, Procesos Químicos y Metalúrgicos', tecsup_institution_id, true, false, 'seeder', NOW(), 'seeder', NOW());
            RAISE NOTICE 'Departamento "Minería, Procesos Químicos y Metalúrgicos" insertado correctamente';
        ELSE
            RAISE NOTICE 'Departamento "Minería, Procesos Químicos y Metalúrgicos" ya existe';
        END IF;

        -- 4. Departamento de Electricidad y Electrónica
        IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'EE' AND institution_id = tecsup_institution_id) THEN
            INSERT INTO departments (id, code, description, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
            VALUES (gen_random_uuid(), 'EE', 'Electricidad y Electrónica', tecsup_institution_id, true, false, 'seeder', NOW(), 'seeder', NOW());
            RAISE NOTICE 'Departamento "Electricidad y Electrónica" insertado correctamente';
        ELSE
            RAISE NOTICE 'Departamento "Electricidad y Electrónica" ya existe';
        END IF;

        -- 5. Departamento de Gestión y Producción
        IF NOT EXISTS (SELECT 1 FROM departments WHERE code = 'GP' AND institution_id = tecsup_institution_id) THEN
            INSERT INTO departments (id, code, description, institution_id, enabled, deleted, "createdBy", "createdAt", "updatedBy", "updatedAt")
            VALUES (gen_random_uuid(), 'GP', 'Gestión y Producción', tecsup_institution_id, true, false, 'seeder', NOW(), 'seeder', NOW());
            RAISE NOTICE 'Departamento "Gestión y Producción" insertado correctamente';
        ELSE
            RAISE NOTICE 'Departamento "Gestión y Producción" ya existe';
        END IF;
        
        RAISE NOTICE 'Proceso de inserción de departamentos completado';
    ELSE
        RAISE NOTICE 'No se encontró la institución TECSUP. Ejecute primero el seeder principal.';
    END IF;
END $$;

-- Verificar los departamentos insertados
SELECT 
    d.code,
    d.description,
    d.enabled,
    i.description as institution_name,
    i.domain
FROM departments d
JOIN institutions i ON d.institution_id = i.id
WHERE i.domain = 'tecsup.edu.pe' 
  AND d.deleted = false
ORDER BY d.code;

-- =====================================================
-- RESUMEN DE DEPARTAMENTOS CREADOS PARA TECSUP
-- =====================================================
/*
📚 DEPARTAMENTOS DE TECSUP:

1. TD  - Tecnología Digital
2. MA  - Mecánica y Aviación  
3. MPQM - Minería, Procesos Químicos y Metalúrgicos
4. EE  - Electricidad y Electrónica
5. GP  - Gestión y Producción

🔧 INSTRUCCIONES DE USO:
1. Ejecutar primero el archivo database-seed.sql para crear la institución TECSUP
2. Luego ejecutar este archivo tecsup-departments-seed.sql para agregar los departamentos
3. Los departamentos se relacionarán automáticamente con la institución TECSUP existente

📊 VERIFICACIÓN:
- Cada departamento tiene un código único (TD, MA, MPQM, EE, GP)
- Todos están habilitados (enabled = true)
- Ninguno está marcado como eliminado (deleted = false)
- Todos pertenecen a la institución tecsup.edu.pe
*/