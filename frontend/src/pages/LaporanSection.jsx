import { useState, useEffect } from "react";
import "../styles/spin-animation.css";

function LaporanSection() {
  const [formatLaporan, setFormatLaporan] = useState([]);
  const [eselon1List, setEselon1List] = useState([]);
  const [eselon2List, setEselon2List] = useState([]);
  const [statusList, setStatusList] = useState([]);

  const [filters, setFilters] = useState({
    format_laporan_id: "all",
    tahun: "all",
    status: "all",
    eselon1_id: "all",
    eselon2_id: "all",
  });

  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDropdownData();
    fetchPreviewData();
  }, []);

  useEffect(() => {
    if (filters.eselon1_id !== "all") {
      fetchEselon2ByEselon1(filters.eselon1_id);
    } else {
      setEselon2List([]);
      setFilters((prev) => ({ ...prev, eselon2_id: "all" }));
    }
  }, [filters.eselon1_id]);

  const fetchDropdownData = async () => {
    try {
      const [formatRes, eselon1Res, statusRes] = await Promise.all([
        fetch("http://localhost:5000/api/laporan/format-laporan"),
        fetch("http://localhost:5000/api/master-data?type=eselon1"),
        fetch("http://localhost:5000/api/master-data?type=status_aplikasi"),
      ]);

      if (formatRes.ok) {
        const formatData = await formatRes.json();
        setFormatLaporan(formatData.data || []);
      }

      if (eselon1Res.ok) {
        const eselon1Data = await eselon1Res.json();
        setEselon1List(
          (eselon1Data.data || []).filter((e) => e.status_aktif === 1),
        );
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStatusList(statusData.data || []);
      }
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const fetchEselon2ByEselon1 = async (eselon1Id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/master-data?type=eselon2&eselon1_id=${eselon1Id}`,
      );
      if (res.ok) {
        const data = await res.json();
        setEselon2List((data.data || []).filter((e) => e.status_aktif === 1));
      }
    } catch (err) {
      console.error("Error fetching eselon2:", err);
    }
  };

  const fetchPreviewData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key] && filters[key] !== "all") {
          params.append(key, filters[key]);
        }
      });

      const res = await fetch(
        `http://localhost:5000/api/laporan/preview?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Gagal mengambil preview data");

      const data = await res.json();
      setPreviewData(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchPreviewData();
  };

  const handleExport = (format) => {
    const params = new URLSearchParams();

    // Determine if exporting all formats or single format
    const isExportAll =
      !filters.format_laporan_id || filters.format_laporan_id === "all";

    // Only add format_laporan_id if a specific format is selected
    if (!isExportAll) {
      params.append("format_laporan_id", filters.format_laporan_id);
    }

    // Add other filters
    if (filters.tahun && filters.tahun !== "all")
      params.append("tahun", filters.tahun);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.eselon1_id && filters.eselon1_id !== "all")
      params.append("eselon1_id", filters.eselon1_id);
    if (filters.eselon2_id && filters.eselon2_id !== "all")
      params.append("eselon2_id", filters.eselon2_id);

    // Use appropriate endpoint based on selection
    const endpoint = isExportAll ? `${format}-all` : format;
    const url = `http://localhost:5000/api/laporan/export/${endpoint}?${params.toString()}`;
    window.open(url, "_blank");
  };

  const handleExportAll = (format) => {
    const params = new URLSearchParams();

    // Add filters (no format_laporan_id for export all)
    if (filters.tahun && filters.tahun !== "all")
      params.append("tahun", filters.tahun);
    if (filters.status && filters.status !== "all")
      params.append("status", filters.status);
    if (filters.eselon1_id && filters.eselon1_id !== "all")
      params.append("eselon1_id", filters.eselon1_id);
    if (filters.eselon2_id && filters.eselon2_id !== "all")
      params.append("eselon2_id", filters.eselon2_id);

    const url = `http://localhost:5000/api/laporan/export/${format}-all?${params.toString()}`;
    window.open(url, "_blank");
  };

  const currentYear = new Date().getFullYear();
  const years = [
    "all",
    currentYear,
    currentYear - 1,
    currentYear - 2,
    currentYear - 3,
    currentYear - 4,
  ];

  return (
    <section
      id="laporan"
      className="page-section"
      style={{
        padding: "24px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px",
          padding: "14px 18px",
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "12px",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.01em",
              }}
            >
              Preview dan Laporan
            </h1>
            <p
              style={{
                margin: 0,
                marginTop: "2px",
                color: "#64748b",
                fontSize: "11px",
                fontWeight: 500,
              }}
            >
              Filter dan export laporan aplikasi
            </p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
          marginBottom: "16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "14px",
            paddingBottom: "12px",
            borderBottom: "2px solid #f1f5f9",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.25)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </div>
          <h3
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              color: "#1e293b",
              letterSpacing: "-0.01em",
            }}
          >
            FILTER LAPORAN
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          {/* Format Laporan */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Format Laporan
            </label>
            <select
              value={filters.format_laporan_id}
              onChange={(e) =>
                handleFilterChange("format_laporan_id", e.target.value)
              }
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 500,
                color: "#1e293b",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0, 0, 0, 0.04)";
              }}
            >
              <option value="all">Semua Format</option>
              {formatLaporan.map((format) => (
                <option
                  key={format.format_laporan_id}
                  value={format.format_laporan_id}
                >
                  {format.nama_format}
                </option>
              ))}
            </select>
          </div>

          {/* Tahun */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Tahun
            </label>
            <select
              value={filters.tahun}
              onChange={(e) => handleFilterChange("tahun", e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 500,
                color: "#1e293b",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0, 0, 0, 0.04)";
              }}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year === "all" ? "Semua Tahun" : year}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 500,
                color: "#1e293b",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0, 0, 0, 0.04)";
              }}
            >
              <option value="all">Semua Status</option>
              {statusList.map((status) => (
                <option
                  key={status.status_aplikasi_id}
                  value={status.status_aplikasi_id}
                >
                  {status.nama_status}
                </option>
              ))}
            </select>
          </div>

          {/* Eselon 1 */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Eselon 1
            </label>
            <select
              value={filters.eselon1_id}
              onChange={(e) => handleFilterChange("eselon1_id", e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 500,
                color: "#1e293b",
                backgroundColor: "#ffffff",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#6366f1";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0, 0, 0, 0.04)";
              }}
            >
              <option value="all">Semua Eselon 1</option>
              {eselon1List.map((eselon) => (
                <option key={eselon.eselon1_id} value={eselon.eselon1_id}>
                  {eselon.nama_eselon1}
                </option>
              ))}
            </select>
          </div>

          {/* Eselon 2 */}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "6px",
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Eselon 2
            </label>
            <select
              value={filters.eselon2_id}
              onChange={(e) => handleFilterChange("eselon2_id", e.target.value)}
              disabled={filters.eselon1_id === "all"}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: "1.5px solid #e2e8f0",
                fontSize: "12px",
                fontWeight: 500,
                color: filters.eselon1_id === "all" ? "#94a3b8" : "#1e293b",
                backgroundColor:
                  filters.eselon1_id === "all" ? "#f8fafc" : "#ffffff",
                cursor:
                  filters.eselon1_id === "all" ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
                opacity: filters.eselon1_id === "all" ? 0.6 : 1,
              }}
              onFocus={(e) => {
                if (filters.eselon1_id !== "all") {
                  e.currentTarget.style.borderColor = "#6366f1";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(99, 102, 241, 0.1)";
                }
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow =
                  "0 1px 2px rgba(0, 0, 0, 0.04)";
              }}
            >
              <option value="all">Semua Eselon 2</option>
              {eselon2List.map((eselon) => (
                <option key={eselon.eselon2_id} value={eselon.eselon2_id}>
                  {eselon.nama_eselon2}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={handleApplyFilters}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(79, 70, 229, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(79, 70, 229, 0.25)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Terapkan Filter
          </button>

          <button
            onClick={() => handleExport("excel")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(16, 185, 129, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(16, 185, 129, 0.25)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Excel
          </button>

          <button
            onClick={() => handleExport("pdf")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 18px",
              borderRadius: "8px",
              border: "none",
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#ffffff",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: "0 2px 8px rgba(239, 68, 68, 0.25)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(239, 68, 68, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 2px 8px rgba(239, 68, 68, 0.25)";
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <div
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          borderRadius: "12px",
          padding: "16px",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "14px",
            paddingBottom: "12px",
            borderBottom: "2px solid #f1f5f9",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.25)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: "12px",
              fontWeight: 700,
              color: "#1e293b",
              letterSpacing: "-0.01em",
            }}
          >
            PREVIEW DATA
          </h2>
        </div>

        {error && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 14px",
              background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
              border: "1.5px solid #fca5a5",
              borderRadius: "8px",
              color: "#991b1b",
              marginBottom: "14px",
              fontSize: "12px",
              fontWeight: 600,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {filters.format_laporan_id === "all" ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "10px",
              border: "2px dashed #cbd5e1",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              style={{ marginBottom: "12px", margin: "0 auto" }}
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <p
              style={{
                margin: 0,
                marginTop: "12px",
                fontSize: "13px",
                color: "#64748b",
                lineHeight: "1.6",
                fontWeight: 500,
              }}
            >
              Preview tidak tersedia untuk "Semua Format".
              <br />
              Pilih format spesifik untuk melihat preview, atau langsung export
              untuk mendapatkan semua format.
            </p>
          </div>
        ) : loading ? (
          <div style={{ padding: "50px", textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                borderRadius: "8px",
                color: "#1e40af",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  border: "2px solid #3b82f6",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
              Memuat data...
            </div>
          </div>
        ) : previewData.length === 0 ? (
          <div
            style={{
              padding: "50px 20px",
              textAlign: "center",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              borderRadius: "10px",
              border: "2px dashed #cbd5e1",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              style={{ marginBottom: "12px", margin: "0 auto" }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            <p
              style={{
                margin: 0,
                marginTop: "12px",
                fontSize: "13px",
                color: "#64748b",
                fontWeight: 500,
              }}
            >
              Tidak ada data yang sesuai dengan filter
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 6px",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "9px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: "transparent",
                        borderBottom: "none",
                      }}
                    >
                      NAMA APLIKASI
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "9px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: "transparent",
                        borderBottom: "none",
                      }}
                    >
                      UNIT
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "9px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: "transparent",
                        borderBottom: "none",
                      }}
                    >
                      PIC
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "9px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: "transparent",
                        borderBottom: "none",
                      }}
                    >
                      STATUS APLIKASI
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 700,
                        color: "#475569",
                        fontSize: "9px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        background: "transparent",
                        borderBottom: "none",
                      }}
                    >
                      TANGGAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((item, index) => (
                    <tr
                      key={index}
                      style={{
                        background:
                          "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)";
                        e.currentTarget.style.transform = "translateX(4px)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0, 0, 0, 0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)";
                        e.currentTarget.style.transform = "translateX(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "#1e293b",
                          fontWeight: 700,
                          fontSize: "11px",
                          borderTopLeftRadius: "8px",
                          borderBottomLeftRadius: "8px",
                          borderTop: "1px solid #e2e8f0",
                          borderBottom: "1px solid #e2e8f0",
                          borderLeft: "1px solid #e2e8f0",
                        }}
                      >
                        {item.nama_aplikasi}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "#64748b",
                          fontSize: "10px",
                          fontWeight: 500,
                          borderTop: "1px solid #e2e8f0",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {item.unit || item.nama_eselon1 || "-"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "#64748b",
                          fontSize: "10px",
                          fontWeight: 500,
                          borderTop: "1px solid #e2e8f0",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        {item.pic || "-"}
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          borderTop: "1px solid #e2e8f0",
                          borderBottom: "1px solid #e2e8f0",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "4px 10px",
                            borderRadius: "16px",
                            fontSize: "9px",
                            fontWeight: 700,
                            background:
                              item.status_aplikasi
                                ?.toLowerCase()
                                .includes("aktif") &&
                              !item.status_aplikasi
                                ?.toLowerCase()
                                .includes("tidak")
                                ? "#d1fae5"
                                : "#fee2e2",
                            color:
                              item.status_aplikasi
                                ?.toLowerCase()
                                .includes("aktif") &&
                              !item.status_aplikasi
                                ?.toLowerCase()
                                .includes("tidak")
                                ? "#065f46"
                                : "#991b1b",
                            border: `1.5px solid ${item.status_aplikasi?.toLowerCase().includes("aktif") && !item.status_aplikasi?.toLowerCase().includes("tidak") ? "#065f4620" : "#991b1b20"}`,
                            letterSpacing: "0.03em",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.status_aplikasi || "Aktif"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "10px 12px",
                          color: "#64748b",
                          fontSize: "10px",
                          fontWeight: 500,
                          borderTopRightRadius: "8px",
                          borderBottomRightRadius: "8px",
                          borderTop: "1px solid #e2e8f0",
                          borderBottom: "1px solid #e2e8f0",
                          borderRight: "1px solid #e2e8f0",
                        }}
                      >
                        {item.tanggal_ditambahkan || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                borderRadius: "8px",
                border: "1.5px solid #bfdbfe",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e40af"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span
                style={{ color: "#1e40af", fontSize: "12px", fontWeight: 700 }}
              >
                Total: {previewData.length} aplikasi
              </span>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default LaporanSection;
