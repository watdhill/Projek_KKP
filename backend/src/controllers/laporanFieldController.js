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

        res.json({
            success: true,
            data: tree
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error mengambil field laporan',
            error: error.message
        });
    }
};
