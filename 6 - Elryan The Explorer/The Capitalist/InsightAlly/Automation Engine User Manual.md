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

Themes: [[Programming]]

## Vocabulary:
"Query" -> The instructions you send the LLM. I.e. "Prompt" or "One-shot" (referring to the utilization of a single call to an LLM)
"Primatives" -> Operations available through backend hard-coding
"Blue vs. Yellow" -> A formatting distinction to determine hierarchy in which the Blue highlighted rows contain (are parent to) the Yellow highlighted rows. Parallels to this include Cards and Fields, Folders and Files, Tables and Facts, Domain and Subcomponents, Databases and Elements/Blocks.
"Blocks" -> Database entries 
"Cards" -> HTML / JSON web development blocks (not to be confused with data blocks)
"Blobs" -> Highlighted regions of image data in which objects or subjects are to be identified by AI


## Columns to Note:
#### AIVendor:
- defaults to OpenAI
- Dependent on AI Engine Column

#### AIEngine:
- For OpenAI call:	OpenAI@DirectNoStreamNoPrompt
- For Claude call:	Bedrock@DirectOpusNoPrompt
- For Google call:	Gemini@models/gemini-2.5-pro
- For Nova call:		Bedrock@amazon.nova-pro-v1:0

#### Step Type:
Primatives as follows:
![[Pasted image 20251013153400.png]]
Select Query for basic queries
Essentially allows for different contexts and response retrieval methodologies.

#### SaveResponse
Option to save the result to the Smartsheet "Result" Column only, DB "Block" only, or both

#### Step
Functional priority, lower numbers run first. This allows for fine tuning of orchestration, especially for if you string values from step to step.
Note: Steps do not need priors to run; i.e. step 2 can run even if a step 1 doesn't run.
#### Enable
Y - yes, run this row
N - no, don't run this row

#### Instructions_1
First set of instructions, the prompt you send to the LLM. Utilize the "Wildcard" reference format `${reference}` to pull data from the row. To pull data from a specific cell utilize `${reference}row#`
Note: Multiple instructions only if args channel is present

#### Args
Unknown syntax

#### Final Match
In the case of the WD sheet, the final result of all prior operations.

## The Setup Process

### TL;DR

This system turns messy source files into clean, validated SQL table loads using a 5-step, LLM-assisted pipeline. You define what “good” data looks like (Step 0), four models independently propose mappings (Step 1), their answers get bundled (Step 2), a judge picks the safest single mapping per field (Step 3), and those lines are assembled into a balanced INSERT/SELECT stored procedure with automated validation (Steps 4–5). Everything saves back to Smartsheet and/or a DB “Block” for audit.

---

#### How it works (end-to-end, one pass)

1. **Step 0 — Design the rules**
    
    - You classify fields under **Blue** (table/category) → **Yellow** (fields).
        
    - For each Blue table: write **Table Rules** (keys, constraints, defaults, compliance).
        
    - For each Yellow field: define a **ColumnObject** (type, validation, patterns, transforms, relationships).
        
    - Think of this as the contract: what we expect, accept, and reject.
        
2. **Step 1 — Isolation (per field, multi-model)**
    
    - Using the same inputs (Table Rules + ColumnObject + sample data), four LLMs independently pick the best **source column** (or a safe derivation).
        
    - Each returns a **strict JSON**: source_column, status (MAPPED/DERIVED/NOT_FOUND), confidence, rule applied, transform type, notes.
        
    - Results are saved to the row (Result + Block) for traceability.
        
3. **Step 2 — Concatenation (per field)**
    
    - Combine the four JSON results into an **AnswerArray** (ordered, validated, with provenance).
        
    - This array is the single input to the judge.
        
4. **Step 3 — Arbitration (the judge, per field)**
    
    - The judge applies tiered consensus (unanimous → strong → weighted), plus domain safety rules from Step 0.
        
    - Output is **one SQL select-line** for that target field, or `''` when it’s unsafe/unknown.
        
    - Optional tags `[TRANSFORM]` / `[CONDITIONAL]` are added when multiple models agree a transform is required.
        
5. **Step 4 — Compartmentalization (per table)**
    
    - Gather all the arbitrated lines under their Blue parent and produce a **TableArray** (ordered list of select-lines + table alias).
        
    - Order matters: it becomes the INSERT/SELECT order.
        
6. **Step 5 — Finalization (generator + validator)**
    
    - **Generator:** turns the TableArray into a MySQL stored procedure `sts_<table>()` with a balanced `INSERT (...)` and `SELECT DISTINCT ...` of the **same length and order**.
        
    - **Validator:** parses mapping comments (`-- Target_Field`) and corrects commas/order/aliasing; outputs **only** runnable SQL.
        

---

#### Core concepts (why they exist)

- **Blue vs Yellow**: Information hierarchy → categories/tables (Blue) own their fields (Yellow).
    
- **Table Rules**: Table-level constraints (keys, uniqueness, aggregates, defaults, compliance).
    
- **ColumnObject**: Field-level truth (type/format, validation, transforms, relationships, error handling).
    
- **AnswerArray**: The four expert opinions (structured JSON) about a single target field.
    
- **TableArray**: The final, ordered list of SQL select-lines for a whole table (input to the generator).
    

---

#### Data flow (in plain English)

**Rules in → Opinions out → One decision → SQL.**

- **Inputs:**
    
    - Table Rules, ColumnObject, sample data (masked), and Target Column.
        
- **Model fan-out:**
    
    - Four engines answer independently with JSON.
        
- **Fan-in:**
    
    - Results become a single AnswerArray → Judge decides one SQL line.
        
    - Lines roll up into a TableArray → Stored procedure is generated and validated.
        
- **Outputs:**
    
    - Row-level Results/BlockIDs for each step, plus final SQL per table.
        

---

#### Guardrails & safety (the important part)

- **Defaults ≠ Sources:** If a field is system-defaulted (e.g., `USD`), models must return **“No Match Found.”**
    
- **Type discipline:** IDs must look like IDs; booleans must be strict domains (Y/N, Yes/No, True/False, 0/1 only); numeric fields must be numeric.
    
- **Rejections:** Known bad patterns (e.g., mapping `_Yes_No` from “Filing Status”) are blocked by the judge.
    
- **Transforms:** Only allowed if `transform_logic` exists in the ColumnObject.
    
- **PII/Compliance:** PII flags, encryption, retention, and audit are defined in Table Rules/ColumnObject and carried through the pipeline.
    

---

#### What operators actually do

1. **Author rules** (Step 0): fill **Table Rules** and each field’s **ColumnObject**; set Blue/Yellow layout.
    
2. **Run isolation** (Step 1): one row per engine; set `Enable=Y` and `SaveResponse=Both`.
    
3. **Concatenate** (Step 2): create the AnswerArray row for each field.
    
4. **Judge** (Step 3): produce one SQL line per field.
    
5. **Compile** (Step 4): build the TableArray for each Blue table.
    
6. **Generate & Validate** (Step 5): produce the stored procedure; validator outputs the final clean SQL.
    

_(All Results/BlockIDs give you a full audit trail.)_

---

#### Failure modes & how they’re handled

- **Model returns bad JSON:** we inject a NOT_FOUND placeholder with a validation note; arbitration still proceeds.
    
- **Consensus missing or unsafe:** judge returns `''` (empty) for that field; generator still builds a balanced procedure.
    
- **Comma/order mismatches:** validator fixes insert/select counts and trailing-empty edge cases.
    
- **Alias/casing issues:** validator corrects to canonical alias and preserves original column casing (with backticks).
    

---

#### Extensibility (why it scales)

- **Domain-agnostic:** Step 0 [[Contracts]] (Table Rules/ColumnObject) let you apply the same pipeline to HR, finance, IoT, ecommerce—anything.
    
- **Model-agnostic:** Add/remove engines by adding/removing Step-1 rows; Step 2+ don’t change.
    
- **Post-processing swap:** Step 5 can emit other targets (dbt models, parquet schemas, API payloads) by swapping the generator template.
    
- **RAG-friendly:** Sample data blocks can be synthetic or retrieved context; the prompts remain stable.
    

---

#### Minimal “Go/No-Go” checklist

- **Design:** Every Blue table has Table Rules; every Yellow field has a ColumnObject.
    
- **Isolation:** 4 JSONs per field (or placeholders); `SaveResponse=Both`.
    
- **Concatenation:** AnswerArray exists and validates.
    
- **Arbitration:** One SQL line (or `''`) per field, with tags where 3+ models agree.
    
- **Compartmentalization:** TableArray contains **all** fields, in order.
    
- **Finalization:** Stored procedure generated **and** validator emits only the final SQL.
    

---


### Step 0 (pre-setup):
Pick the values you want to determine from the source material (often starting with the Key value is the best approach). Sort these values into the desired categories for table formation, nesting them as Yellow rows under Category rows in Blue. From this generate table rules (to be stored in `Table Rules` column) and any formatting/metadata required for the values within each table (to be stored in `ColumnObject`).

#### Table Rules — General Parts (domain-agnostic)

- **table_name**: Logical collection you’re populating (e.g., `orders`, `sensor_events`, `claims`).
    
- **rules**:
    
    - **Keys & relationships**: primary keys, uniqueness, foreign key existence.
        
    - **Field-specific constraints**: type/format/allowed values per column.
        
    - **Cross-row/aggregate rules**: totals, percentages, uniqueness within a partition (e.g., “one active default per entity”).
        
    - **Defaults**: domain defaults (currency, locale, unit, status).
        
    - **Operational gates**: required external validations (e.g., checksum, signature, device calibration).
        
- **governance**:
    
    - retention policy, PII/PHI flags, audit requirements.
        
- **notes**: human-readable operational clarifications, exceptions, or migration caveats.
    

> Think of **Table Rules** as the _contract for the dataset as a whole_ (record set behavior + inter-field dependencies).
#### Table Rules Example

```yaml
table_name: Payment_Elections
rules:
  # Keys & relationships
  - "Employee_ID must exist in Worker table and cannot be null"
  - "Priority must be unique per Employee_ID (typically 1–99, with 99 as remainder)"
  - "One employee can have multiple accounts (different Priority values)"

  # Field-specific constraints
  - "Routing_Number must be exactly 9 digits and pass ABA checksum"
  - "Account_Number must be alphanumeric, 4–17 chars; only '-' allowed as special char"
  - "Account_Type_Code must be C (Checking) or S (Savings)"
  - "Payment_Type must be 'Percentage' or 'Amount'"

  # Cross-row/aggregate rules
  - "If Payment_Type='Percentage', sum of all Percent values per Employee_ID must equal 100"
  - "If Payment_Type='Amount', last account must be Payment_Type='Percentage' at 100%"
  - "Balance field indicates remainder account (typically Priority=99)"

  # Defaults
  - "Currency defaults to 'USD' if not specified"
  - "Country defaults to 'US' if not specified"

  # Security & compliance
  - "Bank account data requires encryption (PII)"
  - "Prenote validation required before first live payment"

  # Optional/UX notes
  - "First_Name and Last_Name optional; used for verification only"

governance:
  retention_years: 7
  pii_fields:
    - Routing_Number
    - Account_Number
  audit_required: true
notes:
  - "Validate ABA checksum before accepting new routing numbers"
  - "Disallow duplicate Priority per Employee_ID"
```

#### Table Rules — Blank Template

```yaml
table_name: <your_table>
rules:
  - "<PK_FIELD> must be unique and not null"
  - "<FK_FIELD> must exist in <parent_table>.<parent_pk>"
  - "<FIELD_A> allowed values: <A|B|C>"
  - "At most one <is_default> = true per <entity_id>"
  - "If <field_x>='Percentage', sum(<percent_field>) per <entity_id> must equal 100"
  - "If <field_y> missing, default to '<DEFAULT>'"
  - "Reject rows where <checksum_field> fails <algorithm>"
governance:
  retention_years: <n>
  pii_fields: []
  audit_required: false
notes: []
```


#### Column Object — General Parts (field-level spec)

- **Identity & ordering**: `field_name`, `table_name`, `field_sequence`.
    
- **Typing & format**: `data_type`, `format`, `min_length`, `max_length`, `required`, `nullable`, `unique`.
    
- **Semantics**:
    
    - `field_definition`, `business_purpose`, `user_impact`.
        
    - Domain object (renameable): `domain_object` (formerly `workday_object`).
        
- **Examples**: realistic sample values for QA and LLM grounding.
    
- **Matching metadata** (for automated column detection):
    
    - `exact_patterns`, `semantic_patterns`, `regex_pattern`, `avoid_patterns`, `typical_position`.
        
- **Cross-system mapping** (optional, renameable by stack):
    
    - `vendor_mapping` (e.g., `shopify_field`, `netsuite_field`, `snowflake_column`, etc.).
        
- **Transforms & cleaning**:
    
    - `transform_logic` (simple deterministic steps), `cleaning_rule`, `calculation` (derivations).
        
- **Validation rules**:
    
    - `format_validation`, `length_validation`, `range_validation`, `lookup_validation` (FK existence), `cross_field_check`.
        
- **Relationships**:
    
    - `parent_table`, `parent_field`, `required_with_fields`, `conflicts_with_fields`, `foreign_key`.
        
- **Severity & error handling**:
    
    - `missing_severity`, `invalid_severity`, `error_action`, `error_message`.
        
- **Governance & compliance**:
    
    - `pii_flag`, `encryption_required`, `audit_required`, `compliance_rule`, `retention_years`.
        
- **Scoring (for LLM arbitration)**:
    
    - Weights for `exact_match_score`, `semantic_match_score`, etc., to shape how the judge prefers matches.
        
- **Metadata**:
    
    - versioning, provenance, authoring, notes.
        

> Think of the **Column Object** as the _single source of truth for a field_: how to find it, validate it, transform it, relate it, and govern it—_in any domain_ (finance, IoT, logistics, healthcare, CRM, etc.).

#### Column Object Example

```json
{
  "field_name": "Employee_ID",
  "table_name": "Payment_Elections",
  "domain_object": "Worker_Payment_Election",
  "field_sequence": "1",
  "data_type": "string",
  "format": "alphanumeric",
  "max_length": 20,
  "min_length": 1,
  "required": "Y",
  "nullable": "N",
  "unique": "N",

  "valid_values": null,
  "default_value": null,

  "field_definition": "Unique identifier linking payment election to a specific worker",
  "business_purpose": "Associates bank account and distribution instructions with correct employee for payroll processing",
  "user_impact": "Wrong ID = payment to wrong person; Missing ID = payroll failure",

  "examples": {
    "example_value_1": "10001",
    "example_value_2": "E123456",
    "example_value_3": "EMP-2025"
  },

  "matching": {
    "exact_patterns": "Employee_ID|Employee ID|Employee Id|EmployeeID|EmpID|Emp_ID|Employee_Id",
    "semantic_patterns": "Employee_Number|Worker_ID|Staff_ID|Personnel_Number|Badge_Number|Associate_ID|Team_Member_ID|Worker_Number",
    "regex_pattern": "^.*(employee|emp|worker|staff|personnel|associate)[_\\s-]*(id|ID|Id|number|num|no|code|cd).*$",
    "avoid_patterns": "Manager_ID|Supervisor_ID|Position_ID|Employer_ID|Company_ID|Department_ID",
    "typical_position": "First column in file"
  },

  "transform_logic": "UPPER(TRIM(value))",
  "null_handling": "ERROR",
  "cleaning_rule": "Remove leading zeros only if all numeric; preserve alphanumeric format",
  "value_mapping": null,
  "calculation": null,

  "validation": {
    "format_validation": "^[A-Za-z0-9][A-Za-z0-9_-]*$",
    "range_validation": null,
    "length_validation": "LENGTH BETWEEN 1 AND 20",
    "lookup_validation": "EXISTS IN Worker.Employee_ID",
    "cross_field_check": "Must have corresponding payment elections if active employee"
  },

  "relationships": {
    "parent_table": "Worker",
    "parent_field": "Employee_ID",
    "required_with_fields": "Routing_Number|Account_Number|Account_Type_Code|Payment_Type|Priority",
    "conflicts_with_fields": null,
    "foreign_key": "Worker.Employee_ID"
  },

  "severity": {
    "missing_severity": "CRITICAL",
    "invalid_severity": "CRITICAL",
    "error_action": "REJECT",
    "error_message": "Employee ID is required and must exist in Worker table"
  },

  "common_errors": [
    "Employee not found in Worker table",
    "Using terminated employee ID",
    "Leading zeros stripped incorrectly"
  ],

  "governance": {
    "pii_flag": "Y",
    "encryption_required": "Y",
    "audit_required": "Y",
    "compliance_rule": "SOX",
    "retention_years": 7
  },

  "scoring": {
    "exact_match_score": 100,
    "semantic_match_score": 90,
    "position_match_score": 85,
    "pattern_match_score": 95
  },

  "metadata": {
    "version": "1.0",
    "created_date": "2025-01-06",
    "modified_date": "2025-01-06",
    "created_by": "System",
    "notes": "Critical field - cannot process payment without valid Employee_ID"
  }
}
```

#### Column Object — Blank Template

```json
{
  "field_name": "<name>",
  "table_name": "<your_table>",
  "domain_object": "<optional_domain_object>",
  "field_sequence": 1,
  "data_type": "string|integer|decimal|boolean|date|datetime|json",
  "format": "alphanumeric|numeric|email|uuid|url|iso8601|enum",
  "max_length": null,
  "min_length": null,
  "required": "Y|N",
  "nullable": "Y|N",
  "unique": "Y|N",

  "valid_values": null,
  "default_value": null,

  "field_definition": "<what this field means>",
  "business_purpose": "<why it exists>",
  "user_impact": "<what breaks if wrong>",

  "examples": {
    "example_value_1": "",
    "example_value_2": "",
    "example_value_3": ""
  },

  "matching": {
    "exact_patterns": "",
    "semantic_patterns": "",
    "regex_pattern": "",
    "avoid_patterns": "",
    "typical_position": ""
  },

  "vendor_mapping": {},

  "transform_logic": null,
  "null_handling": "ERROR|COERCE|DEFAULT|IGNORE",
  "cleaning_rule": null,
  "value_mapping": null,
  "calculation": null,

  "validation": {
    "format_validation": null,
    "range_validation": null,
    "length_validation": null,
    "lookup_validation": null,
    "cross_field_check": null
  },

  "relationships": {
    "parent_table": null,
    "parent_field": null,
    "required_with_fields": null,
    "conflicts_with_fields": null,
    "foreign_key": null
  },

  "severity": {
    "missing_severity": "INFO|WARN|ERROR|CRITICAL",
    "invalid_severity": "INFO|WARN|ERROR|CRITICAL",
    "error_action": "REJECT|FLAG|DEFAULT|QUARANTINE",
    "error_message": ""
  },

  "governance": {
    "pii_flag": "Y|N",
    "encryption_required": "Y|N",
    "audit_required": "Y|N",
    "compliance_rule": "",
    "retention_years": null
  },

  "scoring": {
    "exact_match_score": 100,
    "semantic_match_score": 90,
    "position_match_score": 80,
    "pattern_match_score": 85
  },

  "metadata": {
    "version": "1.0",
    "created_date": "",
    "modified_date": "",
    "created_by": "",
    "notes": ""
  }
}
```

### Step 1 (Isolation):
Isolate the single value you need from the source material for the current **`Target Column`**. Using the _same inputs_, fan out identical prompts to multiple LLMs (per your **AIVendor/AIEngine** rows). Each model returns a compact JSON decision describing the best source column (or a derived expression). Set **`SaveResponse` = Both** so each row captures the JSON in **Result** and the **BlockID** for later concatenation/arbitration.

#### Instructions — General Parts (domain-agnostic)

- **Inputs**
    
    - `Target Column`: the field you’re mapping.
        
    - `Table`: logical group/category for context.
        
    - `Table Rules`: table-level constraints and cross-field logic.
        
    - `Column Object`: field-level spec (typing, patterns, validations, transforms).
        
    - `Customer Data`: representative sample block (masked/synthetic preferred).
        
- **Priority (decision order)**
    
    1. **Exact Match**
        
    2. **Semantic Match**
        
    3. **Fallback Rules** (from Column Object only)
        
    4. **Derived Value** (explicitly allowed or implied by Column Object)
        
    5. **No Match**
        
- **Hard Rules**
    
    - Never invent defaults; if a value is a **system default**, return **"No Match Found"**.
        
    - Verify candidates are **actual column names** unless derivation is explicitly allowed.
        
    - Apply only the **Column Object** fallback/derivation logic—don’t add new rules.
        
- **Semantic / Type Validation**
    
    - IDs → unique/identifier-like
        
    - Codes/Types → categorical domains
        
    - Boolean flags → strict **Y/N**, **Yes/No**, **True/False**, or **0/1** (and nothing else)
        
    - Numeric fields (Amount/Percent) → numeric-only
        
    - If mismatched, **reduce confidence by 30** or return **"No Match Found"**.
        
- **Defaults & Derived**
    
    - If Column Object indicates a **default value** (e.g., currency = "USD"), that is **not** a source column → **"No Match Found"**.
        
    - Derived expressions allowed only if **Column Object** indicates/how.
        
- **Special Field Rules (examples)**
    
    - **Position_ID**: must be a unique identifier; reject descriptive text fields.
        
    - **Effective_As_Of**: follow a strict priority if one is defined; exclude disallowed dates.
        
- **Transform Detection**
    
    - Set `transform_type="Transform"` **only** if `transform_logic` is present (e.g., TRIM/UPPER/LOWER/REPLACE/CONCAT/CAST).
        
    - `transform_type="Conditional"` for CASE-style rules; `"Multi-Field"` when multiple inputs are required.
        
    - Otherwise `"None"`.
        
- **Decision Steps**
    
    1. Check table context (scope) first.
        
    2. Confirm candidate is a column (or permitted expression).
        
    3. Enforce Column Object type/format constraints.
        
    4. Apply Column Object fallback/derivation if specified.
        
- **Output (JSON only)**
    
    - Keys: `source_column`, `target_field`, `confidence`, `status`, `rule_applied`, `transform_type`, `notes`.
        
    - `status ∈ {MAPPED, DERIVED, NOT_FOUND}`
        
    - `rule_applied ∈ {Exact, Semantic, Fallback, Derived, None}`
        
    - `transform_type ∈ {Conditional, Transform, Multi-Field, None}`
        

#### Example

```yaml
role: "Expert Data Conversion Column Mapper"
target: "Workday field: ${Target Column}"

priority_order:
  - EXACT MATCH
  - SEMANTIC MATCH
  - FALLBACK RULES
  - DERIVED VALUE
  - NO MATCH

table_context_awareness:
  - 'Use table name cues before mapping'
  - 'If table includes "Worker_Work_Other_Employer" → secondary employer ONLY'
  - 'If no secondary employer data exists → return "No Match Found"'
  - 'Never reuse primary employer fields for secondary employer tables'

semantic_validation:
  id_fields: "Must be unique ID-like values"
  code_or_type: "Categorical codes only"
  boolean_fields: "Strict Y/N, Yes/No, True/False, or 0/1 only"
  numeric_fields: "Amount/Percent must be numeric"
  on_mismatch: "Reduce confidence by 30 or return 'No Match Found'"

defaults_and_derived:
  - 'If Column Object shows a DEFAULT → "No Match Found"'
  - 'System defaults (e.g., DEFAULT "USD") are not source columns'
  - 'Currency typically defaults to USD → "No Match Found"'

yes_no_field_rules:
  reject_if_name_contains:
    - "Exemptions"        # counts, not booleans
    - "Filing Status"     # codes, not booleans
    - "Marital Status"    # codes, not booleans
    - "Home State"
    - "State"
    - "Pay Type"
    - "Amount"
    - "Percentage"
  accept_domains:
    - "Y,N"
    - "Yes,No"
    - "True,False"
    - "0,1 (and no other numbers)"

position_id_rules:
  accept: "POS-1234, 12345 (ID-like)"
  reject: ["Position Description", "Job Title", "Position Name"]
  if_only_text_descriptions: "No Match Found"

effective_as_of_priority:
  ordered:
    - "Pay Rate Effective Date"
    - "Effective Date"
    - "Hire Date (fallback only)"
  never_use:
    - "Termination Date"
    - "Birth Date"
    - "Review Date"

transform_detection:
  explicit_only: ["TRIM", "UPPER", "LOWER", "REPLACE", "CONCAT", "CAST"]
  default: "transform_type = 'None' if no transform_logic in Column Object"

conditional_and_multi_field:
  use_conditional_for_case_when: true
  use_multi_field_when_multiple_inputs_required: true
  examples:
    percent: "CASE WHEN Amount_Code='P' THEN Amount"
    balance: "CASE WHEN Amount_Code='B' THEN 'Y' ELSE 'N'"
    payment_type: "CASE WHEN Amount_Code='P' THEN 'Percentage' ELSE 'Amount'"

data_blocks:
  table_rules: "${Table Rules}"
  column_object: "${Column Object}"
  customer_data: "${block.Spreadsheets.PaySample}"

decision_steps:
  - "Check table context (primary vs secondary employer)"
  - "Verify candidate is a real column (unless derivation allowed)"
  - "Apply boolean/ID/numeric semantic rules"
  - "Follow effective date priority"
  - "Use only Column Object transforms and fallbacks"

output_contract:
  json_only: true
  schema:
    source_column: "<column | formula | 'No Match Found'>"
    target_field: "${Target Column}"
    confidence: "<0-100>"
    status: "MAPPED | DERIVED | NOT_FOUND"
    rule_applied: "Exact | Semantic | Fallback | Derived | None"
    transform_type: "Conditional | Transform | Multi-Field | None"
    notes: "<short reason/formula>"

final_instruction: "Output only the JSON object with the keys above."
```

**Model should return (example JSON):**

```json
{
  "source_column": "Amount Code",
  "target_field": "Payment_Type",
  "confidence": 92,
  "status": "DERIVED",
  "rule_applied": "Derived",
  "transform_type": "Conditional",
  "notes": "CASE WHEN Amount Code = 'P' THEN 'Percentage' ELSE 'Amount'"
}
```

#### Blank Template (domain-agnostic prompt)

```yaml
role: "You are an Expert Data Mapping Analyst."

task: >
  Determine which source column (or expression) maps to the target field "${Target Column}".
  Decide using this priority: 1) EXACT MATCH, 2) SEMANTIC MATCH, 3) FALLBACK RULES, 4) DERIVED VALUE, 5) NO MATCH.

inputs:
  table_name: "${Table}"
  table_rules: "${Table Rules}"
  column_object: "${Column Object}"
  customer_data_sample: "${block.Spreadsheets.PaySample}"

hard_rules:
  - "Follow ONLY fallback/derivation logic present in the Column Object."
  - "If a value is a system/default, return 'No Match Found' (defaults are not source columns)."
  - "Verify candidate is a real column name unless derivations are explicitly allowed."

semantic_and_type_validation:
  ids: "Unique/identifier-like values only"
  codes: "Categorical domains only"
  booleans: "Y/N, Yes/No, True/False, or 0/1 exclusively"
  numerics: "Amounts/Percent must be numeric"
  mismatch_behavior: "Reduce confidence by 30 or return 'No Match Found'"

transform_detection:
  explicit_only: true
  allowed_functions: ["TRIM", "UPPER", "LOWER", "REPLACE", "CONCAT", "CAST"]
  transform_type_defaults_to: "None"
  conditional_logic_sets_transform_type_to: "Conditional"
  multi_field_sets_transform_type_to: "Multi-Field"

decision_steps:
  - "Use table context first."
  - "Confirm candidate is a column or an allowed expression."
  - "Apply Column Object constraints and validations."
  - "Apply Column Object fallback/derivation if specified."

output_contract:
  json_only: true
  schema:
    source_column: "<column | formula | 'No Match Found'>"
    target_field: "${Target Column}"
    confidence: "<0-100>"
    status: "MAPPED | DERIVED | NOT_FOUND"
    rule_applied: "Exact | Semantic | Fallback | Derived | None"
    transform_type: "Conditional | Transform | Multi-Field | None"
    notes: "<short rationale or formula>"

final_instruction: "Output only the JSON object with exactly these keys."
```

### Step 2 (Concatenation):
Take the individual JSON results from your Step-1 model calls (e.g., OpenAI, Claude, Gemini, Nova) for the **same `Target Column`** and combine them into a single ordered array called **`AnswerArray`**. This array is the only input your Judge (Step 3) should need.

#### Rules — What “good” looks like

- **Scope**: Include only Step-1 results for the _same_ `Target Column` and _same_ `Table`.
    
- **Order**: Keep a deterministic order (e.g., `["openai","claude","gemini","nova"]`) so diffs are stable.
    
- **Schema**: Every element must conform to the Step-1 JSON contract.
    
- **Completeness**: If a model failed or returned invalid JSON, insert a placeholder element with  
    `status: "NOT_FOUND"`, `rule_applied: "None"`, `notes: "Validation error: <detail>"`.
    
- **Provenance**: Add lightweight metadata per element (engine/vendor, timestamp) for auditability.
    
- **Storage**: Save the final JSON as **`AnswerArray`** in the row you’ll feed to Step 3 (Result + Block if you’re using Both).
    

**Recommended `AnswerArray` item shape**  
(inherits Step-1 fields, adds small metadata)

```json
{
  "source_column": "<column | formula | 'No Match Found'>",
  "target_field": "<exact target field>",
  "confidence": 0,
  "status": "MAPPED|DERIVED|NOT_FOUND",
  "rule_applied": "Exact|Semantic|Fallback|Derived|None",
  "transform_type": "Conditional|Transform|Multi-Field|None",
  "notes": "<short reason or formula>",
  "_meta": {
    "vendor": "OpenAI|Anthropic|Google|Amazon",
    "engine": "OpenAI@DirectNoStreamNoPrompt",
    "run_id": "<uuid-or-ref>",
    "timestamp": "<iso8601>"
  }
}
```

#### Example (4-model merge)

**Inputs:** four Step-1 results for `Payment_Type`.

```json
[
  {
    "source_column": "Amount Code",
    "target_field": "Payment_Type",
    "confidence": 92,
    "status": "DERIVED",
    "rule_applied": "Derived",
    "transform_type": "Conditional",
    "notes": "CASE WHEN Amount Code='P' THEN 'Percentage' ELSE 'Amount'",
    "_meta": {
      "vendor": "OpenAI",
      "engine": "OpenAI@DirectNoStreamNoPrompt",
      "run_id": "b7d1...",
      "timestamp": "2025-10-13T20:15:05Z"
    }
  },
  {
    "source_column": "Amount Code",
    "target_field": "Payment_Type",
    "confidence": 88,
    "status": "DERIVED",
    "rule_applied": "Derived",
    "transform_type": "Conditional",
    "notes": "CASE WHEN Amount Code='P' THEN 'Percentage' ELSE 'Amount'",
    "_meta": {
      "vendor": "Anthropic",
      "engine": "Bedrock@DirectOpusNoPrompt",
      "run_id": "f21c...",
      "timestamp": "2025-10-13T20:15:06Z"
    }
  },
  {
    "source_column": "No Match Found",
    "target_field": "Payment_Type",
    "confidence": 40,
    "status": "NOT_FOUND",
    "rule_applied": "None",
    "transform_type": "None",
    "notes": "Could not verify code semantics",
    "_meta": {
      "vendor": "Google",
      "engine": "Gemini@models/gemini-2.5-pro",
      "run_id": "9a53...",
      "timestamp": "2025-10-13T20:15:06Z"
    }
  },
  {
    "source_column": "Amount Code",
    "target_field": "Payment_Type",
    "confidence": 90,
    "status": "DERIVED",
    "rule_applied": "Derived",
    "transform_type": "Conditional",
    "notes": "CASE WHEN Amount Code='P' THEN 'Percentage' ELSE 'Amount'",
    "_meta": {
      "vendor": "Amazon",
      "engine": "Bedrock@amazon.nova-pro-v1:0",
      "run_id": "73c2...",
      "timestamp": "2025-10-13T20:15:07Z"
    }
  }
]
```

This is your **`AnswerArray`**. Step 3 can now compute unanimity/consensus/weighted scores without re-reading individual rows.

#### Template — Blank `AnswerArray` & helpers

**A) Blank `AnswerArray` (domain-agnostic)**

```json
[
  {
    "source_column": "",
    "target_field": "${Target Column}",
    "confidence": 0,
    "status": "NOT_FOUND",
    "rule_applied": "None",
    "transform_type": "None",
    "notes": "",
    "_meta": {
      "vendor": "",
      "engine": "",
      "run_id": "",
      "timestamp": ""
    }
  }
]
```

**B) Smartsheet wiring (simple pattern)**

- Keep each model’s Step-1 JSON in its own **Result** cell (e.g., `Result_OpenAI`, `Result_Claude`, …) or separate rows linked by a `RunID`.
    
- Use an automation (or backend) to:
    
    1. **Validate** each JSON (if invalid → create placeholder with `status:"NOT_FOUND"`).
        
    2. **Concatenate** into one array string:  
        `[` + `JOIN({Result_Model_JSON_Range}, ",")` + `]`
        
    3. **Write** to a Step-2 row’s **Result** as **`AnswerArray`** and store to Block.
        

**C) Minimal JSON Schema (optional guard)**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "array",
  "minItems": 1,
  "items": {
    "type": "object",
    "required": ["source_column","target_field","confidence","status","rule_applied","transform_type","notes"],
    "properties": {
      "source_column": { "type": "string" },
      "target_field": { "type": "string" },
      "confidence": { "type": "number", "minimum": 0, "maximum": 100 },
      "status": { "type": "string", "enum": ["MAPPED","DERIVED","NOT_FOUND"] },
      "rule_applied": { "type": "string", "enum": ["Exact","Semantic","Fallback","Derived","None"] },
      "transform_type": { "type": "string", "enum": ["Conditional","Transform","Multi-Field","None"] },
      "notes": { "type": "string" },
      "_meta": {
        "type": "object",
        "required": ["vendor","engine"],
        "properties": {
          "vendor": { "type": "string" },
          "engine": { "type": "string" },
          "run_id": { "type": "string" },
          "timestamp": { "type": "string" }
        },
        "additionalProperties": true
      }
    },
    "additionalProperties": false
  }
}
```

**D) QA checklist**

- [ ] All elements share the same `target_field` and table context.
    
- [ ] Array length matches expected model count (or placeholders backfill failures).
    
- [ ] Each element passes schema validation.
    
- [ ] Deterministic ordering of elements.
    
- [ ]  Stored in **Result** and **Block** (if `SaveResponse = Both`) for Step-3 access.
    

That’s it—lightweight, deterministic, and arbitration-ready.

### Step 3 (Arbitration):
Consume the **`AnswerArray`** from Step 2 and decide the **single SQL select-line** that becomes the _ground truth mapping_ for the current **`${Target Column}`**. The Judge uses tiered consensus, safety checks, and optional transform tags. The output is **one SQL line only** (no prose/JSON).
#### Rules — Decision & Safety (domain-agnostic)

**Inputs**

- `AnswerArray`: array of per-model JSONs (same target field).
    
- Context tokens available: `${Table}`, `${Target Column}`, `${Answer Array}`.
    

**Extraction & Normalization**

- Pull per element: `source_column`, `confidence`, `status`, `rule_applied`, `transform_type`, `notes`.
    
- Normalize comparison of `source_column` (ignore case/extra spaces).
    
- When a formula is present, also extract a **base column** for consensus checks:
    
    - `UPPER(TRIM(Pay Type Code))` → `Pay Type Code`
        
    - `CASE WHEN Amount Code='P' THEN Amount` → `Amount`
        

**Decision Tiers (stop at first match)**

1. **Unanimous Agreement**: all non-`NOT_FOUND` agree on the same (normalized) **base column** → choose it.  
    _Exception_: if all responses are `"No Match Found"` and any `notes` mention **DEFAULT** → output `''`.
    
2. **Strong Consensus**: ≥3 agree on the same base column → choose it.
    
3. **Weighted Consensus**: `weighted_score = Σ(confidence/100)` for items with `status != "NOT_FOUND"`.  
    If `weighted_score ≥ 2.5`, pick the **highest-confidence** column among those contributing.
    
4. **Derived Pattern (optional rule-pack)**: if target is in a known set and ≥2 responses are `DERIVED`, use mapped pattern.  
    Example pack (customize per domain):
    
    - `Percent` → base column `"Amount"`
        
    - `Balance` → base column `"Amount Code"`
        
    - `Payment_Type` → base column `"Amount Code"`
        
5. **No Match**: If none apply → output `''`.
    

**Safety Validation (must pass or return `''`)**

- Reject if `source_column` equals `"error"` or contains `"DEFAULT"`.
    
- If boolean target (e.g., suffix `_Yes_No`), reject when the chosen source name suggests non-boolean domains (e.g., “Exemptions”, “Filing Status”, “Marital Status”, “State”, “Pay Type”, “Amount”, “Percentage”).
    
- If `Target Column = Position_ID`, reject names containing “Description”, “Title”, “Name”.
    
- Reject single-character source names representing codes only (e.g., `Y/N/P/D/A/B/S/M/H`).
    
- Apply any table-scope exclusions your domain needs (e.g., secondary/primary data separation).
    

**Transform Tags (optional)**

- If **≥3** elements report `transform_type="Transform"` → append `[TRANSFORM]`.
    
- If **≥3** elements report `transform_type="Conditional"` → append `[CONDITIONAL]`.
    

**Special Overrides (examples — tune per domain)**

- If target relates to **Effective_As_Of** and chosen column is clearly a termination date → override to preferred fallback (e.g., Hire Date).
    
- Currency-like targets that default via rules → always `''`.
    
- If table context indicates a secondary-only scope and no secondary data → `''`.
    

**Output Format (exact)**

- **Empty**:  
    `'', -- ${Target Column}`
    
- **Standard**:  
    `${Table}.`column_name`, -- ${Target Column}`
    
- **With tag**:  
    `${Table}.`column_name`, -- ${Target Column} [TRANSFORM/CONDITIONAL]`
    

Rules:

- Preserve **exact casing** of the source column as it appears in data.
    
- Use the provided **`${Table}` alias** exactly.
    
- Wrap any column that has spaces/special chars with **backticks**.
    
- Output **only** the SQL line (no extra text). When uncertain → output `''`.
    

#### Example (HR-specific, reformatted)

**Prompt logic summary (Judge):**

- Input: `${Answer Array}` (4 items for `Payment_Type`)
    
- All but one suggest `CASE WHEN Amount Code='P' THEN 'Percentage' ELSE 'Amount'` (base:`Amount Code`), confidences 92/88/90 → **Strong Consensus**.
    
- Safety: not a default literal; not boolean; passes.
    
- Transform tagging: ≥3 indicate `Conditional` → tag `[CONDITIONAL]`.
    

**Output (single line)**

```
pe.`Amount Code`, -- Payment_Type [CONDITIONAL]
```

_(If safety/consensus failed, it would be:)_

```
'', -- Payment_Type
```

#### Template — Arbitration Prompt (domain-agnostic YAML)

```yaml
role: "You are the Final Mapping Judge for the target field '${Target Column}'. Output ONLY the final SQL line."

input:
  table_alias: "${Table}"
  answer_array: "${Answer Array}"

instructions:
  extraction:
    - "From each JSON: source_column, confidence, status, rule_applied, transform_type, notes"
    - "Normalize source_column for comparison (ignore case/extra spaces)"
    - "Extract base column from formulas for consensus checks (e.g., UPPER(TRIM(X)) → X; CASE WHEN ... THEN Y → Y)"

  decision_tiers:
    - "Tier 1: Unanimous Agreement → choose shared base column"
    - "Tier 2: Strong Consensus (≥3 agree) → choose that base column"
    - "Tier 3: Weighted Consensus: sum(confidence/100) for status != 'NOT_FOUND'; if ≥ 2.5 → use highest-confidence"
    - "Tier 4: Derived Pattern (optional pack): map known targets to base columns when ≥2 are DERIVED"
    - "Tier 5: No Match: if none apply → output ''"

  safety_validation:
    - "Return '' if chosen source is 'error' or contains 'DEFAULT'"
    - "If boolean target, reject sources implying non-boolean domains"
    - "If target is Position_ID, reject sources with 'Description'/'Title'/'Name'"
    - "Reject single-character source names representing codes only"
    - "Apply table/domain-specific exclusions as required"

  transform_tags:
    - "If ≥3 elements have transform_type='Transform', append [TRANSFORM]"
    - "If ≥3 elements have transform_type='Conditional', append [CONDITIONAL]"

  special_overrides:
    - "Apply domain-specific overrides (e.g., Effective_As_Of fallbacks; currency defaults → '') as defined by the Column Object / Table Rules"

output_format:
  empty: "'', -- ${Target Column}"
  standard: "${Table}.`column_name`, -- ${Target Column}"
  with_tag: "${Table}.`column_name`, -- ${Target Column} [TRANSFORM/CONDITIONAL]"

critical:
  - "Output ONLY the SQL line"
  - "Preserve exact column name casing from source data"
  - "Use the provided ${Table} alias exactly"
  - "Use backticks around column names with spaces"
  - "When uncertain → output ''"
```

#### Quick QA (for your Judge row)

- [ ] Input `AnswerArray` elements share the same `target_field`.
    
- [ ] Tier logic applied in order; first satisfied tier chosen.
    
- [ ] Safety validation executed before emitting line.
    
- [ ] Backticks + alias formatting correct.
    
- [ ]  Only one line in **Result**.

### Step 4 (Compartmentalization):
Group all **arbitrated SQL lines** (from Step 3) under their **Blue** parent (category/table). For each table, concatenate the per-field SQL lines in the exact order you want them inserted and produce a single JSON payload called **`TableArray`**. This is what the SQL **Generator** (Step 5A) and **Validator** (Step 5B) consume.
#### Rules — What “good” looks like

- **Scope**: Include **only** Step-3 outputs that belong to the same **table/category (Blue)**.
    
- **Order (critical)**: The sequence in `TableArray` defines the INSERT and SELECT order. Use a deterministic sort, e.g.:
    
    1. `field_sequence` from Column Object (preferred), else
        
    2. stable alphanumeric by `Target Field`.
        
- **Shape**:
    
    - Each element must be a **single SQL select-line** from Step-3, e.g.  
        `pe.\`Amount Code`, -- Payment_Type [CONDITIONAL] `or the empty form` '', -- Currency`
        
- **Completeness**: Include **every** target field for the table—even if empty (`''`), so INSERT/SELECT counts match.
    
- **One per table**: Create **one** `TableArray` JSON for each Blue table/category.
    
- **Storage**: Save the `TableArray` JSON into the target **Blue** row (Result + Block if using **Both**).
    

Optional metadata fields that help Step 5:

- `table_name` (source label), `table_alias` (exact alias from your rules), `field_count`.
    

#### Example (Payment Elections)

**Inputs**: Arbitrated lines (Step 3) for table **Payment Elections** (`pe`).

**Arbitrated lines (sample):**

```
pe.`Employee Id`, -- Employee_ID
'', -- Currency
pe.`Amount Code`, -- Payment_Type [CONDITIONAL]
pe.`Amount`, -- Percent [TRANSFORM]
pe.`Amount Code`, -- Balance
```

**TableArray (JSON payload to store on the Blue row):**

```json
{
  "table_name": "Payment Elections",
  "table_alias": "pe",
  "fields": [
    "pe.`Employee Id`, -- Employee_ID",
    "'', -- Currency",
    "pe.`Amount Code`, -- Payment_Type [CONDITIONAL]",
    "pe.`Amount`, -- Percent [TRANSFORM]",
    "pe.`Amount Code`, -- Balance"
  ],
  "field_count": 5
}
```

This `TableArray` is now ready for Step 5’s Stored Procedure Generator/Validator.

#### Template — Blank `TableArray` (domain-agnostic)

```json
{
  "table_name": "${Blue Table Name}",
  "table_alias": "${AliasFromRules}",
  "fields": [
    // Ordered list of Step-3 SQL select-lines for this table.
    // Examples:
    // "${Table}.`Column Name`, -- Target_Field",
    // "'', -- Target_Field",
    // "${Table}.`Column Name`, -- Target_Field [TRANSFORM]",
    // "${Table}.`Column Name`, -- Target_Field [CONDITIONAL]"
  ],
  "field_count": 0
}
```

> **Populate rules:**
> 
> - Replace `${Blue Table Name}` with the exact display name (e.g., `Payment Elections`).
>     
> - Replace `${AliasFromRules}` using your alias map (e.g., `pe`).
>     
> - Fill `fields` in the **exact** order you want them to appear in INSERT/SELECT.
>     
> - Set `field_count` = length of `fields`.
>     

#### Smartsheet wiring (minimal)

- **Where**: Create the `TableArray` on the **Blue** parent row for each table.
    
- **How**:
    
    1. Report all Step-3 **Result** values (children) under that Blue row.
        
    2. Sort by `field_sequence` (if present) or `Target Field`.
        
    3. Concatenate into JSON:
        
        - Join each child **Result** (already a single SQL line) into a JSON array string.
            
        - Wrap with `{ "table_name": ..., "table_alias": ..., "fields": [...], "field_count": n }`.
            
- **SaveResponse**: **Both** so the generator can reference by BlockID or Result.
    

#### Quick QA

- [ ]  `fields[]` contains **every target field** for the table (empty lines included as `''`).
    
- [ ]  Order is deterministic and matches intended INSERT/SELECT order.
     
- [ ] `table_alias` matches your alias rules exactly.
    
- [ ] No stray comments/extra lines—each element is a **single** SQL select-line.
    
- [ ] `field_count` equals `len(fields)`.
    

That’s it—small step, huge payoff for a clean, one-shot generator in Step 5.

### Step 5 (Finalization):

Use your LLM to transform the **`TableArray`** (from Step 4) into:

1. A clean **MySQL stored procedure** that truncates, inserts, and selects the fields in the exact order provided, then
    
2. A **validator/corrector** pass that outputs only executable SQL, ensuring the INSERT and SELECT lists match the mapping exactly (including comma/edge-case rules).
    

#### Rules — Generator & Validator (domain-agnostic)

##### Inputs

- `Table` (canonical target table name; apply table-name normalization rules)
    
- `TableArray` JSON for the Blue table:
    
    - `table_name`, `table_alias`, `fields[]` (each item is a single SQL select-line from Step 3)
        

##### Generator must:

- Parse **all target fields** from each `fields[]` line (after `--` comment).
    
- Build `INSERT INTO ${Table} ([ALL_target_fields])` in that **exact order**.
    
- Build `SELECT DISTINCT` with the **same number of expressions**, one per line, matching each target field order.
    
- For non-empty sources, use `` ${alias}.`Field Name` `` (with backticks when needed).
    
- For empty mappings, use `''`.
    
- Append commas to **every field line except the last**.
    
- Keep the template FROM/WHERE structure with the correct **table alias**.
    
- Apply table-name normalization (e.g., hyphens → underscores, lowercase).
    
- **Do not** invent fields; include empty ones instead.
    

##### Comma & Edge-Case Rules

- Every field line ends with a comma **except the last**.
    
- For **consecutive trailing empties**, count all; **only** the final one has **no comma**.
    

##### Validator must:

- Recompute target field list by parsing `TableArray.fields[]` comments (`-- Target_Field`).
    
- Count and verify **INSERT vs SELECT** counts and order.
    
- Fix comma placement per the edge-case rule.
    
- Output **only** the final SQL procedure (no comments/markdown/prose).
    

#### Example (Reformatted from your spec)

**Generator behavior (summary):**

- Input `TableArray.fields[]` like:
    
    ```
    pe.`Employee Id`, -- Employee_ID
    '', -- Currency
    pe.`Amount Code`, -- Payment_Type [CONDITIONAL]
    pe.`Amount`, -- Percent [TRANSFORM]
    pe.`Amount Code`, -- Balance
    ```
    
- Extract target fields →  
    `(Employee_ID, Currency, Payment_Type, Percent, Balance)`
    
- Build INSERT and balanced SELECT with alias `pe`, preserving backticks and order.
    

**Example Output (as in your spec):**

```
CREATE DEFINER=root@localhost PROCEDURE sts_payment_elections()
BEGIN
  TRUNCATE TABLE payment_elections;
  INSERT INTO payment_elections (Employee_ID,First_Name,Last_Name,Country,Currency,Pay_Type,Payment_Type,Priority,Routing_Number,Account_Number,Bank_Name,Account_Type_Code,Amount,Percent,Balance)
  SELECT DISTINCT
    pe.`Employee Id`, -- Employee_ID
    pe.`Preferred/First Name`, -- First_Name
    pe.`Last Name`, -- Last_Name
    pe.`Home Country`, -- Country
    '', -- Currency
    pe.`Pay Type Code`, -- Pay_Type
    pe.`Amount Code`, -- Payment_Type
    pe.`Sequence`, -- Priority
    pe.`Routing Number`, -- Routing_Number
    pe.`Account Number`, -- Account_Number
    pe.`Bank Name`, -- Bank_Name
    pe.`Account Type`, -- Account_Type_Code
    pe.`Amount`, -- Amount
    pe.`Amount`, -- Percent
    pe.`Amount Code` -- Balance
  FROM `Payment Elections` pe
  WHERE pe.`Employee Id` IS NOT NULL;
END
```

**Validator behavior (summary):**

- Parse target fields from mapping comments.
    
- Verify counts/order.
    
- Ensure commas are correct (including trailing `''` edge cases).
    
- Output only the corrected procedure.
    

#### Templates — Prompts you can drop into `Instructions_1`

##### A) Generator Prompt (domain-agnostic YAML)

```yaml
role: "You are a MySQL stored procedure generator. Output ONLY executable SQL."

inputs:
  table_name_raw: "${Table}"          # e.g., "Payment Elections"
  table_array: "${TableArray}"        # JSON with table_name, table_alias, fields[]

rules:
  table_name_normalization:
    - "Replace hyphens with underscores"
    - "Lowercase final table name (e.g., 'Worker W-4 Withholdings' → 'worker_w4_withholdings')"
  parse_mapping_lines:
    - "Each item in table_array.fields is a single SQL select-line like: `${Table}.`Field Name`, -- Target_Field [TAG]` or `'', -- Target_Field`"
    - "Extract Target_Field from the comment after `--` to build the INSERT field list"
    - "Include EVERY Target_Field, even if source is empty ('')"
  select_rules:
    - "If source is not empty, use `${table_array.table_alias}.`Field Name`` with backticks if spaces"
    - "If source is empty ('') use just ''"
    - "One field per line"
    - "Every field line ends with a comma EXCEPT the last one"
  comma_edge_case:
    - "If multiple consecutive '' fields appear at the end of the SELECT, only the final one has no comma; the rest keep commas"
  from_where_template:
    - "FROM `${table_array.table_name}` ${table_array.table_alias}"
    - "WHERE ${table_array.table_alias}.`<key_field>` IS NOT NULL"  # leave `<key_field>` literal as a template placeholder
  output_format:
    - "CREATE DEFINER=root@localhost PROCEDURE sts_[normalized_table_name]()" 
    - "BEGIN"
    - "TRUNCATE TABLE [normalized_table_name];"
    - "INSERT INTO [normalized_table_name] ([ALL_target_fields_from_array])"
    - "SELECT DISTINCT"
    - "[source_expressions_in_same_order]"  # lines with comments: -- Target_Field
    - "FROM `[original_table_name]` [alias]"
    - "WHERE [alias].`<key_field>` IS NOT NULL;"
    - "END"
critical:
  - "Preserve exact casing of source column names"
  - "Use the provided alias from table_array.table_alias exactly"
  - "Use backticks for any column containing spaces/special characters"
  - "Output ONLY the SQL procedure (no markdown or explanations)"
```

**Notes for your runner:** After generation, you’ll typically replace `<key_field>` with the actual key before executing—or handle that via an additional prompt pass if you prefer.

##### B) Validator Prompt (domain-agnostic YAML)

```yaml
role: "You are a SQL procedure validator and corrector. Output ONLY clean, executable SQL."

inputs:
  generated_sql: "${Generated SQL Store 1}"   # prior step's output
  table_array: "${TableArray}"                # same JSON used by generator

validation_process:
  - "Parse table_array.fields and extract Target_Field names (after `--`). These define the complete ordered list."
  - "Parse generated_sql:"
  - "  1) Count INSERT field list and ensure it matches EXACTLY the mapping order"
  - "  2) Count SELECT expressions and ensure it matches INSERT count and order"
  - "  3) Verify commas: every line has a comma except the last"
  - "  4) Apply trailing '' edge-case rule (only final empty has no comma)"
  - "  5) Ensure alias equals table_array.table_alias and backticks are present where needed"
corrections:
  - "If mismatches are found, correct the SQL to satisfy all rules"
  - "Do not remove fields; use '' for unmapped ones"
output_requirements:
  - "Output ONLY the final SQL procedure"
  - "NO comments, NO markdown, NO extra text before/after"
format:
  - "CREATE DEFINER=root@localhost PROCEDURE sts_[normalized_table_name]() BEGIN TRUNCATE TABLE [normalized_table_name]; INSERT INTO [normalized_table_name] ([fields]) SELECT DISTINCT [source_expressions] FROM `[original_table_name]` [alias] WHERE [alias].`<key_field>` IS NOT NULL; END"
```

##### C) Optional: Alias Map (drop-in helper for domain consistency)

If you want the model to enforce canonical aliases, include a small JSON blob and reference it in either prompt:

```json
{
  "aliases": {
    "Payment Elections": "pe",
    "Assign Pay Groups": "apg",
    "Worker W-4 Withholdings": "www",
    "Worker FICA OASDI Exemption": "wfoe",
    "Worker FICA Medicare Exemption": "wfme",
    "Worker FUTA Exemption": "wfe",
    "Worker State Withholdings": "wsw",
    "Worker SUTA Exemption": "wse",
    "Worker Work County": "wwc",
    "Worker Residence County": "wrc",
    "Worker Work City": "wwci",
    "Worker Residence City": "wrci",
    "Worker Residence School Dist": "wrsd",
    "Worker Work Other Employer": "wwoe"
  }
}
```

#### Quick QA (per table)

- [ ] `TableArray.fields[]` covers **all** target fields (empty sources included).
    
- [ ] INSERT and SELECT counts **match** and preserve order.
    
- [ ] Comma rules satisfied (including trailing-empties edge case).
    
- [ ] Alias and backticks correct.
    
- [ ] Validator emits **only** the final SQL procedure.
    

That’s it—drop these prompts into your Step-5 rows (`Instructions_1`), hydrate with `${Table}` and `${TableArray}`, set **SaveResponse = Both**, and you’re production-ready.
