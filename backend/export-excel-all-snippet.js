// Export All Formats as Excel (Multiple Sheets)
exports.exportExcelAll = async (req, res) => {
    try {
        const { tahun, status, eselon1_id, eselon2_id } = req.query;
        const filters = { tahun, status, eselon1_id, eselon2_id };

        // Fetch all active formats
        const [formats] = await pool.query(`
      SELECT format_laporan_id, nama_format 
      FROM format_laporan 
      WHERE status_aktif = 1
      ORDER BY nama_format
    `);

        if (formats.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Tidak ada format laporan aktif'
            });
        }

        const workbook = new ExcelJS.Workbook();

        // Create worksheet for each format
        for (const format of formats) {
            // Get format details
            const [formatDetails] = await pool.query(`
        SELECT field_id 
        FROM format_laporan_detail 
        WHERE format_laporan_id = ?
      `, [format.format_laporan_id]);

            if (formatDetails.length === 0) {
                console.log(`Skipping format ${format.nama_format} - no fields defined`);
                continue;
            }

            // Create sheet with hierarchical structure
            const sheetName = format.nama_format.substring(0, 31); // Excel sheet name max 31 chars
            await createSheetWithHierarchy(workbook, sheetName, formatDetails, filters);
        }

        // If no sheets created, create default sheet
        if (workbook.worksheets.length === 0) {
            await createDefaultSheet(workbook, filters);
        }

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Build filename with filters
        let filenameParts = ['Semua_Format_Laporan'];
        if (tahun && tahun !== 'all') filenameParts.push(tahun);
        if (status && status !== 'all') filenameParts.push('Status' + status);
        if (eselon1_id && eselon1_id !== 'all') filenameParts.push('Eselon1_' + eselon1_id);

        const filename = `${filenameParts.join('_')}_${new Date().toISOString().split('T')[0]}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);

    } catch (error) {
        console.error('Export Excel All error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating Excel file with all formats',
            error: error.message
        });
    }
};
