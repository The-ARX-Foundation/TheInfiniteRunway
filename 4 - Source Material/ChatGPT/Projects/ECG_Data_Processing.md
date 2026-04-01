---
Date Created: 2026-01-31 00:00
Last Updated: 2026-01-31 00:00
tags:
  - Project
Index:
  - "[[ChatGPT]]"
Topic: 
  - "[[Signal Processing]]"
  - "[[Biomedical Engineering]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---

# ECG Data Processing

## Purpose
-

## Current state
-

## Next actions
- [ ]

## Decisions
-

## References
- Sources:
  -
- Sources: Read ECG data from the provided Excel file
excel_file_path = r'C:\Users\IOX20\OneDrive - Texas A&M University\BMEN 321\Lab 6\ECG_dataset.xlsx' # Replace this with the actual path to your Excel file
cg_data = pd.read_excel(excel_file_path, skiprows=10)
ecg = ecg_data.iloc[:, 0].values  # Assuming the ECG data is in the first column
  - Source: 4 - Source Material/ChatGPT/chatgpt_export_md/2023-11-14T13:24:10.939023_ECG Lab 6.md
