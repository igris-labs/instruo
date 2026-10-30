---
resourceId: tool:sri-generator
title: SRI Hash Generator
description: Hash pasted content or exact local-file bytes and generate integrity markup.
category: Security
tags: [sri, integrity, security, hash, web]
icon: i-tabler-shield-check
processing: local
capabilityStatus: verified
---

## How it works

Paste resource content or choose a local file up to 25 MB. Choose SHA-256, SHA-384, or SHA-512, then generate a hash. Copy the integrity value or script/stylesheet markup with crossorigin. The URL is used for markup only and is never fetched. Integrity must match the exact bytes served by the resource, including line endings.

## Privacy

Content is hashed locally.
