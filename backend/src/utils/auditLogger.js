const pool = require("../config/database");

/**
 * Log audit activity to the database
 * @param {Object} options - Audit log options
 * @param {number} options.userId - User ID performing the action
 * @param {string} options.tableName - Name of the table being affected
 * @param {string} options.action - Action type (CREATE, UPDATE, DELETE, LOGIN, LOGOUT)
 * @param {number} [options.recordId] - ID of the affected record
 * @param {Object} [options.oldValues] - Previous values (for UPDATE)
 * @param {Object} [options.newValues] - New values (for CREATE/UPDATE)
 * @param {Object} [options.changes] - Specific changes made
 * @param {string} [options.detail] - Short detail description
 * @param {string} [options.description] - Longer description
 * @param {string} [options.ipAddress] - IP address of the request
 * @param {string} [options.userAgent] - User agent of the request
 * @returns {Promise<number>} - ID of the created audit log entry
 */
async function logAudit(options) {
  try {
    const {
      userId,
      tableName,
      action,
      recordId = null,
      oldValues = null,
      newValues = null,
      changes = null,
      detail = null,
      description = null,
      ipAddress = null,
      userAgent = null,
    } = options;

    // Validate required fields
    if (!userId) {
      console.error("Audit log: userId is required");
      return null;
    }

    if (!action) {
      console.error("Audit log: action is required");
      return null;
    }

    const query = `
      INSERT INTO audit_log (
        user_id, 
        table_name, 
        action, 
        record_id,
        old_values,
        new_values,
        changes,
        detail,
        description,
        ip_address,
        user_agent,
        aksi
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      tableName || null,
      action,
      recordId,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      changes ? JSON.stringify(changes) : null,
      detail,
      description,
      ipAddress,
      userAgent,
      action, // Copy to aksi field for backward compatibility
    ];

    const [result] = await pool.query(query, values);
    return result.insertId;
  } catch (error) {
    console.error("Error logging audit:", error);
    // Don't throw error - audit logging should not break the main flow
    return null;
  }
}

/**
 * Extract IP address from request
 * @param {Object} req - Express request object
 * @returns {string} - IP address
 */
function getIpAddress(req) {
  let ip = 
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    "unknown";
  
  // Convert IPv6 localhost to IPv4 for readability
  if (ip === "::1" || ip === "::ffff:127.0.0.1") {
    ip = "127.0.0.1";
  }
  
  // Remove ::ffff: prefix from IPv4-mapped IPv6 addresses
  if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7);
  }
  
  return ip;
}

/**
 * Get user agent from request
 * @param {Object} req - Express request object
 * @returns {string} - User agent
 */
function getUserAgent(req) {
  return req.headers["user-agent"] || "unknown";
}

/**
 * Middleware to automatically log audit for certain actions
 * Usage: router.post('/endpoint', auditMiddleware({tableName: 'users', action: 'CREATE'}), controller)
 */
function auditMiddleware(options) {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json
    res.json = function (data) {
      // Log audit after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || req.userId;
        if (userId) {
          logAudit({
            userId,
            tableName: options.tableName,
            action: options.action,
            recordId: data?.data?.id || data?.id || null,
            detail: options.detail,
            description: options.description,
            ipAddress: getIpAddress(req),
            userAgent: getUserAgent(req),
          }).catch((err) => {
            console.error("Audit middleware error:", err);
          });
        }
      }

      // Call original json
      return originalJson(data);
    };

    next();
  };
}

/**
 * Calculate differences between two objects
 * @param {Object} oldObj - Old object
 * @param {Object} newObj - New object
 * @returns {Object} - Object containing only changed fields
 */
function calculateChanges(oldObj, newObj) {
  const changes = {};

  // Check for modified and added fields
  for (const key in newObj) {
    if (oldObj[key] !== newObj[key]) {
      changes[key] = {
        old: oldObj[key],
        new: newObj[key],
      };
    }
  }

  // Check for removed fields
  for (const key in oldObj) {
    if (!(key in newObj)) {
      changes[key] = {
        old: oldObj[key],
        new: undefined,
      };
    }
  }

  return changes;
}

module.exports = {
  logAudit,
  getIpAddress,
  getUserAgent,
  auditMiddleware,
  calculateChanges,
};
