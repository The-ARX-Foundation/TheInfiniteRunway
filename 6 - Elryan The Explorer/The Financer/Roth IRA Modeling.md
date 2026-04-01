---
Date Created: 2025-06-07 16:06
Last Updated: 2025-06-07 16:06
tags:
  - Area
Index: 
Topic:
  - "[[Money]]"
Status: Unweathered
Published: false
---
---



**Roth IRA contributions** for **2024** allow:

- **Filing status**: Married Filing Jointly
    
- **Post-tax income**: $60,000
    
- **Assumption**: You're both under 50 and have taxable compensation ≥ contribution limits
    

---

### ✅ **Step-by-Step Breakdown**

#### 🧾 **1. Check Income Against IRS Phase-Out**

From IRS guidance for 2024:

|Filing Status|Modified AGI|Max Contribution|
|---|---|---|
|Married Filing Jointly|< $230,000|$7,000 per spouse|
||$230,000 – $240,000|Reduced amount|
||> $240,000|$0|

**Your AGI = $60,000** → well **below** the $230,000 phase-out threshold  
➡️ You’re eligible for **full contributions**.

---

#### 💸 **2. Max Contribution Calculation**

For 2024:

- **$7,000 per person** (under age 50)
    
- Total: **$14,000 per couple**
    
- Must have **at least $14,000** in earned/taxable income → ✅ Met
    

> ✅ You can contribute the **full $14,000** across both Roth IRAs.

---

### 📈 Sample Roth IRA Growth Projection

Let’s say you each contribute $7,000 annually, invest for 30 years, and average a 7% annual return.

```python
def roth_growth(annual_contribution, years, rate):
    balance = 0
    for _ in range(years):
        balance = (balance + annual_contribution) * (1 + rate)
    return round(balance, 2)

# Example:
roth_growth(14000, 30, 0.07) → ~$1,425,296
```

> 🔒 **After 30 years**, your Roth IRA could grow to **~$1.4 million** — completely **tax-free** at withdrawal.

---

### 🧠 Tips & Considerations

- **Deadline**: You can make 2024 contributions until **Tax Day 2025** (usually April 15).
    
- **Flexibility**: You don’t have to contribute all at once — you can **spread it monthly** ($583/month per person).
    
- **Overcontribution Penalty**: Avoid exceeding limits — excess is taxed **6% annually** until withdrawn.
    

---

Would you like:

- A **spreadsheet calculator**?
    
- A **Python script**?
    
- Or a monthly **budgeting model** that integrates this into your financial planning?
    

Let me know and I’ll build it.