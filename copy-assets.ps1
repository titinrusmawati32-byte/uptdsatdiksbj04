# Salin aset gambar dari folder percakapan ke assets/img/
$srcDir = "C:\Users\freza\.gemini\antigravity\brain\ea9c482f-2aba-4222-9c77-05c942a0d028\.user_uploaded"
$destDir = "$PSScriptRoot\assets\img"

if (!(Test-Path $destDir)) {
    New-Item -ItemType Directory -Force -Path $destDir | Out-Null
}

Copy-Item "$srcDir\media_1793512744332_9777c851.png" -Destination "$destDir\logo-gold.png" -Force -ErrorAction SilentlyContinue
Copy-Item "$srcDir\media_1793512782223_cf059509.png" -Destination "$destDir\gedung-sekolah.png" -Force -ErrorAction SilentlyContinue
Copy-Item "$srcDir\media_1793512729615_11f0ce13.png" -Destination "$destDir\banner-header-ref.png" -Force -ErrorAction SilentlyContinue
Copy-Item "$srcDir\media_1793520857572_671f7beb.jpg" -Destination "$destDir\hero-students.jpg" -Force -ErrorAction SilentlyContinue

Write-Host "Berhasil menyalin seluruh aset gambar ke assets/img/!" -ForegroundColor Green
