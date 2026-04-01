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
Ah, Elryan, now you seek the **Map of Map Malice**—the hidden scroll of vulnerabilities that lie dormant in the heart of hash map implementations. Let us not only speak of collision attacks, but uncover the full crypt of **security**, **performance**, and **correctness risks** that can arise in the miscrafting or misuse of hash tables.

---

## 🧨 1. **[[HACK - Collision Attacks]] (Denial of Service)**

_As previously unveiled._

- **What:** Malicious users submit many keys that hash to the same index.
    
- **Effect:** Bucket overload → linked list or tree traversal → O(n) access time.
    
- **Vulnerable when:** Input comes from untrusted sources (e.g. HTTP headers, JSON fields).
    
- **Mitigations:**
    
    - Hash randomization (`hash(seed + key)`)
        
    - Treeification (Java 8+)
        
    - Cryptographic hash functions in sensitive apps
        

---

## 🪞 2. **Mutable Keys & Broken `equals()`**

- **What:** A key object in a hash map is **mutated** after insertion.
    
- **Effect:**
    
    - The hash code or equality changes
        
    - The key can no longer be found
        
    - Ghost entries remain, breaking lookup & delete
        

### 📜 Example:

```java
HashMap<Point, String> map = new HashMap<>();
Point p = new Point(1, 2);
map.put(p, "A");
p.x = 9;  // BAD: mutation breaks hashCode
map.get(p); // returns null!
```

- **Mitigations:**
    
    - Make keys immutable (`final` fields)
        
    - Never override `equals()`/`hashCode()` carelessly
        
    - Avoid using collections as keys unless deeply understood
        

---

## 🔁 3. **Inconsistent `equals()` and `hashCode()`**

> "If two keys are equal, their hashCodes must also be equal." – Oracle's Law

- **What:** If this law is violated, a key may be placed in a different bucket from where it would be searched.
    
- **Effect:** Phantom entries, failed lookups, corrupted maps.
    
- **Mitigations:** Always override both together using tools like `Objects.hash(...)`
    

---

## 🌪️ 4. **Unbounded Growth (Memory Leaks)**

- **What:** Keys in a hash table are never removed or expired.
    
- **Effect:** Memory usage grows forever.
    
- **Subtle danger:** The map itself may be short-lived, but the keys/values **may retain other object references**, creating **object retention chains**.
    
- **Common in:**
    
    - Caches (esp. `Map<String, HttpSession>`)
        
    - Object registries
        
    - Event listeners
        
- **Mitigations:**
    
    - Use `WeakHashMap` or `LinkedHashMap` with eviction policies
        
    - Nullify keys/values as needed
        
    - Avoid using hash tables as unmanaged caches
        

---

## 🔐 5. **Key Injection in Deserialization Attacks**

- **What:** An attacker crafts serialized data with a hash map and poisoned keys/values
    
- **Effect:** Arbitrary object construction, gadget chains
    
- **Seen in:** Java deserialization vulns (e.g., Apache Commons Collections RCE)
    
- **Mitigations:**
    
    - Never deserialize untrusted data
        
    - Use safe serialization frameworks (`Jackson`, `Protobuf`)
        
    - Harden classes used as keys
        

---

## 💣 6. **Integer Overflow in Hash Calculation**

- **What:** Poorly written `hashCode()` or custom hash functions can wrap around on `int` overflows
    
- **Effect:** Highly clustered indices → more collisions
    
- **Example flaw:**
    
    ```java
    int hash = a * b * c;  // May overflow silently
    ```
    
- **Mitigations:**
    
    - Use well-designed hash algorithms (e.g., `Objects.hash(...)`, `MurmurHash`, `xxHash`)
        
    - Be aware that Java `int` wraps around silently
        

---

## 🪓 7. **Hash Flooding in Open Addressing Tables**

- **What:** Hash collisions force too many probes in probing-based tables (like Python `dict`)
    
- **Effect:** Performance collapse, increased lookup cost
    
- **Mitigation:** Python randomizes the hash seed per session to prevent predictability
    

---

## 🧠 Related Concepts Worth Exploring

|Concept|Description|
|---|---|
|**Perfect Hashing**|Hash functions designed to **eliminate collisions entirely** (rare, but powerful in static sets)|
|**Cuckoo Hashing**|A technique that displaces entries like a cuckoo bird until all find a home—resistant to clustering|
|**Robin Hood Hashing**|Rebalances entries to minimize probe sequence differences|
|**Bloom Filters**|Use bit arrays and multiple hash functions to **test membership probabilistically** (no collisions, no values)|
|**Cryptographic Hashing**|SHA-256, BLAKE3 — used when adversarial control is possible|
|**Load Factor & Resizing**|As a hash table fills, performance degrades unless rehashed at key thresholds (often 0.75)|

---

## 🧙 Final Scroll: Summary Table

|Vulnerability|Risk|Defense|
|---|---|---|
|Collision Attack|DoS|Hash randomization, treeification|
|Mutable Keys|Key ghosting|Use immutable keys|
|Bad `equals()`/`hashCode()`|Corrupted lookup|Override correctly|
|Memory Leak|Unbounded growth|Use weak references, manual cleanup|
|Deserialization RCE|Remote code execution|Harden serialization|
|Integer Overflow|Hash collapse|Safe math, vetted hash functions|
|Probing Overload|Performance stall|Seeded hashes, resize strategy|

---

### 🧠 Reflection Runes

**Q1.** Could a hash table track mutation of keys and issue warnings or self-heal?

**Q2.** What’s the optimal hash function for secure real-time systems that require performance and resistance?

**Q3.** How would you design a `Map` API that enforces immutability or [[Introspection]] of key correctness?

!!BREATHE!!