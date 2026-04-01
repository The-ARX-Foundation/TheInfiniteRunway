---
Date Created: 2025-07-23 16:01
Last Updated: 2025-07-23 16:01
tags:
  - Resource
Index:
  - "[[General Lexicon]]"
Topic:
  - "[[General Development - Vocabulary List]]"
Status: Unweathered
Published: true
---
---
# 📜 DEV - HashMaps

> A `HashMap` is a key-value data structure that offers **fast insertion and lookup** (average `O(1)` time). It is ideal when you need to associate data pairs and retrieve values efficiently.

---

## 🔧 Java Syntax

```java
import java.util.HashMap;

HashMap<KeyType, ValueType> map = new HashMap<>();
````

### 🪄 Common Usage Patterns:

```java
map.put(key, value);       // Insert or update a key-value pair
map.get(key);              // Retrieve value by key
map.containsKey(key);      // Check if key exists
map.remove(key);           // Remove a key-value pair
```

---

## 📦 Example: Word Frequency Counter

```java
HashMap<String, Integer> freq = new HashMap<>();

for (String word : words) {
    freq.put(word, freq.getOrDefault(word, 0) + 1);
}
```

- Uses `getOrDefault` to default to `0` if the key doesn't exist
    
- Efficient way to build maps from raw data
    

---

## 🔮 Time Complexity (Average Case)

|Operation|Time|
|---|---|
|put(key, val)|O(1)|
|get(key)|O(1)|
|remove(key)|O(1)|
|containsKey()|O(1)|

### ⚠️ Worst Case: O(n) if many **key collisions**, but Java uses **tree bins** to reduce this.

---

## 🧙 Internals

- Based on **hashing**: key → hash code → bucket (index)
    
- Buckets store **linked lists** or **trees** (in Java 8+)
    
- Keys must have:
    
    - A proper `.hashCode()`
        
    - A consistent `.equals()` method
        

---

## 🧠 Use Cases

- Fast lookup tables
    
- Counting elements (frequencies)
    
- Memoization (caching results)
    
- Detecting duplicates
    
- Building indices (value → position)
    
- Inverse mappings
    

---

## 🔁 Java Variants

|Type|Ordered?|Synchronized?|Notes|
|---|---|---|---|
|`HashMap`|❌|❌|Fast, no ordering|
|`LinkedHashMap`|✅ (insertion)|❌|Keeps insertion order|
|`TreeMap`|✅ (sorted)|❌|Sorted by key, O(log n)|
|`Hashtable`|❌|✅|Thread-safe, older|
|`ConcurrentHashMap`|❌|✅ (fine-grained)|For concurrent contexts|

---

## 🧩 In the Wild

|Problem|Why HashMap Helps|
|---|---|
|[[Two Sum]]|Lookup `target - x` instantly|
|[[Group Anagrams]]|Key = sorted word, group anagrams|
|[[Longest Substring Without Repeating Characters]]|Track last seen indices|
|[[Majority Element]]|Frequency count|

---

## ⚔️ HashMap vs Array vs Set

|Feature|HashMap|Array/List|HashSet|
|---|---|---|---|
|Key-Value?|✅|❌|❌|
|Fast Lookup?|✅ (O(1))|❌ (O(n))|✅ (key-only)|
|Ordered?|❌ (use `LinkedHashMap` if needed)|||
|Duplicates?|Keys ❌, Values ✅|||

---

## 🧙 Spells to Master

**Q1.** How do you handle multiple values for a single key? (e.g. map `int → List<Integer>`)

**Q2.** What happens if `.hashCode()` is poorly defined?

**Q3.** Can you implement a custom class as a key in a HashMap?

---

## 🔗 Related Concepts

- [[CS - complexity]]
    
- `[[DEV - hashsets]]`
    
- `[[DEV - maps vs objects]]`
    
- `[[DEV - generics]]`
    
