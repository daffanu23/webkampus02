import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi (Sama kayak main.js)
const supabaseUrl = "https://kuksbatlyjmazdhjmdnb.supabase.co";
const supabaseKey = "sb_publishable_umdq1N-nXa9qVoICbrJYkQ_mw9sn-U4";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- FUNGSI UTAMA ---
async function loadNewsDetail() {
    // 1. Ambil ID dari URL browser (contoh: ?id=1)
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.body.innerHTML = "<h1>404 - ID Berita tidak ditemukan</h1>";
        return;
    }

    // 2. Fetch data dari Supabase berdasarkan ID
    const { data, error } = await supabase
        .from('tbl_m_news')
        .select('*')
        .eq('id_news', id) // Filter ID
        .single();         // Ambil 1 data saja

    if (error || !data) {
        console.error(error);
        document.getElementById('news-title').innerText = "Berita tidak ditemukan/dihapus.";
        return;
    }

    // 3. Masukkan data ke HTML
    document.title = data.tbl_title + " - LSP Tekno"; // Ubah tab browser
    document.getElementById('news-title').innerText = data.tbl_title;
    document.getElementById('news-author').innerText = data.author || 'Admin'; // Pakai default jika kosong
    document.getElementById('news-date').innerText = new Date(data.tgl_upload).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('news-img').src = data.tbl_pict;
    document.getElementById('news-content').innerText = data.tbl_text;
}

// Fitur Share Button (Copy Link)
document.getElementById('btn-share').addEventListener('click', () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link berita berhasil disalin!');
});

// Jalankan saat load
loadNewsDetail();