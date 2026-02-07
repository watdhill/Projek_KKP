import { useState, useEffect } from "react";
import { authFetch } from "../utils/api";

function AuditLogSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [filters, setFilters] = useState({
    tableName: "",
    action: "",
    userId: "",
    startDate: "",
    endDate: "",
    search: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({});

  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams({
          page: pagination.page,
          pageSize: pagination.pageSize,
          ...Object.entries(appliedFilters).reduce((acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
          }, {}),
        });

        const response = await authFetch(
          `/api/audit-log?${queryParams.toString()}`,
        );

        // Check status code first
        if (!response.ok) {
          const error = await response.text();
          throw new Error(
            `Server error: ${response.status} - ${error.substring(0, 100)}`,
          );
        }

        const data = await response.json();

        setLogs(data.logs || data.data || []);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || data.total || 0,
          totalPages: data.pagination?.totalPages || data.totalPages || 1,
        }));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [pagination.page, pagination.pageSize, appliedFilters]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setAppliedFilters(filters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Reset filters
  const resetFilters = () => {
    const emptyFilters = {
      tableName: "",
      action: "",
      userId: "",
      startDate: "",
      endDate: "",
      search: "",
    };
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // View log details
  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);

    // Format: "08 Jan 2026, 9:15"
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("id-ID", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  // Format IP Address
  const formatIpAddress = (ip) => {
    if (!ip || ip === "unknown") return "-";
    if (ip === "127.0.0.1" || ip === "::1") {
      return "Localhost (127.0.0.1)";
    }
    return ip;
  };

  const safeParseJson = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value;
    if (typeof value !== "string") return value;

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === "string") {
        const trimmed = parsed.trim();
        if (
          (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
          (trimmed.startsWith("[") && trimmed.endsWith("]"))
        ) {
          try {
            return JSON.parse(parsed);
          } catch (error) {
            return parsed;
          }
        }
      }
      return parsed;
    } catch (error) {
      return null;
    }
  };

  const normalizeChangeKeys = (changes) => {
    if (!changes) return [];
    const parsed = safeParseJson(changes);

    if (Array.isArray(parsed)) return parsed;
    if (parsed && typeof parsed === "object") return Object.keys(parsed);

    if (typeof parsed === "string") {
      return parsed
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (typeof changes === "string") {
      return changes
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    if (typeof value === "string") return value;
    return JSON.stringify(value);
  };

  const getChangeSummary = (log) => {
    if (!log) return [];
    const action = (log.action || log.aksi || "").toUpperCase();
    const oldValues = safeParseJson(log.old_values) || null;
    const newValues = safeParseJson(log.new_values) || null;
    const changeKeys = normalizeChangeKeys(log.changes);

    let keys = changeKeys.length
      ? changeKeys
      : Array.from(
          new Set([
            ...(oldValues ? Object.keys(oldValues) : []),
            ...(newValues ? Object.keys(newValues) : []),
          ]),
        );

    if (action === "CREATE") {
      if (!keys.length && newValues) keys = Object.keys(newValues);
      return keys.map((key) => ({
        key,
        oldValue: null,
        newValue: newValues ? newValues[key] : null,
      }));
    }

    if (action === "DELETE") {
      if (!keys.length && oldValues) keys = Object.keys(oldValues);
      return keys.map((key) => ({
        key,
        oldValue: oldValues ? oldValues[key] : null,
        newValue: null,
      }));
    }

    return keys.map((key) => ({
      key,
      oldValue: oldValues ? oldValues[key] : null,
      newValue: newValues ? newValues[key] : null,
    }));
  };

  const getActionSentence = (log) => {
    if (!log) return "";

    const action = (log.action || log.aksi || "").toUpperCase();
    const actor =
      log.user_name || log.username || `User ${log.user_id}` || "User";
    const tableLabel = log.table_name || "data";
    const recordLabel = log.record_id ? ` (ID: ${log.record_id})` : "";
    const changesList = normalizeChangeKeys(log.changes);

    const humanizeLabel = (label) => {
      if (!label) return "";
      const cleaned = label
        .replace(/_id$/i, "")
        .replace(/^id_/i, "")
        .replace(/_/g, " ")
        .trim();
      return cleaned
        .split(/\s+/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    };

    const actorLabel = humanizeLabel(actor);
    const tableNameLabel = humanizeLabel(tableLabel);
    const fieldLabels = changesList.map(humanizeLabel).filter(Boolean);
    const changesText = fieldLabels.length
      ? ` pada field: ${fieldLabels.join(", ")}`
      : "";

    if (action === "CREATE") {
      return `${actorLabel} telah menambahkan data pada ${tableNameLabel}${recordLabel}.`;
    }
    if (action === "UPDATE") {
      return `${actorLabel} telah mengedit data pada ${tableNameLabel}${recordLabel}${changesText}.`;
    }
    if (action === "DELETE") {
      return `${actorLabel} telah menghapus data pada ${tableNameLabel}${recordLabel}.`;
    }
    if (action === "LOGIN") {
      return `${actorLabel} telah login.`;
    }
    if (action === "LOGOUT") {
      return `${actorLabel} telah logout.`;
    }

    return `${actorLabel} melakukan aksi ${action || ""} pada ${tableNameLabel}${recordLabel}.`;
  };

  // Get action badge color and label
  const getActionBadgeColor = (action) => {
    switch (action?.toUpperCase()) {
      case "CREATE":
      case "INSERT":
        return { bg: "#d1fae5", color: "#065f46", label: "Input" };
      case "UPDATE":
        return { bg: "#e9d5ff", color: "#6b21a8", label: "Edit" };
      case "DELETE":
        return { bg: "#fee2e2", color: "#991b1b", label: "Delete" };
      case "LOGIN":
        return { bg: "#e0e7ff", color: "#3730a3", label: "Login" };
      case "LOGOUT":
        return { bg: "#f3f4f6", color: "#374151", label: "Logout" };
      case "EXPORT":
        return { bg: "#fef3c7", color: "#92400e", label: "Export" };
      default:
        return { bg: "#fef3c7", color: "#92400e", label: action || "Lainnya" };
    }
  };

  // Get activity description (human-readable)
  const getActivityDescription = (log) => {
    const action = (log.action || log.aksi || "").toUpperCase();
    const tableName = log.table_name || "";

    // Function to humanize table name
    const humanizeTable = (table) => {
      const mapping = {
        data_aplikasi: "aplikasi",
        users: "user",
        master_eselon1: "eselon 1",
        master_eselon2: "eselon 2",
        master_satker: "satker",
        master_upt: "UPT",
        pic_internal: "PIC internal",
        pic_eksternal: "PIC eksternal",
        master_pdn: "PDN",
        master_va_pt: "VA PT",
        laporan: "laporan",
      };
      return mapping[table] || table.replace(/_/g, " ");
    };

    const tableLabel = humanizeTable(tableName);

    // Generate description based on action
    switch (action) {
      case "CREATE":
      case "INSERT":
        return `Menambah data ${tableLabel} baru`;
      case "UPDATE":
        return `Mengedit data ${tableLabel}`;
      case "DELETE":
        return `Menghapus ${tableLabel} yang ada`;
      case "LOGIN":
        return "Login ke sistem";
      case "LOGOUT":
        return "Logout dari sistem";
      case "EXPORT":
        if (log.detail && log.detail.toLowerCase().includes("pdf")) {
          return "Export laporan ke PDF";
        } else if (log.detail && log.detail.toLowerCase().includes("excel")) {
          return "Export laporan ke Excel";
        }
        return "Export data";
      default:
        return log.detail || log.description || `Aktivitas pada ${tableLabel}`;
    }
  };

  const unitOptions = logs.reduce(
    (acc, log) => {
      const userId = log.user_id;
      if (!userId || acc.map.has(userId)) return acc;

      const name = log.user_role || log.user_name || "User";
      const email = log.user_email || "";
      const label = email ? `${name} - ${email}` : name;

      acc.map.set(userId, true);
      acc.items.push({ value: String(userId), label });
      return acc;
    },
    { map: new Map(), items: [] },
  ).items;

  return (
    <section
      id="audit-log"
      className="page-section"
      style={{
        padding: "32px",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
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
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                marginBottom: "2px",
                fontSize: "18px",
                fontWeight: 700,
                color: "#4f46e5",
                letterSpacing: "-0.01em",
              }}
            >
              Audit Log
            </h1>
            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "12px",
                fontWeight: 400,
              }}
            >
              Monitor seluruh aktivitas dan perubahan data sistem
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          marginBottom: "20px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "10px 14px",
            borderBottom: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#4f46e5"
            strokeWidth="2"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>
            Filter & Pencarian
          </span>
        </div>
        <div style={{ padding: "12px" }}>
          {/* Row 1: Search & Unit */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            {/* Search Bar */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "4px",
                }}
              >
                Pencarian
              </label>
              <div style={{ position: "relative" }}>
                <svg
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                  }}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Cari berdasarkan aktivitas, user, atau detail..."
                  style={{
                    width: "100%",
                    padding: "6px 10px 6px 32px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxSizing: "border-box",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#4f46e5";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(79, 70, 229, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#e2e8f0";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "4px",
                }}
              >
                Unit
              </label>
              <select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              >
                <option value="">Semua Unit</option>
                {unitOptions.map((unit) => (
                  <option key={unit.value} value={unit.value}>
                    {unit.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Aksi, Tanggal Mulai, Tanggal Akhir */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "12px",
            }}
          >
            {/* Aksi */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "4px",
                }}
              >
                Aksi
              </label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxSizing: "border-box",
                  backgroundColor: "#ffffff",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              >
                <option value="">Semua Aksi</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
              </select>
            </div>

            {/* Tanggal Mulai */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "4px",
                }}
              >
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Tanggal Akhir */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "4px",
                }}
              >
                Tanggal Akhir
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                style={{
                  width: "100%",
                  padding: "6px 10px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "6px",
                  fontSize: "12px",
                  boxSizing: "border-box",
                  transition: "all 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={applyFilters}
              style={{
                padding: "6px 12px",
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(79, 70, 229, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(79, 70, 229, 0.25)";
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Terapkan Filter
            </button>
            <button
              onClick={resetFilters}
              style={{
                padding: "6px 12px",
                background: "#ffffff",
                color: "#64748b",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.background = "#f8fafc";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#ffffff";
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div
          style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div>
            <p
              style={{
                margin: "0 0 2px 0",
                fontWeight: 600,
                color: "#991b1b",
                fontSize: "14px",
              }}
            >
              Gagal Memuat Data
            </p>
            <p style={{ margin: 0, color: "#dc2626", fontSize: "13px" }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div
          style={{
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "40px 20px",
            textAlign: "center",
            boxShadow:
              "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              margin: "0 auto 12px",
              borderRadius: "50%",
              border: "3px solid #f1f5f9",
              borderTopColor: "#4f46e5",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p
            style={{
              margin: "0 0 4px 0",
              color: "#1e293b",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            Memuat Data
          </p>
          <p style={{ margin: 0, color: "#94a3b8", fontSize: "13px" }}>
            Mohon tunggu sebentar...
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              padding: "10px 12px",
              marginBottom: "16px",
              border: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 3px 10px rgba(79, 70, 229, 0.2)",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
              >
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0f172a",
                  lineHeight: 1,
                  marginBottom: "4px",
                }}
              >
                {pagination.total.toLocaleString()}
              </div>
              <div
                style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}
              >
                Total aktivitas tercatat di sistem
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              boxShadow:
                "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
              marginBottom: "16px",
            }}
          >
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "12px",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8fafc",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Waktu
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      User
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Aksi
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      Detail Aktivitas
                    </th>
                    <th
                      style={{
                        padding: "10px 12px",
                        textAlign: "left",
                        fontWeight: 600,
                        color: "#64748b",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      IP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "30px 16px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "inline-flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background: "#f1f5f9",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#cbd5e1"
                              strokeWidth="2"
                            >
                              <path d="M9 12h6"></path>
                              <path d="M12 9v6"></path>
                              <rect
                                x="3"
                                y="3"
                                width="18"
                                height="18"
                                rx="2"
                                ry="2"
                              ></rect>
                            </svg>
                          </div>
                          <div>
                            <p
                              style={{
                                margin: "0 0 2px 0",
                                fontSize: "13px",
                                fontWeight: 600,
                                color: "#475569",
                              }}
                            >
                              Tidak ada data
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "12px",
                                color: "#94a3b8",
                              }}
                            >
                              Belum ada log aktivitas yang tercatat
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => {
                      const badgeColors = getActionBadgeColor(
                        log.action || log.aksi,
                      );
                      const activityDesc = getActivityDescription(log);
                      const unitName = log.user_role || log.user_name || "-";
                      const userEmail = log.user_email || "";

                      return (
                        <tr
                          key={log.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            backgroundColor: "#ffffff",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#f8fafc")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ffffff")
                          }
                          onClick={() => viewLogDetails(log)}
                        >
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#475569",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {formatDate(log.timestamp || log.created_at)}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <div
                              style={{
                                fontWeight: 600,
                                color: "#0f172a",
                                marginBottom: "2px",
                                fontSize: "12px",
                              }}
                            >
                              {unitName}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              {userEmail}
                            </div>
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                padding: "3px 8px",
                                borderRadius: "5px",
                                fontSize: "11px",
                                fontWeight: 600,
                                backgroundColor: badgeColors.bg,
                                color: badgeColors.color,
                              }}
                            >
                              {badgeColors.label}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "10px 12px",
                              color: "#475569",
                              fontSize: "12px",
                              lineHeight: "1.5",
                            }}
                          >
                            {activityDesc}
                          </td>
                          <td style={{ padding: "10px 12px" }}>
                            <code
                              style={{
                                fontSize: "11px",
                                padding: "3px 6px",
                                borderRadius: "3px",
                                backgroundColor: "#f1f5f9",
                                color: "#64748b",
                                fontFamily: "monospace",
                              }}
                            >
                              {formatIpAddress(log.ip_address)}
                            </code>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                backgroundColor: "#ffffff",
                borderRadius: "10px",
                border: "1px solid #e2e8f0",
                boxShadow:
                  "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div
                style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}
              >
                Halaman{" "}
                <strong style={{ color: "#0f172a" }}>{pagination.page}</strong>{" "}
                dari{" "}
                <strong style={{ color: "#0f172a" }}>
                  {pagination.totalPages}
                </strong>{" "}
                • {pagination.total.toLocaleString()} log
              </div>
              <div
                style={{ display: "flex", gap: "6px", alignItems: "center" }}
              >
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: 1 }))
                  }
                  disabled={pagination.page === 1}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor:
                      pagination.page === 1 ? "#f8fafc" : "#ffffff",
                    cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    opacity: pagination.page === 1 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.page !== 1) {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.page !== 1) {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="11 17 6 12 11 7"></polyline>
                    <polyline points="18 17 13 12 18 7"></polyline>
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page === 1}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor:
                      pagination.page === 1 ? "#f8fafc" : "#ffffff",
                    cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    opacity: pagination.page === 1 ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.page !== 1) {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.page !== 1) {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                <div
                  style={{
                    padding: "5px 10px",
                    background:
                      "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
                    borderRadius: "6px",
                    fontWeight: 600,
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                >
                  {pagination.page} / {pagination.totalPages}
                </div>
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor:
                      pagination.page === pagination.totalPages
                        ? "#f8fafc"
                        : "#ffffff",
                    cursor:
                      pagination.page === pagination.totalPages
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    opacity:
                      pagination.page === pagination.totalPages ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.page !== pagination.totalPages) {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.page !== pagination.totalPages) {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: prev.totalPages,
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    backgroundColor:
                      pagination.page === pagination.totalPages
                        ? "#f8fafc"
                        : "#ffffff",
                    cursor:
                      pagination.page === pagination.totalPages
                        ? "not-allowed"
                        : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    opacity:
                      pagination.page === pagination.totalPages ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (pagination.page !== pagination.totalPages) {
                      e.currentTarget.style.borderColor = "#cbd5e1";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (pagination.page !== pagination.totalPages) {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="13 17 18 12 13 7"></polyline>
                    <polyline points="6 17 11 12 6 7"></polyline>
                  </svg>
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "12px",
                }}
              >
                <label style={{ color: "#64748b", fontWeight: 500 }}>
                  Per halaman:
                </label>
                <select
                  value={pagination.pageSize}
                  onChange={(e) =>
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: parseInt(e.target.value),
                      page: 1,
                    }))
                  }
                  style={{
                    padding: "5px 8px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 500,
                    backgroundColor: "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#4f46e5")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                >
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "10px",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                Detail Audit Log
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  color: "#64748b",
                  cursor: "pointer",
                  padding: 0,
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "5px",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Timestamp
                  </div>
                  <div style={{ fontSize: "13px", color: "#1e293b" }}>
                    {formatDate(
                      selectedLog.timestamp || selectedLog.created_at,
                    )}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Tabel
                  </div>
                  <div>
                    <code
                      style={{
                        backgroundColor: "#f1f5f9",
                        padding: "2px 5px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        color: "#1e293b",
                      }}
                    >
                      {selectedLog.table_name || "-"}
                    </code>
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Aksi
                  </div>
                  <div>
                    {(() => {
                      const badgeColors = getActionBadgeColor(
                        selectedLog.action || selectedLog.aksi,
                      );
                      return (
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontSize: "11px",
                            fontWeight: 600,
                            backgroundColor: badgeColors.bg,
                            color: badgeColors.color,
                          }}
                        >
                          {selectedLog.action || selectedLog.aksi}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    User
                  </div>
                  <div style={{ fontSize: "13px", color: "#1e293b" }}>
                    {selectedLog.user_name || selectedLog.username || "-"} (ID:{" "}
                    {selectedLog.user_id})
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    Record ID
                  </div>
                  <div style={{ fontSize: "13px", color: "#1e293b" }}>
                    {selectedLog.record_id || "-"}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    IP Address
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#1e293b",
                      fontFamily: "monospace",
                    }}
                  >
                    {selectedLog.ip_address || "-"}
                  </div>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      marginBottom: "5px",
                    }}
                  >
                    User Agent
                  </div>
                  <div style={{ fontSize: "12px", color: "#1e293b" }}>
                    {selectedLog.user_agent}
                  </div>
                </div>
              )}

              {(() => {
                const summarySentence = getActionSentence(selectedLog);
                if (!summarySentence) return null;

                return (
                  <div
                    style={{
                      marginTop: "20px",
                      paddingTop: "20px",
                      borderTop: "1px solid #e2e8f0",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "15px",
                        fontWeight: 600,
                        color: "#1e293b",
                        marginBottom: "10px",
                      }}
                    >
                      Ringkasan Perubahan
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        color: "#0f172a",
                        fontSize: "13px",
                        lineHeight: "1.6",
                      }}
                    >
                      {summarySentence}
                    </p>
                  </div>
                );
              })()}

              {(selectedLog.description || selectedLog.detail) && (
                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "20px",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#1e293b",
                      marginBottom: "10px",
                    }}
                  >
                    Deskripsi
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      color: "#475569",
                      fontSize: "13px",
                      lineHeight: "1.6",
                    }}
                  >
                    {selectedLog.description || selectedLog.detail}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: "7px 14px",
                  backgroundColor: "#e2e8f0",
                  color: "#1e293b",
                  border: "none",
                  borderRadius: "5px",
                  fontSize: "13px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AuditLogSection;
