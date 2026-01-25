// NEW EXPORT EXCEL FUNCTION WITH HIERARCHICAL HEADERS
// This will replace the existing exportExcel function

exports.exportExcel = async (req, res) => {
    try {
        const { format_laporan_id, tahun, status, eselon1_id, eselon2_id } = req.query;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'KKP System';
        workbook.created = new Date();

        // Check if "all formats" is selected
        const isAllFormats = format_laporan_id === 'all';

        let formats = [];
        if (isAllFormats) {
            // Get all active formats
            const [allFormats] = await pool.query(`
        SELECT DISTINCT format_laporan_id, nama_format
        FROM format_laporan
        WHERE status_aktif = 1
        ORDER BY nama_format
      `);
            formats = allFormats;
        } else if (format_laporan_id) {
            // Get single format
            const [singleFormat] = await pool.query(`
        SELECT format_laporan_id, nama_format
        FROM format_laporan
        WHERE format_laporan_id = ?
      `, [format_laporan_id]);
            formats = singleFormat;
        }

        // If no format specified, use default columns
        if (formats.length === 0) {
            await createDefaultSheet(workbook, { tahun, status, eselon1_id, eselon2_id });
        } else {
            // Create sheet for each format
            for (const format of formats) {
                await createFormatSheet(workbook, format, { tahun, status, eselon1_id, eselon2_id });
            }
        }

        // Generate Excel file
        const buffer = await workbook.xlsx.writeBuffer();

        const filename = isAllFormats
            ? `Laporan_Semua_Format_${new Date().toISOString().split('T')[0]}.xlsx`
            : `Laporan_${formats[0]?.nama_format || 'Aplikasi'}_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);

    } catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating Excel file',
            error: error.message
        });
    }
};

// Helper: Create sheet with default columns
async function createDefaultSheet(workbook, filters) {
    const worksheet = workbook.addWorksheet('Laporan Aplikasi');

    // Default columns
    worksheet.columns = [
        { header: 'No', key: 'no', width: 5 },
        { header: 'Nama Aplikasi', key: 'nama_aplikasi', width: 30 },
        { header: 'Unit', key: 'unit', width: 15 },
        { header: 'PIC', key: 'pic', width: 20 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Tahun', key: 'tahun', width: 10 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

    // Get data
    const data = await getFilteredData(filters);

    // Add rows
    data.forEach((row, index) => {
        worksheet.addRow({
            no: index + 1,
            nama_aplikasi: row.nama_aplikasi,
            unit: row.unit,
            pic: row.pic,
            status: row.status_aplikasi,
            tahun: row.tahun_pengembangan
        });
    });
}

// Helper: Create sheet for specific format with hierarchical headers
async function createFormatSheet(workbook, format, filters) {
    const worksheet = workbook.addWorksheet(format.nama_format.substring(0, 31)); // Excel sheet name limit

    // Get format details
    const formatDetails = await getFormatDetails(format.format_laporan_id);

    if (formatDetails.length === 0) {
        // No format details, use default
        return createDefaultSheet(workbook, filters);
    }

    // Build hierarchical structure
    const structure = buildHierarchicalStructure(formatDetails);

    // Calculate column positions and create headers
    let currentCol = 1;
    const columnMapping = []; // Maps field_name to column index

    // Row 1: Judul (if exists)
    // Row 2: Sub-Judul (if exists)
    // Row 3: Field labels

    let hasJudul = false;
    let hasSubJudul = false;

    // Check if we need hierarchical headers
    structure.forEach(item => {
        if (item.type === 'group') {
            hasJudul = true;
            if (item.subGroups.size > 0) {
                hasSubJudul = true;
            }
        }
    });

    const headerStartRow = hasJudul ? (hasSubJudul ? 3 : 2) : 1;
    let currentRow = 1;

    // Build headers
    structure.forEach(item => {
        if (item.type === 'field') {
            // Standalone field
            const col = currentCol++;
            worksheet.getCell(headerStartRow, col).value = item.label;
            columnMapping.push({ fieldName: item.fieldName, col });

            // Merge cells if needed
            if (hasJudul) {
                worksheet.mergeCells(1, col, headerStartRow, col);
            }
        } else if (item.type === 'group') {
            // Group with judul
            const startCol = currentCol;
            let groupColCount = 0;

            if (item.subGroups.size > 0) {
                // Has sub-groups
                item.subGroups.forEach((fields, subJudul) => {
                    const subStartCol = currentCol;
                    fields.forEach(field => {
                        const col = currentCol++;
                        worksheet.getCell(headerStartRow, col).value = field.label;
                        columnMapping.push({ fieldName: field.fieldName, col });
                        groupColCount++;
                    });

                    // Sub-judul header (row 2)
                    if (hasSubJudul && currentCol > subStartCol) {
                        worksheet.mergeCells(2, subStartCol, 2, currentCol - 1);
                        worksheet.getCell(2, subStartCol).value = subJudul;
                    }
                });
            } else {
                // No sub-groups, just fields
                item.fields.forEach(field => {
                    const col = currentCol++;
                    worksheet.getCell(headerStartRow, col).value = field.label;
                    columnMapping.push({ fieldName: field.fieldName, col });
                    groupColCount++;
                });
            }

            // Judul header (row 1)
            if (groupColCount > 0) {
                worksheet.mergeCells(1, startCol, 1, currentCol - 1);
                worksheet.getCell(1, startCol).value = item.judul;
            }
        }
    });

    // Style headers
    for (let row = 1; row <= headerStartRow; row++) {
        worksheet.getRow(row).font = { bold: true };
        worksheet.getRow(row).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: row === 1 ? 'FF4472C4' : 'FF8EAADB' }
        };
        worksheet.getRow(row).font = { color: { argb: 'FFFFFFFF' }, bold: true };
        worksheet.getRow(row).alignment = { horizontal: 'center', vertical: 'middle' };
    }

    // Get data
    const data = await getFilteredData(filters);

    // Add data rows
    data.forEach((rowData, index) => {
        const row = worksheet.getRow(headerStartRow + index + 1);
        columnMapping.forEach(({ fieldName, col }) => {
            row.getCell(col).value = rowData[fieldName] || '-';
        });
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
        column.width = 15;
    });
}

// Helper: Get filtered data
async function getFilteredData(filters) {
    const { tahun, status, eselon1_id, eselon2_id } = filters;

    let query = `
    SELECT 
      da.*,
      e1.singkatan as unit,
      sa.nama_status as status_aplikasi,
      YEAR(COALESCE(da.updated_at, da.created_at)) as tahun_pengembangan
    FROM data_aplikasi da
    LEFT JOIN master_eselon1 e1 ON da.eselon1_id = e1.eselon1_id
    LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
    WHERE 1=1
  `;

    const params = [];

    if (tahun && tahun !== 'all') {
        query += ' AND YEAR(COALESCE(da.updated_at, da.created_at)) = ?';
        params.push(tahun);
    }

    if (status && status !== 'all') {
        query += ' AND da.status_aplikasi = ?';
        params.push(status);
    }

    if (eselon1_id && eselon1_id !== 'all') {
        query += ' AND da.eselon1_id = ?';
        params.push(eselon1_id);
    }

    if (eselon2_id && eselon2_id !== 'all') {
        query += ' AND da.eselon2_id = ?';
        params.push(eselon2_id);
    }

    query += ' ORDER BY da.nama_aplikasi';

    const [rows] = await pool.query(query, params);
    return rows;
}
