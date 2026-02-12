-- Add order_index column to format_laporan_detail table
-- This will track the order in which fields were selected by the user

ALTER TABLE format_laporan_detail 
ADD COLUMN order_index INT DEFAULT 0 AFTER field_id;

-- Update existing records to have sequential order based on id
SET @row_number = 0;
UPDATE format_laporan_detail 
SET order_index = (@row_number:=@row_number + 1)
ORDER BY format_laporan_id, id;

-- Add index for better query performance
CREATE INDEX idx_format_order ON format_laporan_detail(format_laporan_id, order_index);
