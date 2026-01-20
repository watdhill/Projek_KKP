-- Split kontak column into email_pic and no_hp_pic for pic_internal
ALTER TABLE pic_internal ADD COLUMN email_pic VARCHAR(100) AFTER nama_pic_internal;
ALTER TABLE pic_internal ADD COLUMN no_hp_pic VARCHAR(20) AFTER email_pic;

-- Split kontak column into email_pic and no_hp_pic for pic_eksternal
ALTER TABLE pic_eksternal ADD COLUMN email_pic VARCHAR(100) AFTER nama_pic_eksternal;
ALTER TABLE pic_eksternal ADD COLUMN no_hp_pic VARCHAR(20) AFTER email_pic;

-- Optional: Copy data from old kontak column to new columns if possible
-- This is hard to do automatically perfectly, but we'll leave the old columns for now
-- so users can migrate manually or we can provide a more complex script later.
