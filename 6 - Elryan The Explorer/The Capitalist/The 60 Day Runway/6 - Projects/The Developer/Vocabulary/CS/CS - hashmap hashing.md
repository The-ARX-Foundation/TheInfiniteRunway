---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Project
Index: 
Topic: 
Status: Unweathered
Published: false
---
---
Ahh, now you ask the **sacred threefold** of hashing's design:  
🔹 What is being hashed?  
🔹 Why the modulus?  
🔹 How is the hash actually computed?

You tread now into the **mathematical crucible of key-mapping**, where theory, language, and memory meet. Let us trace the flow of essence through each stage.

---

## 🧿 Part 1 — **What Is Being Hashed?**

> 🧙 “The _key_ is what is hashed in a key–value pair.”

### ✅ Hashing targets the **key**, not the value.

In a `Map<K, V>`, the hash function is applied to the key to determine **where in memory (which bucket)** the associated value shall be placed.

```java
map.put("Elryan", "Wizard");
```

Behind the scenes:

```java
int hash = "Elryan".hashCode();  // → a big integer
int index = hash % table.length; // → index of the bucket
```

So:

- `Elryan` is hashed.
    
- The resulting integer is reduced (via modulus) to find its **bucket**.
    

---

## 🧮 Part 2 — **Why Modulus? What Sets the Modulus Base?**

> 🧙 “The modulus base is the **capacity** of the hash table.”

### ⚙️ The formula is:

```java
int index = Math.abs(key.hashCode()) % table.length;
```

- `table.length` = the current size of the internal array (e.g., 16, 32, 64…)
    
- It **bounds the hash** into a valid index range: `[0, N-1]`
    

### 🏗️ Who sets the size?

- You can set it manually on initialization:
    
    ```java
    new HashMap<>(initialCapacity);
    ```
    
- Or the system grows it **dynamically** as the number of entries grows past a **load factor threshold** (default `0.75`)
    

> ❗ The modulus base is **not based on memory directly**, but it **affects memory**: a larger `table.length` allocates a bigger array.

---

## 🧠 Part 3 — **What Computes the Hash? How?**

### Java:

- Every Java object has a `.hashCode()` method
    
- By default (in `Object`), it returns a memory-based value (not great for logical identity)
    
- Most classes override it to return a **content-based integer**
    

#### Examples:

```java
"abc".hashCode() → 96354
Integer.valueOf(42).hashCode() → 42
```

**Strings in Java:**

```java
s[0]*31ⁿ⁻¹ + s[1]*31ⁿ⁻² + ... + s[n-1]
```

> Uses a **polynomial rolling hash** over character codes. Very efficient, collision-aware.

### Python:

Python’s built-in `hash()` works similarly but includes **runtime randomization** (for security against collision attacks).

```python
hash("abc") → randomized per run
```

> Python dicts use a private internal hash implementation tuned for open addressing.

---

## 🔁 Combined Flowchart: Hash Table Insertion

```plaintext
          ┌────────────┐
  Key →   │ hashCode() │ → int
          └─────┬──────┘
                ↓
        hash % table.length  → index
                ↓
         table[index] ← Entry<K,V>
```

---

## 🧠 Summary Scroll

|Question|Answer|
|---|---|
|**What is hashed?**|The **key** of the key-value pair|
|**What sets modulus base?**|The size of the underlying array (capacity of the table)|
|**Why modulus?**|To constrain the hash to valid array indices (0–N-1)|
|**Who computes the hash?**|The `.hashCode()` method of the key object|
|**What influences capacity?**|Initial setting or auto-grow on load factor breach|

---

### 🧠 Reflection Runes

**Q1.** What properties must a good `.hashCode()` method follow to maintain map integrity?

**Q2.** How do power-of-two capacities affect hash distribution vs prime sizes?

**Q3.** Could we implement a memory-aware hash table that resizes based on actual heap usage rather than entry count?

!!BREATHE!!