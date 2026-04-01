---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Project
Index:
  - "[[Cracked Ideas]]"
Topic: 
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---
## Re-generating Expert Block

Instructions_1
```
The following prompt to the ${Expert} agent returned incorrectly; make modifications to the expert object that could help remedy future prompts (from all patients, not just the one related to the missed answer). Utilize the Notes field in the metadata to provide instruction clarifications if needed. Do not include specific examples of patient information, keep general unless the examples just need to be added to acceptable answer choices. Context from reviewer ${Latest Comment} --- Extraction prompt: "${Instructions_4}" Arbitration Prompt: "${Instructions_!}" Expert's Object: "${Expert's Object}" Expert's Object Creation Guidelines: "${Instructions_2}" --- Remember, the following prompt to the ${Expert} agent returned incorrectly; you are to make modifications to the expert object that could help remedy future prompts (from all patients, not just the one related to the missed answer). Utilize the Notes field in the metadata to provide instruction clarifications from the following context. Do not include specific examples of patient information, keep general unless the examples are to be added to acceptable answer choices, pattern matches, or avoid patterns (useful for blacklisting things as needed, please use it). Context from reviewer ${Latest Comment}
```

Instructions_! (old arbitration prompt)
```
Review the 4 expert responses in ${Answer Array}. Extract the "value_found" value from each response. Count how many experts found the same value: - If 3 or 4 experts agree on the same value → return that exact value - If 2 or fewer experts agree on any value → return: No Match Found Rules: - Count null as agreement if 3+ experts returned null - Match values exactly (case-sensitive) - Ignore status, confidence scores and notes Output ONLY the value or "No Match Found" No JSON, no formatting, no explanation. Just the raw text answer. Examples: If 4 experts found "ROBERT" → Output: ROBERT If 3 experts found "P000012345" → Output: P000012345 If 2 found "Male", 2 found "M" → Output: No Match Found If 3 experts found null → Output: No Match Found
```
Instructions_2
```
You are a Skilled Nursing Facility Intake Expert specializing in field-level metadata design. TASK: Generate a complete field definition JSON object for the "${Expert}" field in the "${Table}" table. CONTEXT INFORMATION: Domain Rules: "${Domain Rules}" Domain Object: "${Domain Object}" What is often done wrong in the extraction of this field that needs to be accounted for: "${Latest Comment}" OUTPUT REQUIREMENTS: - Return ONLY valid JSON (no markdown, no comments) - FLAT structure - all fields at root level - All values must be strings - Use "(null)" for empty values - Use pipe (|) delimiter for multiple values MANDATORY TEMPLATE - Include ALL fields: ${Instructions_3} INSTRUCTION: Generate the complete JSON for "${Expert}" with all fields exactly as shown in the template. Apply the table rules, critical generation rules, and context to determine appropriate values for each field.
```
Instructions_3
```
{ "field_name": "<name>", "table_name": "<your_table>", "domain_object": "<optional_domain_object>", "field_sequence": 1, "data_type": "string|integer|decimal|boolean|date|datetime|json", "format": "alphanumeric|numeric|email|uuid|url|iso8601|enum", "max_length": null, "min_length": null, "required": "Y|N", "nullable": "Y|N", "unique": "Y|N", "valid_values": null, "default_value": null, "field_definition": "<what this field means>", "business_purpose": "<why it exists>", "user_impact": "<what breaks if wrong>", "examples": { "example_value_1": "", "example_value_2": "", "example_value_3": "" }, "matching": { "exact_patterns": "", "semantic_patterns": "", "regex_pattern": "", "avoid_patterns": "<what is often around the values to be ex>", "typical_position": "<what is often around the values to be extracted>" }, "transform_logic": null, "null_handling": "ERROR|COERCE|DEFAULT|IGNORE", "cleaning_rule": null, "value_mapping": null, "calculation": null, "validation": { "format_validation": null, "range_validation": null, "length_validation": null, "lookup_validation": null, "cross_field_check": null }, "relationships": { "parent_table": null, "parent_field": null, "required_with_fields": null, "conflicts_with_fields": null, "foreign_key": null }, "severity": { "missing_severity": "INFO|WARN|ERROR|CRITICAL", "invalid_severity": "INFO|WARN|ERROR|CRITICAL", "error_action": "REJECT|FLAG|DEFAULT|QUARANTINE", "error_message": "" }, "governance": { "pii_flag": "Y|N", "encryption_required": "Y|N", "audit_required": "Y|N", "compliance_rule": "", "retention_years": null }, "scoring": { "exact_match_score": 100, "semantic_match_score": 90, "position_match_score": 80, "pattern_match_score": 85 }, "metadata": { "version": "2.0", "created_date": "10-14-2025", "modified_date": "10-22-2025", "created_by": "Landon Dahle", "notes": "<what is often done incorrectly and needs to be kept in mind when running extractions>" } }
```
Instructions_4
```
You are an Expert SNF Intake nurse specializing in the "${Expert}" field. Your task is to locate the value for "${Expert}" from the provided intake documents. The extractions are from photocopies and may have OCR quality issues. Take your time and be meticulous. INSTRUCTIONS: 1. Study the rules for your section 2. Understand your target field requirements 3. Search through the extracted text accounting for OCR errors 4. Return ONLY a JSON response - no additional text, comments or markdown OCR CONSIDERATIONS: - Common OCR errors: 0/O, 1/l/I, 5/S, 8/B, rn/m - Text may break across lines unexpectedly - Look for partial matches and variations ================ SEARCH STRATEGIES: - Look for exact patterns: - Check semantic patterns: - Common locations: - Avoid false matches: INPUT DATA: ================ YOUR FIELD SPECIFICATIONS: (expert object) _________________________________________________ RULES FOR THIS SECTION: "${Domain Rules}" _________________________________________________ EXTRACTED PDF CONTENT: (OCR'd pdf content) _________________________________________________ RESPONSE FORMAT: { "target_field": "${Expert}", "value_found": "<extracted value or null>", "status": "<FOUND|NOT_FOUND>", "location_context": "<surrounding text, max 50 chars>", "page_reference": "<nearest section identifier>", "notes": "<extraction method or issues>" } ___________________________________________________________ CRITICAL RULES: - Never guess or infer values not explicitly present - For PHI/PII fields, ensure exact extraction without modification Return strict JSON only.
```

### Results:
little to no observable change, some might have modified slightly, we shall see if any effect though
*** the fucking "Latest Comment" field truncated the comments so nothing was being parsed, bullshit feature


## Generating Extraction Notes
Accidentally didn't use the above, rather below
```
The following prompt to the agent that is to extract the ${Expert} field from the patient data returned incorrectly; make a new object that could help remedy future prompts (from all patients, not just the one related to the missed answer). Utilize the Notes field in the metadata to provide instruction clarifications if needed. Do not include specific examples of patient information, keep general unless the examples just need to be added to acceptable answer choices. Extraction prompt: "${Instructions_4}" Expert's Object: "${Expert's Object}" Domain Object: "${Domain Object}" Domain Rules: "${Domain Rules}" --- Given the extraction prompting details, what further information / extraction criteria would be required by the agent to make a better extraction given the following context of mistakes being made? Do not just repeat the notes from the metadata, only build the modification instructions based on the following context: Context from reviewer regarding this specific field: "${Extraction Problems}" Return only a succinct JSON block of {"extraction_notes":"<insert your notes>}
```

Returned a new column that I'm just going to append to the expert object in final prompting.
Ideating on self learning mechanism; add a prompt to the run to take in the extraction notes and add to it if it had trouble finding the data or if the data was found outside of the norm. This could spiral out of hand quickly, so implement a QC / review process with human in loop for this; have it just store these modifications and can approve / deny requests perhaps?

## Fix Arbitration Prompt

GPT conversation: https://chatgpt.com/share/68f928c9-248c-800b-9a4c-33c15d7c4a46

### Result:
```
You are the ARBITER.

INPUTS
- target_field: ${target_field}
- Answer Array (exactly 4 items) in concatenated JSON form: ${Answer Array}
  • This is four JSON objects back-to-back with no commas. You MUST parse them.
- Expert’s Object (contains defaults/templates for fields): ${Expert's Object}

YOUR GOAL
Return ONE final value for target_field by strict consensus voting with format-aware normalization.
If no ≥3-way agreement is reached, return "No Match Found".

ALLOWED OUTPUT
- Output EXACTLY one line: either the agreed value OR "No Match Found".
- No JSON, no quotes, no labels, no extra spaces/lines.

------------------------------------------------------------
A) PARSE THE ANSWERS
1) Convert the concatenated objects into an array of 4 JSON objects:
   - Detect object boundaries by balanced braces. Insert commas between objects.
   - Then wrap with [ ... ] and parse as JSON.
2) For each of the 4 objects, extract:
   - value_found (may be null/empty)
   - optional: location_context, page_reference, notes (strings; may be empty)

------------------------------------------------------------
B) DEFAULT / NULL HANDLING
1) Determine the default/template value for target_field from ${Expert's Object}. If none is defined, skip this step.
2) Treat a candidate as NULL (ignore it for positive voting) if ANY of the following are true:
   - value_found is null, "null", "", "n/a", "na", "unknown" (any case), or only whitespace.
   - value_found exactly equals the default/template value for target_field from ${Expert's Object}.
3) If, after this rule, ≥3 candidates are NULL → Output "No Match Found".

------------------------------------------------------------
C) NORMALIZATION (GENERAL, FIELD-AGNOSTIC)
Apply these purely for COMPARISON (do not over-normalize the display form):
1) Trim and collapse whitespace; remove surrounding quotes.
2) Case-insensitive comparison: compare values ignoring case. (Preserve natural casing for output—see E.)
3) Punctuation/spacing normalization:
   - Normalize consecutive spaces/hyphens/underscores to single separators.
   - Ignore trailing periods.
4) Numeric-heavy strings (e.g., IDs, phones, ZIP-like):
   - For comparison, strip all non-digits if ≥70% of characters are digits across candidates.
   - Keep leading ‘1’ if present. (This is only for comparison; see E for output.)
5) Date-like strings:
   - If a value parses as a date (common formats or ISO), normalize to ISO (YYYY-MM-DD) for comparison.
6) List-like values:
   - If a value contains clear delimiters (semicolon or newline or comma) producing multiple items,
     split into items, trim/normalize each item with the same rules.
   - Comparison is then done per ITEM (see D.2).

Note: Normalization is strictly to improve matching. If two items still differ after normalization, they are different.

------------------------------------------------------------
D) VOTING LOGIC
1) Scalar (single-value) case:
   - After normalization, count votes for each distinct candidate among the 4.
   - If any candidate has ≥3 votes → that candidate wins.
   - Otherwise → "No Match Found".

2) List-like case:
   - Convert each response into a SET of normalized items (Section C.6).
   - Compute frequency of each normalized item across the 4 sets.
   - Keep only items with frequency ≥3 (appearing in at least 3 of the 4).
   - If at least one item survives:
       • Sort surviving items in a stable, human-obvious way:
         - If items start with a date, sort by date ascending; else lexicographically by the normalized form.
       • For OUTPUT FORM of each item, pick the most common original rendition among contributors of that item.
       • Join items with " ; " (space-semicolon-space) into one line and output.
     Else → "No Match Found".

Heuristic to decide scalar vs list-like:
- Treat as list-like if ≥2 responses contain a clear delimiter (semicolon/newline/comma) that yields >1 items.

------------------------------------------------------------
E) OUTPUT FORM (WHEN A WINNER EXISTS)
When a scalar candidate wins (≥3 votes):
- Case: use the most common casing variant among the votes for that candidate.
- Numbers/IDs: if digit-stripping was used, prefer the most complete, most consistently formatted original among the winning votes.
- Dates: if date normalization was used and at least one winning vote is ISO (YYYY-MM-DD), use that ISO form; otherwise use the majority’s most consistent format.
- Whitespace: collapse to single spaces; no leading/trailing spaces.

For list-like winners:
- Use the item-level “most common original rendition” rule above, then join with " ; ".

------------------------------------------------------------
F) TIES, CONFLICTS, EDGE CASES
- If two (or more) different normalized candidates each have exactly 2 votes → "No Match Found".
- If a candidate wins but ONLY because disallowed defaults were counted, re-check: defaults never contribute to positive votes.
- If all four are distinct after normalization → "No Match Found".
- If parsing fails for one object, treat that object’s value as NULL (do not crash; continue).

------------------------------------------------------------
G) FINAL STEP
- Output exactly ONE line: either the resolved value or "No Match Found".
- No JSON, no extra text.

Proceed now.
```

Again, we shall see how this helps...


## Extraction Prompt Modification

Very minimal modifications

```
You are an Expert SNF Intake nurse specializing in the "${Expert}" field. Your task is to locate the value for "${Expert}" from the provided intake documents. The extractions are from photocopies and may have OCR quality issues. There are two different extractions of the same patient record. Look at both to see if you can find the best answer for your field. Take your time and be meticulous. INSTRUCTIONS: 1. Study the rules for your section 2. Understand your target field requirements 3. Search through the extracted text accounting for OCR errors 4. Return ONLY a JSON response - no additional text, comments or markdown OCR CONSIDERATIONS: - Common OCR errors: 0/O, 1/l/I, 5/S, 8/B, rn/m - Text may break across lines unexpectedly - Look for partial matches and variations ================ SEARCH STRATEGIES: - Look for exact patterns: - Check semantic patterns: - Common locations: - Avoid false matches: INPUT DATA: ================ YOUR FIELD SPECIFICATIONS: "${Expert's Object}" _________________________________________________ ADDITIONAL PRECAUTIONS FOR EXTRACTION: "${Extraction Notes}" _________________________________________________ RULES FOR THIS SECTION: "${Domain Rules}" _________________________________________________ EXTRACTED PDF CONTENT: ${block.Medical Reports - RAW Extractions.Marquis Admission Packet 3} _________________________________________________ RESPONSE FORMAT: { "target_field": "${Expert}", "value_found": "<extracted value or null>", "status": "<FOUND|NOT_FOUND>", "location_context": "<surrounding text, max 50 chars>", "page_reference": "<nearest section identifier>", "notes": "<extraction method or issues>" } ___________________________________________________________ CRITICAL RULES: - Never guess or infer values not explicitly present - For PHI/PII fields, ensure exact extraction without modification Return strict JSON only.
```