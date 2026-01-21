import { useState, useEffect } from "react";

function OperatorUPTDataAplikasi() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/data-aplikasi");
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      setApps(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = apps.filter(app =>
    app.nama_aplikasi?.toLowerCase().includes(search.toLowerCase()) ||
    app.domain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="page-section">
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: "0 0 8px", fontSize: "24px", fontWeight: 700, color: "#1e293b" }}>
          Data Aplikasi
        </h1>
        <p style={{ margin: 0, color: "#475569", fontSize: "14px" }}>
          Daftar aplikasi yang dikelola oleh Unit Pelaksana Teknis (UPT) Anda.
        </p>
      </div>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#fee2e2", border: "1px solid #fecaca", borderRadius: "6px", color: "#991b1b", marginBottom: "16px", fontSize: "14px" }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: "14px", backgroundColor: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></div>
          <div style={{ marginTop: "12px" }}>Memuat data...</div>
        </div>
      ) : (
        <div style={{ backgroundColor: "#ffffff", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "16px 18px", backgroundColor: "#fafbfc", borderRadius: "12px 12px 0 0", borderBottom: "1px solid #e2e8f0" }}>
            <input
              type="text"
              placeholder="Cari aplikasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #cbd5e1",
                borderRadius: "6px",
                fontSize: "13px",
                boxSizing: "border-box",
              }}
            />
          </div>

          {filteredApps.length === 0 ? (
            <div style={{ padding: "40px 20px", textAlign: "center", backgroundColor: "#f8fafc", color: "#94a3b8", fontSize: "14px" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔍</div>
              <div style={{ fontWeight: 500 }}>Tidak ada data ditemukan</div>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase" }}>No</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase" }}>Nama Aplikasi</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase" }}>Domain</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase" }}>Deskripsi</th>
                    <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, color: "#475569", fontSize: "11.5px", textTransform: "uppercase" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.map((app, index) => (
                    <tr key={app.nama_aplikasi} style={{ borderBottom: "1px solid #e2e8f0", minHeight: "44px" }}>
                      <td style={{ padding: "10px 12px", color: "#64748b", fontWeight: 500 }}>{index + 1}</td>
                      <td style={{ padding: "10px 12px", color: "#1e293b", fontWeight: 500 }}>{app.nama_aplikasi || "-"}</td>
                      <td style={{ padding: "10px 12px", color: "#64748b" }}>{app.domain || "-"}</td>
                      <td style={{ padding: "10px 12px", color: "#64748b", maxWidth: "300px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{app.deskripsi_fungsi || "-"}</td>
                      <td style={{ padding: "10px 12px", textAlign: "center" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 12px", borderRadius: "12px", fontSize: "11px", fontWeight: 600, backgroundColor: "#e7f8ee", color: "#15803d" }}>
                          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#22c55e" }}></span>
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default OperatorUPTDataAplikasi;
