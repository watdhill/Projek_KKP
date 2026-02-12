-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  table_name VARCHAR(100),
  action VARCHAR(50) COMMENT 'CREATE, UPDATE, DELETE, LOGIN, LOGOUT',
  record_id INT,
  old_values JSON,
  new_values JSON,
  changes JSON,
  detail TEXT,
  description TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  aksi VARCHAR(100) COMMENT 'Deprecated: use action instead',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_table_name (table_name),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add comment to table
ALTER TABLE audit_log COMMENT = 'Stores all system activity logs for audit purposes';
