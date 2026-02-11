const pool = require('../config/database');

exports.getHierarchicalFields = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM master_laporan_field WHERE is_active = 1 ORDER BY level, urutan');

        // Group by parent_id to build tree
        const fieldsMap = {};
        const tree = [];

        rows.forEach(row => {
            fieldsMap[row.field_id] = {
                ...row,
                children: []
            };
        });

        rows.forEach(row => {
            if (row.parent_id === null) {
                tree.push(fieldsMap[row.field_id]);
            } else if (fieldsMap[row.parent_id]) {
                fieldsMap[row.parent_id].children.push(fieldsMap[row.field_id]);
            }
        });

        // ---------------------------------------------------------
        // DYNAMIC MASTER DATA INTEGRATION (FLATTENED)
        // ---------------------------------------------------------
        // Fetch all dynamic master tables from registry
        const [dynamicTables] = await pool.query('SELECT * FROM master_table_registry WHERE status_aktif = 1');

        if (dynamicTables.length > 0) {
            // Map each dynamic table directly to a selectable field (Level 3, no parent)
            dynamicTables.forEach((table, index) => {
                const tableFieldId = 10000 + table.registry_id;
                fieldsMap[tableFieldId] = {
                    field_id: tableFieldId,
                    nama_field: table.display_name,
                    kode_field: `${table.table_name}_id`,
                    parent_id: null, // Flat structure
                    level: 3,
                    urutan: 100 + index,
                    children: []
                };
                tree.push(fieldsMap[tableFieldId]);
            });
        }
        // ---------------------------------------------------------

        // ---------------------------------------------------------
        // REORDER: Flat fields (no children) first, then hierarchical (with children)
        // ---------------------------------------------------------
        const flatFields = tree.filter(node => !node.children || node.children.length === 0);
        const hierarchicalFields = tree.filter(node => node.children && node.children.length > 0);

        // Sort flat fields alphabetically for cleaner display
        flatFields.sort((a, b) => a.urutan - b.urutan);
        hierarchicalFields.sort((a, b) => a.urutan - b.urutan);

        const sortedTree = [...flatFields, ...hierarchicalFields];
        // ---------------------------------------------------------

        res.json({
            success: true,
            data: sortedTree
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mengambil field laporan',
            error: error.message
        });
    }
};
