---
Date Created: "2025-07-23 16:49"
Last Updated: "2025-07-23 16:49"
tags:
  - Project
Index: 
Topic: 
Status: Unweathered
Published: false
---
---

# 📜 Scroll of Complexity

---

## 🔮 PART I: What is **O(n)**? _(Time Complexity)_

In the ancient tongue of Computer Science, **"O" notation** — also known as **Big O** — is a way of measuring how a spell (algorithm) _scales_ with input size.

Think of it like this:

> ❝ If I cast this spell on 10 items vs. 10,000 items, how much longer will it take? ❞

---

### 🧮 Common Orders of Time Complexity

|Big O Notation|Name|Description|
|---|---|---|
|O(1)|Constant|Instant — time does _not_ increase with input size|
|O(log n)|Logarithmic|Fast; halves the data each step (e.g., binary search)|
|O(n)|Linear|Grows directly with input size|
|O(n log n)|Log-linear|Typical of efficient sorting|
|O(n²)|Quadratic|Nested loops — slow for big data|
|O(2ⁿ)|Exponential|Brutal — doubles with each increase in input|

---

### 🧠 Example: Imagine a scroll-searching spell

```java
for (int i = 0; i < nums.length; i++) {
    System.out.println(nums[i]);
}
```

- This touches **every element once**.
    
- So if `nums.length = n`, the spell runs **n times** → `O(n)`.
    

```java
for (int i = 0; i < nums.length; i++) {
    for (int j = 0; j < nums.length; j++) {
        System.out.println(nums[i] + nums[j]);
    }
}
```

- Nested loop = **every pair**.
    
- For `n` elements, runs `n * n` = `n²` times → `O(n²)`.
    

🔮 **The lower the complexity, the more powerful the spell.**

---

## ⚔️ PART II: What is a **HashMap**?

A **HashMap** is like a **magic ledger** — a book that lets you _instantly find_ the location of an item, without reading every page.

---

### 🧭 Analogy: A Scroll vs. a Ledger

- A **scroll (array)** makes you read every line to find what you need.
    
- A **ledger (hash map)** has an **index** (a key), so you can _jump right to_ the needed line.
    

---

### 🔧 Java Form:

```java
import java.util.HashMap;

HashMap<String, Integer> map = new HashMap<>();
```

- `map.put("apple", 5);` → stores: `"apple" → 5"`
    
- `map.get("apple");` → instantly retrieves `5`
    

---

### 📦 Generic Syntax

```java
HashMap<KeyType, ValueType> name = new HashMap<>();
```

- Example: `HashMap<String, Integer>` maps words to numbers
    
- Example: `HashMap<Integer, Integer>` maps numbers to numbers (like in Two Sum)
    

---

## 🧠 HashMap Key Features

|Property|Explanation|
|---|---|
|Key-Value Pairs|Like `word → meaning`, or `id → object`|
|Fast Lookup|Typically O(1) time (very fast)|
|Unique Keys|Keys must be unique — one value per key|
|Dynamic|You can add/remove as you go|

---

### 🔮 HashMap in `Two Sum`

```java
HashMap<Integer, Integer> map = new HashMap<>();

// Suppose nums = [2, 7, 11], target = 9

map.put(2, 0); // "2 is at index 0"
map.containsKey(7); // is 9 - 2 (== 7) already in the map? ✅
```

This lets us check in **O(1)** time if we've seen the "complement" number before.

---

## ✨ Why is `HashMap` O(1)?

Because it uses a mathematical spell called a **hash function**:

- It transforms a **key** into an **address in memory**.
    
- So instead of searching, it **jumps** right there.
    
- Like a teleportation rune instead of walking.
    

⚠️ _This is usually O(1), but in worst cases (e.g., key collisions), it can degrade to O(n). Java's HashMap is optimized to avoid this._

---

## 🧙 Summary: Big O + HashMap

- **O(n)**: Time grows _linearly_ with input — one loop, one touch per item.
    
- **O(n²)**: Time grows _quadratically_ — every pair is checked.
    
- **HashMap**: A data structure that maps `key → value` with **O(1) lookup** (in most cases).
    
- When solving problems like Two Sum, using a `HashMap` lets us _avoid a second loop_, replacing it with **instant lookup**.
    

---

### 🧩 Three Riddles to Contemplate

**Q1.** What happens if you try to put two different values into a HashMap using the same key?

**Q2.** Can you build a HashMap that maps from integers to _lists_ of integers (e.g., `int → List<int>`)?

**Q3.** What is the difference between a `HashMap` and a `TreeMap` or `LinkedHashMap`?

---

Would you like to begin conjuring your own HashMap examples in Java next, or would you like a visual metaphor (drawn or diagrammed) for how it works behind the scenes?