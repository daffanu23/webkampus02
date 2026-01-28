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

// --- 3. EXECUTE ---
document.addEventListener('DOMContentLoaded', () => {
    initDropdowns();
    document.getElementById('btn-search').addEventListener('click', searchData);
});