import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- KONFIGURASI ---
const supabaseUrl = "https://kuksbatlyjmazdhjmdnb.supabase.co";
const supabaseKey = "sb_publishable_umdq1N-nXa9qVoICbrJYkQ_mw9sn-U4";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 1. LOAD DROPDOWN ---
async function initDropdowns() {
    // Ambil data untuk isi dropdown
    const { data: events, error } = await supabase
        .from('tbl_m_event')
        .select('nama_event, alamat, tanggal_mulai');

    if (error) {
        console.error("Error dropdown:", error);
        return;
    }

    // Filter data unik
    const uniqueNama = [...new Set(events.map(e => e.nama_event))];
    const uniqueLokasi = [...new Set(events.map(e => e.alamat))];
    const uniqueTanggal = [...new Set(events.map(e => e.tanggal_mulai))];

    // Isi HTML Dropdown
    const selNama = document.getElementById('filter-nama');
    const selLokasi = document.getElementById('filter-lokasi');
    const selTanggal = document.getElementById('filter-tanggal');

    uniqueNama.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        selNama.appendChild(opt);
    });

    uniqueLokasi.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        selLokasi.appendChild(opt);
    });

    uniqueTanggal.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        selTanggal.appendChild(opt);
    });
}

// --- 2. LOGIKA SEARCH ---
async function searchData() {
    const nama = document.getElementById('filter-nama').value;
    const lokasi = document.getElementById('filter-lokasi').value;
    const tanggal = document.getElementById('filter-tanggal').value;
    const container = document.getElementById('hasil-container');

    container.textContent = "Sedang mencari...";

    // Query Database
    let query = supabase.from('tbl_m_event').select('*');

    // Filter Mengerucut
    if (nama) query = query.eq('nama_event', nama);
    if (lokasi) query = query.eq('alamat', lokasi);
    if (tanggal) query = query.eq('tanggal_mulai', tanggal);

    const { data, error } = await query;

    if (error) {
        container.textContent = "Error: " + error.message;
        return;
    }

    if (data.length === 0) {
        container.textContent = "Data tidak ditemukan.";
        return;
    }

    // Render Hasil (Plain HTML)
    container.innerHTML = ""; // Kosongkan dulu
    
    data.forEach(item => {
        // Membuat elemen tampilan sederhana
        const div = document.createElement('div');
        div.style.marginBottom = "20px"; // Sedikit jarak antar item biar terbaca
        div.style.borderBottom = "1px solid black";
        
        // Perhatikan penulisan kolom sesuai SQL kamu (code_event, deksripsi)
        div.innerHTML = `
            <h3>${item.nama_event}</h3>
            <p>Kode: ${item.code_event}</p>
            <p>Lokasi: ${item.alamat} (${item.tuk})</p>
            <p>Tanggal: ${item.tanggal_mulai} s/d ${item.tanggal_selesai}</p>
            <p>Deskripsi: ${item.deksripsi}</p>
        `;
        
        container.appendChild(div);
    });
}

// --- FUNGSI LOAD EVENT TERDEKAT (4 BOX) ---
async function loadUpcomingEvents() {
    const container = document.getElementById('event-container');

    // Query: Ambil 4 event, urutkan tanggal mulai dari yang paling dekat (Ascending)
    // Filter .gte('tanggal_mulai', new Date().toISOString()) digunakan jika ingin HANYA event masa depan
    // Tapi untuk demo data dummy, kita pakai order biasa saja dulu.
    const { data: eventData, error } = await supabase
        .from('tbl_m_event')
        .select('*')
        .order('tanggal_mulai', { ascending: true }) 
        .limit(4);

    if (error) {
        console.error("Gagal event:", error);
        container.innerHTML = "<p>Gagal memuat event.</p>";
        return;
    }

    container.innerHTML = "";

    eventData.forEach(item => {
        const card = document.createElement('div');
        
        // Styling Box Event (Mirip Berita tapi ada tombol di bawah)
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "8px";
        card.style.padding = "15px";
        card.style.backgroundColor = "#f9f9f9";
        card.style.display = "flex";       // Flexbox untuk mengatur layout dalam box
        card.style.flexDirection = "column"; // Susun ke bawah
        card.style.justifyContent = "space-between"; // Dorong tombol ke paling bawah
        card.style.minHeight = "200px";

        card.innerHTML = `
            <div>
                <span style="background: #e0f2fe; color: #0284c7; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${item.code_event}
                </span>
                <h3 style="margin: 10px 0; font-size: 16px;">${item.nama_event}</h3>
                <p style="margin: 5px 0; font-size: 13px; color: #555;">📍 ${item.alamat}</p>
                <p style="margin: 5px 0; font-size: 13px; color: #d32f2f;">📅 ${item.tanggal_mulai}</p>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 15px;">
                <button onclick="alert('Mendaftar ke event: ${item.nama_event}')" style="flex: 1; padding: 8px; background: #0088cc; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Daftar Sekarang
                </button>
                <button onclick="alert('Lihat detail skema...')" style="flex: 1; padding: 8px; background: white; color: #0088cc; border: 1px solid #0088cc; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    Lihat Skema
                </button>
            </div>
        `;

        container.appendChild(card);
    });
}

async function loadNews() {
    const container = document.getElementById('news-container');

    // UPDATE: Order by 'tgl_upload' descending (Terbaru ke Terlama)
    const { data: newsData, error } = await supabase
        .from('tbl_m_news')
        .select('*')
        .order('tgl_upload', { ascending: false }) 
        .limit(8);

    if (error) {
        console.error("Gagal ambil berita:", error);
        container.innerHTML = "<p>Gagal memuat berita.</p>";
        return;
    }

    container.innerHTML = "";

    newsData.forEach(item => {
        const card = document.createElement('div');
        
        card.style.border = "1px solid #ccc";
        card.style.borderRadius = "8px";
        card.style.overflow = "hidden";
        card.style.padding = "10px";
        card.style.backgroundColor = "#fff";

        // UPDATE: Saya tambahkan tampilan Tanggal (item.tgl_upload)
        card.innerHTML = `
            <img src="${item.tbl_pict}" alt="${item.tbl_title}" style="width:100%; height:150px; object-fit:cover; border-radius:4px;">
            <div style="margin-top: 10px;">
                <small style="color: #888; font-size: 12px;">📅 ${item.tgl_upload}</small>
                <h4 style="margin: 5px 0;">${item.tbl_title}</h4>
                <p style="font-size: 14px; color: #555;">${item.tbl_text.substring(0, 60)}...</p>
            </div>
        `;

        container.appendChild(card);
    });
}

// --- FUNGSI LOAD TESTIMONI (REVISI) ---
async function loadTestimoni() {
    const container = document.getElementById('testimoni-container');

    // Ambil 3 data terbaru berdasarkan waktu dibuat (created_at)
    const { data: testimoniData, error } = await supabase
        .from('tbl_m_testimoni')
        .select('*')
        .order('created_at', { ascending: false }) 
        .limit(3);

    if (error) {
        console.error("Error Testimoni:", error); // Cek console jika error
        container.innerHTML = "<p>Gagal memuat testimoni.</p>";
        return;
    }

    container.innerHTML = ""; // Bersihkan loading text

    testimoniData.forEach(item => {
        const card = document.createElement('div');
        
        // Styling Kartu
        card.style.border = "1px solid #ddd";
        card.style.borderRadius = "12px";
        card.style.padding = "20px";
        card.style.backgroundColor = "#fff";
        card.style.textAlign = "center";
        card.style.boxShadow = "0 2px 5px rgba(0,0,0,0.05)";

        // Cek jika gambar kosong/null, pakai placeholder
        const gambar = item.testimoni_pict ? item.testimoni_pict : 'https://placehold.co/100?text=No+Img';

        // Susunan Hierarki: Foto -> Nama -> Kerja -> Isi
        card.innerHTML = `
            <img src="${gambar}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 15px; border: 2px solid #0088cc;">
            
            <h3 style="margin: 0; color: #333;">${item.nama}</h3>
            
            <p style="margin: 5px 0 15px; font-size: 12px; color: #0088cc; font-weight: bold; text-transform: uppercase;">
                ${item.tmpt_kerja}
            </p>
            
            <p style="margin: 0; font-style: italic; color: #555; font-size: 14px;">
                "${item.isi_testimoni}"
            </p>
        `;

        container.appendChild(card);
    });
}

// --- 3. EXECUTE ---
document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    loadUpcomingEvents();
    loadNews();
    loadTestimoni();
    document.getElementById('btn-search').addEventListener('click', searchData);
});