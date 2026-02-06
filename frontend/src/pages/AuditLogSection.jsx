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
          `/api/audit-log?${queryParams.toString()}`
        );

        // Check status code first
        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Server error: ${response.status} - ${error.substring(0, 100)}`);
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
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString("id-ID", { month: "short" });
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
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
    const actor = log.user_name || log.username || `User ${log.user_id}` || "User";
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
        'data_aplikasi': 'aplikasi',
        'users': 'user',
        'master_eselon1': 'eselon 1',
        'master_eselon2': 'eselon 2',
        'master_satker': 'satker',
        'master_upt': 'UPT',
        'pic_internal': 'PIC internal',
        'pic_eksternal': 'PIC eksternal',
        'master_pdn': 'PDN',
        'master_va_pt': 'VA PT',
        'laporan': 'laporan',
      };
      return mapping[table] || table.replace(/_/g, ' ');
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
        if (log.detail && log.detail.toLowerCase().includes('pdf')) {
          return "Export laporan ke PDF";
        } else if (log.detail && log.detail.toLowerCase().includes('excel')) {
          return "Export laporan ke Excel";
        }
        return "Export data";
      default:
        return log.detail || log.description || `Aktivitas pada ${tableLabel}`;
    }
  };

  // Export logs
  const exportLogs = async (format = "csv") => {
    try {
      const queryParams = new URLSearchParams({
        format,
        ...Object.entries(appliedFilters).reduce((acc, [key, value]) => {
          if (value) acc[key] = value;
          return acc;
        }, {}),
      });

      const response = await authFetch(
        `/api/audit-log/export?${queryParams.toString()}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error("Export failed");
      }
    } catch (err) {
      console.error("Error exporting logs:", err);
      alert("Gagal export data: " + err.message);
    }
  };

  return (
    <section id="audit-log" className="page-section">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, marginBottom: '8px', fontSize: '28px', fontWeight: 600, color: '#1e293b' }}>
          Audit Log
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
          Catatan aktivitas sistem untuk keperluan audit dan keamanan
        </p>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Tabel
            </label>
            <input
              type="text"
              name="tableName"
              value={filters.tableName}
              onChange={handleFilterChange}
              placeholder="Nama tabel..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Aksi
            </label>
            <select
              name="action"
              value={filters.action}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="">Semua Aksi</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Tanggal Mulai
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Tanggal Akhir
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#475569', marginBottom: '6px' }}>
              Pencarian
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Cari dalam data..."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={applyFilters} style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            🔍 Terapkan Filter
          </button>
          <button onClick={resetFilters} style={{
            padding: '8px 16px',
            backgroundColor: '#e2e8f0',
            color: '#1e293b',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            🔄 Reset
          </button>
          <button onClick={() => exportLogs("csv")} style={{
            padding: '8px 16px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#991b1b',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px'
          }}>
            Memuat data audit log...
          </div>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ fontSize: '32px' }}>📊</div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b' }}>
                {pagination.total}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>
                Total Log Tercatat
              </div>
            </div>
          </div>

          {/* Table */}
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
            marginBottom: '20px'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '14px'
              }}>
                <thead>
                  <tr style={{
                    backgroundColor: '#f8fafc',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', width: '180px' }}>Waktu</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', width: '250px' }}>Unit</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', width: '120px' }}>Aksi</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Detail Aktivitas</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', width: '140px' }}>IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{
                        padding: '40px',
                        textAlign: 'center',
                        color: '#64748b'
                      }}>
                        Tidak ada data audit log
                      </td>
                    </tr>
                  ) : (
                    logs.map((log, index) => {
                      const badgeColors = getActionBadgeColor(log.action || log.aksi);
                      const activityDesc = getActivityDescription(log);
                      const unitName = log.user_role || log.user_name || '-';
                      const userEmail = log.user_email || '';
                      
                      return (
                        <tr key={log.id} style={{
                          borderBottom: '1px solid #e2e8f0',
                          backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                          cursor: 'pointer'
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f8fafc'}
                          onClick={() => viewLogDetails(log)}
                        >
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontSize: '13px', fontWeight: 500 }}>
                            {formatDate(log.timestamp || log.created_at)}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '2px' }}>
                              {unitName}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b' }}>
                              {userEmail}
                            </div>
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 12px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: 600,
                              backgroundColor: badgeColors.bg,
                              color: badgeColors.color
                            }}>
                              {badgeColors.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#1e293b', fontSize: '14px' }}>
                            {activityDesc}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                            {formatIpAddress(log.ip_address)}
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
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{ fontSize: '14px', color: '#475569' }}>
                Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total log)
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: 1 }))}
                  disabled={pagination.page === 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: pagination.page === 1 ? '#f3f4f6' : 'white',
                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ⏮️
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: pagination.page === 1 ? '#f3f4f6' : 'white',
                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ◀️
                </button>
                <span style={{ padding: '0 12px', fontWeight: 500, color: '#1e293b' }}>
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: pagination.page === pagination.totalPages ? '#f3f4f6' : 'white',
                    cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ▶️
                </button>
                <button
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.totalPages }))}
                  disabled={pagination.page === pagination.totalPages}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: pagination.page === pagination.totalPages ? '#f3f4f6' : 'white',
                    cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ⏭️
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <label>Per halaman:</label>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => setPagination((prev) => ({
                    ...prev,
                    pageSize: parseInt(e.target.value),
                    page: 1,
                  }))}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
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
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#1e293b' }}>
                Detail Audit Log
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: 0,
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '20px',
                marginBottom: '24px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Timestamp
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    {formatDate(selectedLog.timestamp || selectedLog.created_at)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Tabel
                  </div>
                  <div>
                    <code style={{
                      backgroundColor: '#f1f5f9',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '13px',
                      color: '#1e293b'
                    }}>
                      {selectedLog.table_name || '-'}
                    </code>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Aksi
                  </div>
                  <div>
                    {(() => {
                      const badgeColors = getActionBadgeColor(selectedLog.action || selectedLog.aksi);
                      return (
                        <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 600,
                          backgroundColor: badgeColors.bg,
                          color: badgeColors.color
                        }}>
                          {selectedLog.action || selectedLog.aksi}
                        </span>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    User
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    {selectedLog.user_name || selectedLog.username || '-'} (ID: {selectedLog.user_id})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Record ID
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>
                    {selectedLog.record_id || '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    IP Address
                  </div>
                  <div style={{ fontSize: '14px', color: '#1e293b', fontFamily: 'monospace' }}>
                    {selectedLog.ip_address || '-'}
                  </div>
                </div>
              </div>

              {selectedLog.user_agent && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                    User Agent
                  </div>
                  <div style={{ fontSize: '13px', color: '#1e293b' }}>
                    {selectedLog.user_agent}
                  </div>
                </div>
              )}

              {(() => {
                const summarySentence = getActionSentence(selectedLog);
                if (!summarySentence) return null;

                return (
                  <div style={{
                    marginTop: '24px',
                    paddingTop: '24px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                      Ringkasan Perubahan
                    </h4>
                    <p style={{ margin: 0, color: '#0f172a', fontSize: '14px', lineHeight: '1.6' }}>
                      {summarySentence}
                    </p>
                  </div>
                );
              })()}

              {(selectedLog.description || selectedLog.detail) && (
                <div style={{
                  marginTop: '24px',
                  paddingTop: '24px',
                  borderTop: '1px solid #e2e8f0'
                }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                    Deskripsi
                  </h4>
                  <p style={{ margin: 0, color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>
                    {selectedLog.description || selectedLog.detail}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#e2e8f0',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
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
