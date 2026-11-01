@echo off
set "SOURCE=C:\Users\freza\.gemini\antigravity\brain\ea9c482f-2aba-4222-9c77-05c942a0d028\.user_uploaded"
set "TARGET=%~dp0assets\img"

if not exist "%TARGET%" mkdir "%TARGET%"

copy /y "%SOURCE%\media_1793512744332_9777c851.png" "%TARGET%\logo-gold.png"
copy /y "%SOURCE%\media_1793512744332_9777c851.png" "%TARGET%\logo.png"
copy /y "%SOURCE%\media_1793512782223_cf059509.png" "%TARGET%\gedung-sekolah.png"
copy /y "%SOURCE%\media_1793512729615_11f0ce13.png" "%TARGET%\banner-header-ref.png"
copy /y "%SOURCE%\media_1793520857572_671f7beb.jpg" "%TARGET%\hero-students.jpg"

echo [SUKSES] Semua aset gambar berhasil disalin ke folder assets\img\!
