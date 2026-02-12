
/**
 * Map format field code to actual data_aplikasi_archive column name
 * Handles discrepancies between format definition and archive table schema
 */
function mapFieldToColumn(kodeField, fieldName) {
  // Normalize input
  const code = (kodeField || "").toLowerCase();
  const name = (fieldName || "").toLowerCase();

  // Direct mapping based on known columns in data_aplikasi_archive
  const columnMap = {
    // Basic Info
    'nama_aplikasi': 'nama_aplikasi',
    'status': 'status',
    'status_aplikasi': 'status',
    'deskripsi_fungsi': 'deskripsi_fungsi',
    'deskripsi': 'deskripsi_fungsi', // Alias
    
    // Ownership / Unit
    'eselon1_id': 'eselon1_id',
    'eselon2_id': 'eselon2_id',
    'upt_id': 'upt_id',
    'unit_pemilik': 'eselon1_id', // Assume unit pemilik maps to eselon1_id for now or requires join
    
    // Technical
    'domain': 'domain_aplikasi',
    'domain_aplikasi': 'domain_aplikasi',
    'url': 'domain_aplikasi',
    'basis_data': 'database_aplikasi',
    'database': 'database_aplikasi',
    'bahasa_pemrograman': 'bahasa_pemrograman', // If exists? Check schema
    
    // Infrastructure
    'pdn': 'pdn_backup', // Fallback if pdn_utama missing
    'pdn_utama': 'pdn_backup', // Fallback
    'pdn_backup': 'pdn_backup',
    'pusat_komputasi': 'penyedia_hosting', // Best guess
    'pusat_komputasi_utama': 'penyedia_hosting', 
    'hosting': 'penyedia_hosting',
    
    // Security
    'ssl': 'sertifikat_ssl',
    'sertifikat_ssl': 'sertifikat_ssl',
    'ssl_expired': 'ssl_expired_date',
    'expired_ssl': 'ssl_expired_date',
    'waf': 'waf_lainnya',
    'waf_lainnya': 'waf_lainnya',
    'antivirus': 'keamanan_aplikasi', // Suggestion
    'keamanan': 'keamanan_aplikasi',
    
    // Contacts
    'pic_internal': 'pic_internal',
    'pic_eksternal': 'pic_eksternal',
    'kontak_pic_internal': 'kontak_pic_internal',
    'kontak_pic_eksternal': 'kontak_pic_eksternal',
  };

  // 1. Try exact code match
  if (columnMap[code]) return columnMap[code];
  
  // 2. Try name match (fuzzy)
  const nameMap = {
    'nama aplikasi': 'nama_aplikasi',
    'status': 'status',
    'domain': 'domain_aplikasi',
    'pdn': 'pdn_backup',
    'ssl': 'sertifikat_ssl',
    'pusat komputasi': 'penyedia_hosting'
  };
  
  if (nameMap[name]) return nameMap[name];

  // 3. Fallback: try code as column name directly
  return code || name.replace(/[^a-z0-9]/g, '_');
}

module.exports = { mapFieldToColumn };