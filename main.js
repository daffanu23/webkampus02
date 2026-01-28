import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- 1. KONFIGURASI ---
const supabaseUrl = "https://kuksbatlyjmazdhjmdnb.supabase.co";
const supabaseKey = "sb_publishable_umdq1N-nXa9qVoICbrJYkQ_mw9sn-U4"; // Ganti jika perlu
const supabase = createClient(supabaseUrl, supabaseKey);

// --- 2. UTILS (Helper) ---
const getImg = (url) => url ? url : 'https://placehold.co/400x300?text=No+Image';
const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

// --- 3. INIT FILTER DROPDOWNS ---
async function loadDropdowns() {
    const { data: events } = await supabase.from('tbl_m_event').select('nama_event, alamat, tanggal_mulai');
    
    if (!events) return;

    // Ambil Data Unik
    const uniqueNama = [...new Set(events.map(e => e.nama_event))];
    const uniqueLokasi = [...new Set(events.map(e => e.alamat))];
    const uniqueTanggal = [...new Set(events.map(e => e.tanggal_mulai))];

    // Helper untuk isi select
    const fillSelect = (id, data) => {
        const el = document.getElementById(id);
        data.forEach(val => {
            const opt = document.createElement('option');
            opt.value = val;
            opt.textContent = val;
            el.appendChild(opt);
        });
    };

    fillSelect('filter-nama', uniqueNama);
    fillSelect('filter-lokasi', uniqueLokasi);
    fillSelect('filter-tanggal', uniqueTanggal);
}

// --- 4. FITUR PENCARIAN ---
async function searchEvents() {
    const nama = document.getElementById('filter-nama').value;
    const lokasi = document.getElementById('filter-lokasi').value;
    const tgl = document.getElementById('filter-tanggal').value;
    const container = document.getElementById('hasil-container');

    container.innerHTML = "<p class='loading'>Sedang mencari...</p>";

    let query = supabase.from('tbl_m_event').select('*');
    if (nama) query = query.eq('nama_event', nama);
    if (lokasi) query = query.eq('alamat', lokasi);
    if (tgl) query = query.eq('tanggal_mulai', tgl);

    const { data, error } = await query;

    if (error || data.length === 0) {
        container.innerHTML = "<p style='text-align:center; padding:20px;'>Jadwal tidak ditemukan.</p>";
        return;
    }

    container.innerHTML = ""; // Clear
    // Gunakan class grid-4 agar konsisten
    container.className = "grid-4"; 
    
    data.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <div class="card-body">
                    <span style="font-size:12px; font-weight:bold; color:var(--primary);">${item.code_event}</span>
                    <h3 style="margin:10px 0;">${item.nama_event}</h3>
                    <p style="font-size:13px; color:gray;">${item.alamat} (${item.tuk})</p>
                    <p style="font-size:13px; color:red;">${item.tanggal_mulai}</p>
                    <div class="btn-group">
                        <button class="btn-fill">Daftar</button>
                    </div>
                </div>
            </div>`;
    });
}

// --- 5. LOAD EVENT TERDEKAT (4 Box) ---
async function loadUpcomingEvents() {
    const container = document.getElementById('event-container');
    const { data } = await supabase
        .from('tbl_m_event')
        .select('*')
        .order('tanggal_mulai', { ascending: true })
        .limit(4);

    container.innerHTML = "";
    data.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <div class="card-body">
                    <span style="background:#e0f2fe; color:#0284c7; padding:2px 8px; border-radius:4px; font-size:11px; align-self:start;">
                        ${item.code_event}
                    </span>
                    <h3 style="font-size:16px; margin:10px 0;">${item.nama_event}</h3>
                    <p style="font-size:13px; margin-bottom:5px;">${item.alamat}</p>
                    <p style="font-size:13px; color:#d32f2f;">${item.tanggal_mulai}</p>
                    
                    <div class="btn-group">
                        <button class="btn-fill">Daftar</button>
                        <button class="btn-outline">Skema</button>
                    </div>
                </div>
            </div>`;
    });
}

// --- 6. LOAD BERITA (8 Box) ---
async function loadNews() {
    const container = document.getElementById('news-container');
    const { data } = await supabase
        .from('tbl_m_news')
        .select('*')
        .order('tgl_upload', { ascending: false })
        .limit(8);

    container.innerHTML = "";
    data.forEach(item => {
        container.innerHTML += `
            <div class="card">
                <img src="${getImg(item.tbl_pict)}" class="card-img" alt="News">
                <div class="card-body">
                    <small style="color:#888;">${item.tgl_upload || 'Terbaru'}</small>
                    <h4 style="margin:5px 0 10px;">${item.tbl_title}</h4>
                    <p style="font-size:13px; color:#555;">${item.tbl_text.substring(0, 60)}...</p>
                    
                    <div style="margin-top:auto; padding-top:10px;">
                        <a href="news-detail.html?id=${item.id_news}" class="view-all" style="font-size:13px;">
                            Baca Selengkapnya &rarr;
                        </a>
                    </div>
                </div>
            </div>`;
    });
}

// --- 7. LOAD TESTIMONI (3 Box) ---
async function loadTestimoni() {
    const container = document.getElementById('testimoni-container');
    const { data } = await supabase
        .from('tbl_m_testimoni')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

    container.innerHTML = "";
    data.forEach(item => {
        const gambar = item.testimoni_pict ? item.testimoni_pict : 'https://placehold.co/100?text=User';
        container.innerHTML += `
            <div class="card" style="text-align:center; padding:30px;">
                <img src="${gambar}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; margin:0 auto 15px; border:3px solid var(--primary);">
                <h3 style="font-size:18px;">${item.nama}</h3>
                <p style="font-size:12px; color:var(--primary); font-weight:bold; text-transform:uppercase; margin-bottom:15px;">${item.tmpt_kerja}</p>
                <p style="font-style:italic; font-size:14px; color:#555;">"${item.isi_testimoni}"</p>
            </div>`;
    });
}

// --- 9. FITUR DARK MODE ---
function initDarkMode() {
    const btnTheme = document.getElementById('btn-theme');
    const body = document.body;
    
    // Cek apakah user pernah simpan preferensi sebelumnya?
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        btnTheme.textContent = '☀️'; // Ganti ikon jadi matahari
    }

    // Event Listener saat tombol diklik
    btnTheme.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        // Simpan status ke LocalStorage & Ubah Ikon
        if (body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            btnTheme.textContent = '☀️';
        } else {
            localStorage.setItem('theme', 'light');
            btnTheme.textContent = '🌙';
        }
    });
}

// --- 8. EKSEKUSI ---
document.addEventListener('DOMContentLoaded', () => {
    loadDropdowns();
    loadUpcomingEvents();
    loadNews();
    loadTestimoni();
    initDarkMode();
    
    document.getElementById('btn-search').addEventListener('click', searchEvents);
});