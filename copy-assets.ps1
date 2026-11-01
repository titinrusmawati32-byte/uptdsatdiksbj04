# Script PowerShell untuk menyalin aset gambar referensi ke folder assets/img/
$sourceDir = "C:\Users\freza\.gemini\antigravity\brain\ea9c482f-2aba-4222-9c77-05c942a0d028\.user_uploaded"
$targetDir = "$PSScriptRoot\assets\img"

if (!(Test-Path $targetDir)) {
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
}

$files = @{
    "media_1793512744332_9777c851.png" = "logo-gold.png"
    "media_1793512782223_cf059509.png" = "gedung-sekolah.png"
    "media_1793512729615_11f0ce13.png" = "banner-header-ref.png"
    "media_1793520857572_671f7beb.jpg" = "hero-students.jpg"
}

foreach ($src in $files.Keys) {
    $srcPath = Join-Path $sourceDir $src
    $dstPath = Join-Path $targetDir $files[$src]
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $dstPath -Force
        Write-Host "Berhasil menyalin $src -> $($files[$src])" -ForegroundColor Green
    } else {
        Write-Host "File $srcPath tidak ditemukan, melewatkan." -ForegroundColor Yellow
    }
}

# Salin logo-gold.png juga sebagai logo.png
if (Test-Path (Join-Path $targetDir "logo-gold.png")) {
    Copy-Item -Path (Join-Path $targetDir "logo-gold.png") -Destination (Join-Path $targetDir "logo.png") -Force
    Write-Host "Berhasil menyalin logo-gold.png -> logo.png" -ForegroundColor Green
}

Write-Host "Semua aset siap digunakan!" -ForegroundColor Cyan
