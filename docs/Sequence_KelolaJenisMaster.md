# Sequence Diagram: Kelola Jenis Master Data

Diagram ini menggambarkan alur pengelolaan jenis master data (Melihat, Menambah, Mengubah, Menghapus) sesuai dengan proses bisnis dan teknis sistem.

## 1. Melihat Jenis Master Data (Read)

Berdasarkan activity diagram:

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Sistem (Frontend)
    participant Ctrl as Backend (Controller)
    participant DB as Database

    Admin->>UI: Memilih menu "Kelola Jenis Master Data"
    UI->>Ctrl: GET /api/dynamic-master/tables
    Ctrl->>DB: SELECT * FROM master_table_registry
    DB-->>Ctrl: Data Jenis Master
    Ctrl-->>UI: Response Success
    UI-->>Admin: Menampilkan daftar jenis master data
```

## 2. Menambah Jenis Master Data (Create)

Berdasarkan loop validasi dan konfirmasi pada activity diagram:

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Sistem (Frontend)
    participant Ctrl as Backend (Controller)
    participant DB as Database
    participant FS as FileSystem

    Admin->>UI: Klik "Menambah jenis master data"
    UI-->>Admin: Menampilkan form tambah
    
    rect rgb(240, 240, 240)
    Note over Admin, UI: Loop Validasi
    Admin->>UI: Mengisi form & Klik Simpan
    UI->>UI: Apakah data lengkap & sesuai format?
    alt Tidak
        UI-->>Admin: Kembali ke form (pesan error)
    else Ya
        UI-->>Admin: Menampilkan pop-up konfirmasi
    end
    end

    Admin->>UI: Konfirmasi Simpan ("Ya")
    
    UI->>Ctrl: POST /api/dynamic-master/tables
    
    Note over Ctrl, DB: Proses Teknis (CREATE TABLE, FK, Registry)
    Ctrl->>DB: Execute CREATE TABLE
    Ctrl->>DB: INSERT INTO registry & columns
    Ctrl->>FS: Update dynamicTableConfig.json
    
    Ctrl-->>UI: Response Success
    UI-->>Admin: Menampilkan pesan "Data berhasil ditambahkan"
    UI->>UI: Refresh & Menampilkan daftar terbaru
```

## 3. Mengubah Jenis Master Data (Update)

Berdasarkan flow edit pada activity diagram:

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Sistem (Frontend)
    participant Ctrl as Backend (Controller)
    participant DB as Database
    participant FS as FileSystem

    Admin->>UI: Klik "Mengubah data"
    UI-->>Admin: Menampilkan form edit (data eksisting)
    
    rect rgb(240, 240, 240)
    Note over Admin, UI: Loop Validasi
    Admin->>UI: Mengubah data & Klik Simpan
    UI->>UI: Apakah data lengkap & sesuai format?
    alt Tidak
        UI-->>Admin: Kembali ke form (pesan error)
    else Ya
        UI-->>Admin: Menampilkan pop-up konfirmasi edit
    end
    end

    Admin->>UI: Konfirmasi Perubahan ("Ya")
    
    UI->>Ctrl: PUT /api/dynamic-master/tables/:id
    
    Note over Ctrl, DB: Proses Teknis (ALTER TABLE, Registry Update)
    Ctrl->>DB: Execute ALTER TABLE (ADD/DROP/MODIFY)
    Ctrl->>DB: Update registry & re-insert columns
    Ctrl->>FS: Update dynamicTableConfig.json
    
    Ctrl-->>UI: Response Success
    UI-->>Admin: Menampilkan pesan "Perubahan berhasil disimpan"
    UI->>UI: Refresh & Menampilkan daftar terbaru
```

## 4. Menghapus Jenis Master Data (Delete)

Berdasarkan flow hapus pada activity diagram:

```mermaid
sequenceDiagram
    participant Admin
    participant UI as Sistem (Frontend)
    participant Ctrl as Backend (Controller)
    participant DB as Database
    participant FS as FileSystem

    Admin->>UI: Klik "Menghapus jenis master data"
    UI-->>Admin: Menampilkan pop-up konfirmasi hapus
    
    Admin->>UI: Konfirmasi Hapus ("Ya")
    
    UI->>Ctrl: DELETE /api/dynamic-master/tables/:id
    
    Note over Ctrl, DB: Proses Teknis (FK Cleanup, DROP TABLE)
    Ctrl->>DB: Cleanup references (Foreign Keys)
    Ctrl->>DB: DROP TABLE
    Ctrl->>DB: Delete from registry
    Ctrl->>FS: Update dynamicTableConfig.json
    
    Ctrl-->>UI: Response Success
    UI-->>Admin: Menampilkan pesan "Jenis master data berhasil dihapus"
    UI->>UI: Refresh & Menampilkan daftar terbaru
```
