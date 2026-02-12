import { useState, useEffect } from "react";

function ArsipLaporanTab() {
  const [archives, setArchives] = useState([]);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  
  // State untuk create archive baru
  const [newArchiveYear, setNewArchiveYear] = useState(new Date().getFullYear());

  // Filter states for snapshots
  const [filterYear, setFilterYear] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal generate snapshot
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [snapshotForm, setSnapshotForm] = useState({
    name: "",
    year: new Date().getFullYear(),
    fileType: "excel",
    selectedFormat: "", // Default empty, user must select
    description: "",
    isOfficial: false,
  });

  useEffect(() => {
    fetchArchives();
    fetchSnapshots();
    fetchAvailableYears();
  }, []);

  // Fetch formats when modal opens with current year
  useEffect(() => {
    if (showGenerateModal && snapshotForm.year) {
      fetchAvailableFormats(snapshotForm.year);
    }
  }, [showGenerateModal, snapshotForm.year]);

  const fetchArchives = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/laporan/archive/list");
      const data = await response.json();
      if (data.success) {
        setArchives(data.data);
      }
    } catch (error) {
      console.error("Error fetching archives:", error);
    }
  };

  const fetchSnapshots = async () => {
    try {
      const params = new URLSearchParams();
      if (filterYear !== "all") params.append("year", filterYear);
      if (filterType !== "all") params.append("file_type", filterType);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(
        `http://localhost:5000/api/laporan/snapshots?${params.toString()}`
      );
      const data = await response.json();
      if (data.success) {
        setSnapshots(data.data);
      }
    } catch (error) {
      console.error("Error fetching snapshots:", error);
    }
  };

  const fetchAvailableYears = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/laporan/snapshots/years");
      const data = await response.json();
      if (data.success) {
        setAvailableYears(data.data);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  const fetchAvailableFormats = async (year) => {
    if (!year) {
      setAvailableFormats([]);
      return;
    }
    
    console.log('Fetching formats for year:', year);
    
    try {
      const response = await fetch(`http://localhost:5000/api/laporan/archive/${year}/formats`);
      const data = await response.json();
      
      console.log('Formats API response:', data);
      
      if (data.success) {
        console.log('Setting available formats:', data.data);
        setAvailableFormats(data.data || []);
      } else {
        console.error('Failed to fetch formats:', data.message);
        setAvailableFormats([]);
      }
    } catch (error) {
      console.error("Error fetching formats:", error);
      setAvailableFormats([]);
    }
  };

  const handleArchiveFormat = async (year) => {
    if (!year) {
      alert("Tahun tidak boleh kosong");
      return;
    }
    
    if (!confirm(`Arsipkan format laporan untuk tahun ${year}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/laporan/archive/format/${year}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchArchives();
      } else {
        alert(data.message || "Gagal mengarsipkan format");
      }
    } catch (error) {
      alert("Gagal mengarsipkan format");
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveData = async (year) => {
    if (!year) {
      alert("Tahun tidak boleh kosong");
      return;
    }
    
    if (!confirm(`Arsipkan data aplikasi untuk tahun ${year}?`)) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/laporan/archive/data/${year}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchArchives();
      } else {
        alert(data.message || "Gagal mengarsipkan data");
      }
    } catch (error) {
      alert("Gagal mengarsipkan data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteArchive = async (year) => {
    if (!year) {
      alert("Tahun tidak boleh kosong");
      return;
    }
    
    const confirmed = confirm(
      `PERINGATAN!\n\nAnda akan menghapus semua arsip untuk tahun ${year}:\n` +
      `- Format laporan yang diarsipkan\n` +
      `- Data aplikasi yang diarsipkan\n` +
      `- Semua file laporan yang telah dibuat\n\n` +
      `Tindakan ini TIDAK DAPAT DIBATALKAN!\n\n` +
      `Apakah Anda yakin ingin melanjutkan?`
    );
    
    if (!confirmed) return;

    // Double confirmation
    const doubleConfirmed = confirm(
      `Konfirmasi terakhir!\n\nKetik "DELETE" untuk menghapus arsip tahun ${year}`
    );
    
    if (!doubleConfirmed) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/laporan/archive/${year}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        alert(`${data.message}`);
        // Refresh both archives and snapshots
        fetchArchives();
        fetchSnapshots();
        fetchAvailableYears(); // Update available years
      } else {
        alert(`${data.message || "Gagal menghapus arsip"}`);
      }
    } catch (error) {
      console.error("Delete archive error:", error);
      alert("Error menghapus arsip. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateArchiveAll = async () => {
    if (!newArchiveYear) {
      alert("Masukkan tahun terlebih dahulu");
      return;
    }
    
    if (!confirm(`Arsipkan format dan data untuk tahun ${newArchiveYear}?`)) return;
    
    setLoading(true);
    try {
      // Archive format first
      const formatResponse = await fetch(
        `http://localhost:5000/api/laporan/archive/format/${newArchiveYear}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const formatData = await formatResponse.json();
      
      if (!formatData.success) {
        alert(formatData.message || "Gagal mengarsipkan format");
        setLoading(false);
        return;
      }
      
      // Then archive data
      const dataResponse = await fetch(
        `http://localhost:5000/api/laporan/archive/data/${newArchiveYear}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );
      const dataData = await dataResponse.json();
      
      if (dataData.success) {
        alert(`Berhasil mengarsipkan format dan data tahun ${newArchiveYear}!`);
        fetchArchives();
      } else {
        alert(dataData.message || "Gagal mengarsipkan data");
      }
    } catch (error) {
      alert("Gagal membuat arsip");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSnapshot = async () => {
    // Generate snapshot name jika tidak diisi
    const snapshotName = snapshotForm.name.trim() || 
      `Laporan_${snapshotForm.year}_${new Date().getTime()}`;

    if (!snapshotForm.year) {
      alert("Pilih tahun terlebih dahulu");
      return;
    }

    if (!snapshotForm.selectedFormat) {
      alert("Pilih format laporan terlebih dahulu");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/laporan/snapshots/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            snapshot_name: snapshotName,
            snapshot_year: snapshotForm.year,
            file_type: snapshotForm.fileType,
            selectedFormat: snapshotForm.selectedFormat, // Send as selectedFormat instead of filters.format
            description: snapshotForm.description,
            filters: {
              // Additional filters can go here
            },
            is_official: snapshotForm.isOfficial,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("File laporan berhasil dibuat!");
        setShowGenerateModal(false);
        setSnapshotForm({
          name: "",
          year: new Date().getFullYear(),
          fileType: "excel",
          selectedFormat: "",
          description: "",
          isOfficial: false,
        });
        fetchSnapshots();
      } else {
        alert(data.message || "Error generating snapshot");
      }
    } catch (error) {
      console.error("Generate snapshot error:", error);
      alert("Error generating snapshot");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSnapshot = async (id, name, type) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/laporan/snapshots/${id}/download`
      );

      if (!response.ok) {
        throw new Error("Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}.${type === "excel" ? "xlsx" : "pdf"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Gagal mengunduh snapshot");
    }
  };

  const handleDeleteSnapshot = async (id) => {
    if (!confirm("Hapus file laporan ini?")) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/laporan/snapshots/${id}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      if (data.success) {
        alert(data.message);
        fetchSnapshots();
      } else {
        alert(data.message || "Gagal menghapus snapshot");
      }
    } catch (error) {
      alert("Gagal menghapus snapshot");
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  useEffect(() => {
    fetchSnapshots();
  }, [filterYear, filterType, searchTerm]);

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 700,
            color: "#1e293b",
            marginBottom: "8px",
          }}
        >
          Arsip Laporan Tahunan
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "13px" }}>
          Kelola arsip format, data, dan file laporan per tahun
        </p>
      </div>

      {/* Create New Archive Section */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "24px",
          border: "1px solid #e2e8f0",
        }}
      >
        <h3
          style={{
            margin: "0 0 16px 0",
            fontSize: "15px",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Buat Arsip Baru
        </h3>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                color: "#475569",
              }}
            >
              Tahun:
            </label>
            <input
              type="number"
              min="2020"
              max={new Date().getFullYear() + 1}
              value={newArchiveYear}
              onChange={(e) => setNewArchiveYear(parseInt(e.target.value))}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: "1px solid #cbd5e1",
                fontSize: "13px",
                width: "100px",
                fontWeight: 500,
              }}
            />
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => handleArchiveFormat(newArchiveYear)}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#3b82f6",
                color: "white",
                fontSize: "13px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#2563eb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#3b82f6";
              }}
            >
              Arsipkan Format
            </button>
            
            <button
              onClick={() => handleArchiveData(newArchiveYear)}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#8b5cf6",
                color: "white",
                fontSize: "13px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#7c3aed";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#8b5cf6";
              }}
            >
              Arsipkan Data
            </button>
            
            <button
              onClick={handleCreateArchiveAll}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: "6px",
                border: "none",
                background: "#10b981",
                color: "white",
                fontSize: "13px",
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.background = "#059669";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#10b981";
              }}
            >
              Arsipkan Keduanya
            </button>
          </div>
        </div>
        <p
          style={{
            margin: "12px 0 0 0",
            fontSize: "12px",
            color: "#64748b",
            fontStyle: "italic",
          }}
        >
          Tip: Arsip format menyimpan struktur laporan, arsip data
          menyimpan data aplikasi. Gunakan "Arsipkan Keduanya" untuk menyimpan
          semuanya sekaligus.
        </p>
      </div>

      {/* Archive Status Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {archives.slice(0, 4).map((archive) => (
          <div
            key={archive.year}
            style={{
              background: "#ffffff",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              border: "1px solid #e2e8f0",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: 700,
                  color: "#4f46e5",
                }}
              >
                {archive.year}
              </span>
              <span
                style={{
                  padding: "4px 8px",
                  background:
                    archive.status === "complete"
                      ? "#dcfce7"
                      : archive.status === "partial"
                        ? "#fef3c7"
                        : "#e0e7ff",
                  color:
                    archive.status === "complete"
                      ? "#166534"
                      : archive.status === "partial"
                        ? "#92400e"
                        : "#3730a3",
                  fontSize: "10px",
                  fontWeight: 600,
                  borderRadius: "6px",
                  textTransform: "uppercase",
                }}
              >
                {archive.status === "complete"
                  ? "Lengkap"
                  : archive.status === "partial"
                    ? "Sebagian"
                    : "Hanya File Laporan"}
              </span>
            </div>

            <div style={{ fontSize: "11px", color: "#64748b" }}>
              <div style={{ marginBottom: "4px" }}>
                Format: {archive.format_count} | Data: {archive.application_count}
              </div>
              <div>File Laporan: {archive.snapshot_count}</div>
            </div>

            <div
              style={{
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                gap: "8px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                {!archive.has_format_archive && (
                  <button
                    onClick={() => handleArchiveFormat(archive.year)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Arsipkan Format
                  </button>
                )}
                {!archive.has_data_archive && (
                  <button
                    onClick={() => handleArchiveData(archive.year)}
                    disabled={loading}
                    style={{
                      flex: 1,
                      padding: "6px 12px",
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Arsipkan Data
                  </button>
                )}
              </div>
              
              {/* Delete Button - Only show if archive exists */}
              {(archive.has_format_archive || archive.has_data_archive) && (
                <button
                  onClick={() => handleDeleteArchive(archive.year)}
                  disabled={loading}
                  style={{
                    padding: "6px 12px",
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    minWidth: "70px",
                  }}
                  title="Hapus arsip tahun ini"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Snapshots Section */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "16px",
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            Daftar File Laporan
          </h3>
          <button
            onClick={() => {
              setShowGenerateModal(true);
              // Fetch formats for current year immediately
              if (snapshotForm.year) {
                fetchAvailableFormats(snapshotForm.year);
              }
            }}
            style={{
              padding: "8px 16px",
              background: "#4f46e5",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Buat File Laporan
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              Tahun
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              <option value="all">Semua Tahun</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              Tipe File
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            >
              <option value="all">Semua Tipe</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 600,
                color: "#64748b",
                marginBottom: "4px",
              }}
            >
              Cari
            </label>
            <input
              type="text"
              placeholder="Cari nama file..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
              }}
            />
          </div>
        </div>

        {/* Snapshots Table */}
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "left",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Nama File
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Tahun
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Tipe
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Ukuran
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Total Aplikasi
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Dibuat
                </th>
                <th
                  style={{
                    padding: "10px",
                    textAlign: "center",
                    fontWeight: 700,
                    color: "#475569",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {snapshots.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#94a3b8",
                    }}
                  >
                    Belum ada file laporan. Klik "Buat File Laporan" untuk membuat.
                  </td>
                </tr>
              ) : (
                snapshots.map((snapshot) => (
                  <tr
                    key={snapshot.id}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <td style={{ padding: "12px" }}>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>
                        {snapshot.snapshot_name}
                      </div>
                      {snapshot.description && (
                        <div
                          style={{
                            fontSize: "10px",
                            color: "#94a3b8",
                            marginTop: "2px",
                          }}
                        >
                          {snapshot.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {snapshot.snapshot_year}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          background:
                            snapshot.file_type === "excel"
                              ? "#dcfce7"
                              : "#dbeafe",
                          color:
                            snapshot.file_type === "excel"
                              ? "#166534"
                              : "#1e40af",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: 600,
                        }}
                      >
                        {snapshot.file_type === "excel" ? "XLSX" : "PDF"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {formatFileSize(snapshot.file_size)}
                    </td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {snapshot.total_records}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        fontSize: "11px",
                        color: "#64748b",
                      }}
                    >
                      {new Date(snapshot.generated_at).toLocaleDateString(
                        "id-ID"
                      )}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
                        <button
                          onClick={() =>
                            handleDownloadSnapshot(
                              snapshot.id,
                              snapshot.snapshot_name,
                              snapshot.file_type
                            )
                          }
                          style={{
                            padding: "6px 12px",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          Unduh
                        </button>
                        <button
                          onClick={() => handleDeleteSnapshot(snapshot.id)}
                          style={{
                            padding: "6px 12px",
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "10px",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Snapshot Modal */}
      {showGenerateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowGenerateModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "18px",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              Buat File Laporan
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Nama File (Opsional)
                </label>
                <input
                  type="text"
                  value={snapshotForm.name}
                  onChange={(e) =>
                    setSnapshotForm({ ...snapshotForm, name: e.target.value })
                  }
                  placeholder="Kosongkan untuk generate otomatis"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                />
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "11px",
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  Jika kosong, akan diisi otomatis: Laporan_2026_timestamp
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Tahun <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={snapshotForm.year}
                  onChange={(e) => {
                    const selectedYear = parseInt(e.target.value);
                    setSnapshotForm({ ...snapshotForm, year: selectedYear, selectedFormat: "" });
                    fetchAvailableFormats(selectedYear);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Format Laporan <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={snapshotForm.selectedFormat}
                  onChange={(e) =>
                    setSnapshotForm({ ...snapshotForm, selectedFormat: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  <option value="" disabled>-- Pilih Format Laporan --</option>
                  {availableFormats.map((format) => (
                    <option key={format.format_laporan_id} value={format.format_laporan_id}>
                      {format.nama_format}
                    </option>
                  ))}
                </select>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "11px",
                    color: "#64748b",
                    fontStyle: "italic",
                  }}
                >
                  Pilih format spesifik untuk export laporan dengan struktur tertentu (ex: menpanrb)
                </p>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Tipe File <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={snapshotForm.fileType}
                  onChange={(e) =>
                    setSnapshotForm({ ...snapshotForm, fileType: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                  }}
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="pdf">PDF (.pdf)</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#475569",
                    marginBottom: "6px",
                  }}
                >
                  Deskripsi (Opsional)
                </label>
                <textarea
                  value={snapshotForm.description}
                  onChange={(e) =>
                    setSnapshotForm({ ...snapshotForm, description: e.target.value })
                  }
                  placeholder="Contoh: Laporan Tahunan 2026 - Semua Unit"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    fontSize: "13px",
                    minHeight: "80px",
                    resize: "vertical",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              <div style={{ display: "none" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={snapshotForm.isOfficial}
                    onChange={(e) =>
                      setSnapshotForm({ ...snapshotForm, isOfficial: e.target.checked })
                    }
                    style={{
                      width: "16px",
                      height: "16px",
                      cursor: "pointer",
                    }}
                  />
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "#475569",
                    }}
                  >
                    Tandai sebagai laporan resmi
                  </span>
                </label>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "8px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowGenerateModal(false)}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#fff",
                    color: "#475569",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={handleGenerateSnapshot}
                  disabled={loading}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#4f46e5",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? "Membuat..." : "Buat"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ArsipLaporanTab;
