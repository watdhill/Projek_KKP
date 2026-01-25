const pool = require('./src/config/database');

pool.query(`
  SELECT 
    da.nama_aplikasi,
    da.status_aplikasi,
    sa.nama_status
  FROM data_aplikasi da
  LEFT JOIN status_aplikasi sa ON da.status_aplikasi = sa.status_aplikasi_id
  WHERE da.eselon1_id = (SELECT eselon1_id FROM master_eselon1 WHERE singkatan = 'DJPRL')
`).then(([rows]) => {
    console.log('DJPRL Applications:');
    console.table(rows);
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
