// Export All Formats as PDF (Single Document with Sections)
exports.exportPDFAll = async (req, res) => {
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

        // Get filtered data once (same for all formats)
        const data = await getFilteredData(filters);

        // Create PDF with landscape A3
        const doc = new PDFDocument({
            size: 'A3',
            layout: 'landscape',
            margin: 30
        });

        // Build filename
        let filenameParts = ['Semua_Format_Laporan'];
        if (tahun && tahun !== 'all') filenameParts.push(tahun);
        if (status && status !== 'all') filenameParts.push('Status' + status);

        const filename = `${filenameParts.join('_')}_${new Date().toISOString().split('T')[0]}.pdf`;

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        doc.pipe(res);

        // Add cover page
        doc.fontSize(20).font('Helvetica-Bold').text('LAPORAN APLIKASI', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).font('Helvetica').text('Semua Format Laporan', { align: 'center' });
        doc.fontSize(10).text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, { align: 'center' });
        doc.fontSize(10).text(`Total Aplikasi: ${data.length}`, { align: 'center' });
        doc.moveDown(2);

        // Add filter info if applied
        if (tahun && tahun !== 'all') {
            doc.fontSize(9).text(`Filter Tahun: ${tahun}`, { align: 'center' });
        }
        if (status && status !== 'all') {
            doc.fontSize(9).text(`Filter Status: ${status}`, { align: 'center' });
        }

        // Render each format
        for (let i = 0; i < formats.length; i++) {
            const format = formats[i];

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

            // Add new page for this format (except first)
            if (i > 0 || doc.y > 100) {
                doc.addPage();
            }

            // Add format title
            doc.fontSize(16).font('Helvetica-Bold').text(format.nama_format, { align: 'center' });
            doc.moveDown(0.5);

            // Build hierarchical structure
            const structure = await buildHierarchyFromMasterField(formatDetails);

            // Render PDF table for this format
            await renderPDFTableSection(doc, structure, data);
        }

        doc.end();

    } catch (error) {
        console.error('PDF Export All Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error export PDF semua format',
            error: error.message
        });
    }
};

// Helper: Render PDF table section (extracted from exportPDF)
async function renderPDFTableSection(doc, structure, data) {
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const startX = doc.page.margins.left;
    let startY = doc.y;

    // Count total columns and build mapping
    let totalColumns = 0;
    const columnMapping = [];

    structure.forEach(item => {
        if (item.type === 'field') {
            totalColumns++;
            columnMapping.push({ fieldName: item.fieldName, label: item.label });
        } else if (item.type === 'group') {
            if (item.subGroups.size > 0) {
                item.subGroups.forEach(fields => {
                    totalColumns += fields.length;
                    fields.forEach(f => columnMapping.push({ fieldName: f.fieldName, label: f.label }));
                });
            } else {
                totalColumns += item.fields.length;
                item.fields.forEach(f => columnMapping.push({ fieldName: f.fieldName, label: f.label }));
            }
        }
    });

    const columnWidth = pageWidth / totalColumns;
    const rowHeight = 18;
    const fontSize = 7;

    // Determine header rows
    let hasJudul = false;
    let hasSubJudul = false;

    structure.forEach(item => {
        if (item.type === 'group') {
            hasJudul = true;
            if (item.subGroups.size > 0) hasSubJudul = true;
        }
    });

    const headerRows = hasJudul ? (hasSubJudul ? 3 : 2) : 1;

    // Helper function to draw cell
    const drawCell = (x, y, width, height, text, options = {}) => {
        const { fill = false, align = 'center', fontSize: fs = fontSize } = options;

        doc.rect(x, y, width, height).stroke();

        if (fill) {
            doc.rect(x, y, width, height).fillAndStroke('#e0e0e0', '#000000');
        }

        doc.fontSize(fs).fillColor('#000000');
        const textY = y + (height - fs) / 2;
        doc.text(text || '-', x + 2, textY, {
            width: width - 4,
            height: height,
            align: align,
            ellipsis: true
        });
    };

    // Render headers (same logic as exportPDF)
    doc.fontSize(fontSize).font('Helvetica-Bold');

    if (hasJudul) {
        let x = startX;
        structure.forEach(item => {
            if (item.type === 'field') {
                const height = rowHeight * headerRows;
                drawCell(x, startY, columnWidth, height, item.label, { fill: true });
                x += columnWidth;
            } else if (item.type === 'group') {
                let colSpan = 0;
                if (item.subGroups.size > 0) {
                    item.subGroups.forEach(fields => colSpan += fields.length);
                } else {
                    colSpan = item.fields.length;
                }

                const width = columnWidth * colSpan;
                drawCell(x, startY, width, rowHeight, item.judul, { fill: true });
                x += width;
            }
        });
    }

    if (hasSubJudul) {
        let x = startX;
        const y = startY + rowHeight;

        structure.forEach(item => {
            if (item.type === 'field') {
                x += columnWidth;
            } else if (item.type === 'group') {
                if (item.subGroups.size > 0) {
                    item.subGroups.forEach((fields, subJudul) => {
                        const width = columnWidth * fields.length;
                        drawCell(x, y, width, rowHeight, subJudul, { fill: true });
                        x += width;
                    });
                } else {
                    const width = columnWidth * item.fields.length;
                    x += width;
                }
            }
        });
    }

    const fieldY = startY + (rowHeight * (headerRows - 1));
    let x = startX;

    columnMapping.forEach(col => {
        drawCell(x, fieldY, columnWidth, rowHeight, col.label, { fill: true });
        x += columnWidth;
    });

    // Render data rows
    startY = fieldY + rowHeight;
    doc.font('Helvetica');

    data.forEach((row, index) => {
        if (startY + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            startY = doc.page.margins.top;

            // Re-render headers on new page
            x = startX;
            doc.font('Helvetica-Bold');
            columnMapping.forEach(col => {
                drawCell(x, startY, columnWidth, rowHeight, col.label, { fill: true });
                x += columnWidth;
            });
            startY += rowHeight;
            doc.font('Helvetica');
        }

        x = startX;
        columnMapping.forEach(col => {
            const value = col.fieldName ? (row[col.fieldName] || '-') : '-';
            drawCell(x, startY, columnWidth, rowHeight, String(value), { align: 'left' });
            x += columnWidth;
        });

        startY += rowHeight;
    });
}
