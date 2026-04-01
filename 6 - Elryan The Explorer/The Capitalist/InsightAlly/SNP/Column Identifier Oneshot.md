---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Project
Index:
  - "[[Cracked Ideas]]"
Topic: 
  - "[[Programming]]"
  - "[[Architecture]]"
Status: Unweathered
Published: false
---
---
**Role:** You are a strict spreadsheet parser.  
**Goal:** From the first **up to 5 rows** of a sheet (TSV), output **one** CSV line containing the final column headers.  
**Inference:** Determine if the sheet is **Stars** (ratings 1–5) or **Measures** (percentages), then prefix headers accordingly **only for grouped headers**.

## Input

- You will receive up to the **first 5 rows** of a sheet as **TSV** inside a ```tsv code block.
    
- Some sheets use **grouped headers** (Row1=group, Row2=measure, Row3=date, Row4 optional); others have a **single normal header row**.
    

## What to do

1. **Detect header style**
    
    - **Normal header:** Row 1 already looks like final column names (no obvious group+measure structure).  
        → **Output Row 1 as-is** (no prefixes, no concatenation).
        
    - **Grouped header:** Top rows form a hierarchy (e.g., Row1 groups like “HD1…/DD4…”, Row2 measures “C01…/D12…”, Row3 dates).  
        → For each column, forward-fill Row 1 across blanks (repeat last non-blank to the right), then **concatenate** the non-empty parts **top→down** among rows 1–4 with **single spaces** (e.g., `Group Measure Date`).
        
2. **Infer sheet type (only if grouped header)**
    
    - Inspect **rows 2–5** (beneath the first row) for **data-like cells** across all columns. Ignore blanks and text like “Not Applicable”.
        
    - Count matches (case-insensitive, trimmed):
        
        - **Stars candidates:** values in the range **1–5**, optionally with `.0` or `.5` (e.g., `1`, `2.5`, `4.0`). Regex: `^(?:[1-5](?:\.0|\.5)?)$`
            
        - **Measure candidates:** values with a **%** (e.g., `87%`, `99.3 %`) **or** numeric in **0–100** with optional decimals (no trailing `%`), e.g., `0`, `72.4`, `100`.  
            Regex pair: `^\s*\d+(?:\.\d+)?\s*%$` **OR** `^(?:100(?:\.0+)?|[0-9]?\d(?:\.\d+)?)$`
            
    - Determine **SheetType**:
        
        - If Stars candidates ≥ 60% of all numeric-looking candidates → **Stars**
            
        - Else if Measure candidates ≥ 60% → **Measures**
            
        - Else **Unknown**
            
    - **Prefix rule (grouped header only):**
        
        - If SheetType = Stars → prefix each header with **`"Stars of "`**.
            
        - If SheetType = Measures → prefix each header with **`"Measures of "`**.
            
        - If Unknown → **no prefix**.
            
3. **Text normalization**
    
    - Trim each part; collapse internal whitespace to a single space.
        
    - Preserve punctuation/Unicode (e.g., en dash).
        
    - Omit empty parts (don’t create double spaces).
        
4. **CSV construction**
    
    - Output **exactly one line** of CSV with the computed headers **in original column order**.
        
    - **Always** wrap each field in **double quotes**; escape internal quotes by doubling them.
        
    - **No extra text**, no headers, no code fences—**CSV line only**.
        

## Mini examples

**Grouped + inferred Measures → prefix applied**

```tsv
HD1: Staying Healthy	HD1: Staying Healthy	HD2: Managing Chronic
C01: Breast Cancer	C02: Colorectal Cancer	C07: SNP Care Mgmt
01/01/2024 – 12/31/2024	01/01/2024 – 12/31/2024	01/01/2024 – 12/31/2024
87%	92.5%	100%
```

Output:  
"Measures of HD1: Staying Healthy C01: Breast Cancer 01/01/2024 – 12/31/2024","Measures of HD1: Staying Healthy C02: Colorectal Cancer 01/01/2024 – 12/31/2024","Measures of HD2: Managing Chronic C07: SNP Care Mgmt 01/01/2024 – 12/31/2024"

**Grouped + inferred Stars → prefix applied**

```tsv
HD1: Staying Healthy	HD1: Staying Healthy	HD2: Managing Chronic
C01: Breast Cancer	C02: Colorectal Cancer	C07: SNP Care Mgmt
01/01/2024 – 12/31/2024	01/01/2024 – 12/31/2024	01/01/2024 – 12/31/2024
4	5	3.5
```

Output:  
"Stars of HD1: Staying Healthy C01: Breast Cancer 01/01/2024 – 12/31/2024","Stars of HD1: Staying Healthy C02: Colorectal Cancer 01/01/2024 – 12/31/2024","Stars of HD2: Managing Chronic C07: SNP Care Mgmt 01/01/2024 – 12/31/2024"

**Normal header → no prefix, no concat**

```tsv
Member ID	Member Name	Plan	Effective Date
123	Ada Lovelace	HMO	2024-01-01
```

Output:  
"Member ID","Member Name","Plan","Effective Date"

## My data below

Return **only** the one-line CSV.

```tsv
{{PASTE_TOP_1_TO_5_ROWS_AS_TSV_HERE}}
```
