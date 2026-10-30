---
resourceId: tool:qr-scanner
title: QR Scanner
description: Decode QR images or scan with your camera, then inspect and copy the content locally.
category: Everyday
tags: [qr, scanner, barcode, camera]
icon: i-tabler-scan
---

## Scan a code

Upload a screenshot or image, or start your camera and point it at the full QR code. Image decoding does not depend on the browser's BarcodeDetector API. Camera access requires HTTPS and permission. The camera stops after a successful scan, when the tab becomes hidden, or when you leave the tool.

Use an image below 10 MB and 32 megapixels. The decoder scans at a maximum dimension of 1800 pixels to keep processing bounded. Very small, damaged, stylized, or multi-code images may need a tighter, sharper crop. The tool returns one decoded code at a time.

## Inspect before opening

Decoded text is never executed automatically. Only HTTP/HTTPS destinations get an explicit Open link action. Verify the destination first. Uploaded images and camera frames stay on your device.
