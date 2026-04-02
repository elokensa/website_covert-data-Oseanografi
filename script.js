// 1. Fungsi Pindah Halaman (Landing ke Dashboard)
function openPortal() {
    document.getElementById('landing-container').style.display = 'none';
    document.getElementById('portal').style.display = 'block';
    window.scrollTo(0, 0);
}

// 2. Fungsi Gambar Grafik (Reusable)
function createChart(id, labels, datasets) {
    const canvas = document.getElementById(id);
    if (!canvas) return; // Guard jika element tidak ada
    
    const ctx = canvas.getContext('2d');
    
    // Hapus chart lama agar tidak error saat upload file baru
    if (window[id + 'Chart']) {
        window[id + 'Chart'].destroy();
    }

    window[id + 'Chart'] = new Chart(ctx, {
        type: 'line',
        data: { labels: labels, datasets: datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#202124' } }
            },
            scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: false }
            },
            elements: {
                point: { radius: 0 }, // Menghilangkan titik agar garis halus
                line: { tension: 0.2, borderWidth: 2 }
            }
        }
    });
}

// 3. Fungsi Utama (Dipicu saat klik tombol Run Script)
async function runAnalysis() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        alert("Pilih file CSV dulu ya!");
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        // Panggil Backend Flask
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();

        if (data.error) {
            alert("Error di Server: " + data.error);
            return;
        }

        // Tampilkan Area Hasil
        document.getElementById('results-area').style.display = 'block';
        
        // Update Angka Statistik
        document.getElementById('m-msl').innerText = data.msl_val + " m";
        document.getElementById('m-temp').innerText = data.stats.avg_temp + " °C";

        // Gambar Grafik satu per satu (Berjajar ke bawah)
        createChart('cWater', data.time, [
            { label: 'Water Level (m)', data: data.water, borderColor: '#1a73e8', backgroundColor: 'rgba(26, 115, 232, 0.1)', fill: true },
            { label: 'MSL Ref', data: data.msl_line, borderColor: '#ea4335', borderDash: [5, 5] }
        ]);

        createChart('cTemp', data.time, [
            { label: 'Temperature (°C)', data: data.temp, borderColor: '#fbbc04' }
        ]);

        createChart('cWind', data.time, [
            { label: 'Wind Speed (m/s)', data: data.wind, borderColor: '#34a853' }
        ]);

        createChart('cPress', data.time, [
            { label: 'Pressure (hPa)', data: data.press, borderColor: '#8ab4f8' }
        ]);

        // Scroll otomatis ke grafik
        document.getElementById('results-area').scrollIntoView({ behavior: 'smooth' });

    } catch (err) {
        console.error(err);
        alert("Gagal konek ke server. Pastikan Flask (app.py) sudah jalan!");
    }
}