---
resourceId: tool:jsonpath-tester
title: JSONPath Tester
description: Query JSON using properties, recursive descent, slices, wildcards and filters.
category: Developer
tags: [jsonpath, json, query, developer]
icon: i-tabler-brackets
---

## How it works

Paste a JSON document and run a query such as `$.users[*].name`, `$..name` or `$.users[?@.active == true]`. The query is parsed rather than executed as JavaScript. Results are always arrays; optionally include normalized matching paths.

Changing the document or query clears the previous result. Limits: 1 MB input, 4,000 query characters, 10,000 matches and four seconds of background execution. Narrow expensive queries rather than disabling these safeguards.

## Privacy

Your JSON never leaves this browser tab.
