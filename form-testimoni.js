import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Konfigurasi Supabase
const supabaseUrl = "https://kuksbatlyjmazdhjmdnb.supabase.co";
const supabaseKey = "sb_publishable_umdq1N-nXa9qVoICbrJYkQ_mw9sn-U4"; 
const supabase = createClient(supabaseUrl, supabaseKey);

const btnKirim = document.getElementById('btn-kirim');
const statusMsg = document.getElementById('status-msg');

btnKirim.addEventListener('click', async () => {
    // 1. Ambil Nilai dari Input
    const nama = document.getElementById('input-nama').value;
    const kerja = document.getElementById('input-kerja').value;
    const pesan = document.getElementById('input-pesan').value;
    const fileInput = document.getElementById('input-foto');
    const file = fileInput.files[0];

    // 2. Validasi Sederhana
    if (!nama || !kerja || !pesan || !file) {
        alert("Mohon lengkapi semua data dan upload foto!");
        return;
    }

    // Tampilkan status Loading
    btnKirim.disabled = true;
    btnKirim.innerText = "Sedang Mengirim...";
    statusMsg.style.color = "blue";
    statusMsg.innerText = "Mengupload gambar...";

    try {
        // 3. Upload Gambar ke Bucket 'profile_pict'
        // Buat nama file unik: timestamp_namafile
        const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`;
        
        // --- PERBAIKAN DI SINI ---
        const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('profile_pict') // <--- NAMA BUCKET DISESUAIKAN
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 4. Ambil Public URL Gambar
        const { data: urlData } = supabase
            .storage
            .from('profile_pict') // <--- INI JUGA HARUS SAMA
            .getPublicUrl(fileName);
            
        const publicUrl = urlData.publicUrl;

        statusMsg.innerText = "Menyimpan ke database...";

        // 5. Simpan Data ke Tabel 'tbl_m_testimoni'
        const { error: dbError } = await supabase
            .from('tbl_m_testimoni')
            .insert({
                nama: nama,
                tmpt_kerja: kerja,
                isi_testimoni: pesan,
                testimoni_pict: publicUrl 
            });

        if (dbError) throw dbError;

        // 6. Sukses!
        statusMsg.style.color = "green";
        statusMsg.innerText = "Berhasil! Terima kasih atas testimoninya.";
        
        // Reset Form
        document.getElementById('input-nama').value = "";
        document.getElementById('input-kerja').value = "";
        document.getElementById('input-pesan').value = "";
        document.getElementById('input-foto').value = "";

        // Redirect balik ke home setelah 2 detik
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);

    } catch (error) {
        console.error(error);
        statusMsg.style.color = "red";
        statusMsg.innerText = "Gagal mengirim: " + error.message;
    } finally {
        btnKirim.disabled = false;
        btnKirim.innerText = "Kirim Testimoni 🚀";
    }
});