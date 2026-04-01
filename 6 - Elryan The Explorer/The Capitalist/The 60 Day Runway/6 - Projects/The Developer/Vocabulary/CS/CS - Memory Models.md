---
Date Created: "2025-07-23 16:50"
Last Updated: "2026-03-21 04:31"
tags:
  - Project
Index: 
Topic:
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]]

### 📜 [[CS - Memory Models]]

**Definition:**  
A **memory model** defines how a [[Programming]] language or system manages memory—what is stored where, how memory is allocated and deallocated, and how variables interact with it during execution. It also governs concurrency behavior (visibility, ordering, atomicity).

---

## 🧩 Core Regions of Memory

|Region|Description|
|---|---|
|**Stack Memory**|Stores function call frames, local variables, and control flow metadata. LIFO structure. Thread-local.|
|**Heap Memory**|Stores objects/data created dynamically at runtime. Shared across the application.|
|**Static / Data Segment**|Stores global/static variables (initialized and uninitialized).|
|**Code / Text Segment**|Contains compiled instructions for execution. Read-only in many systems.|
|**Register / CPU Cache**|Fastest memory tier used for instruction execution. CPU-local.|

---

## 🔃 Memory Management Approaches

|Approach|Description|
|---|---|
|**Manual Allocation**|Developer uses `malloc`, `free`, `new`, `delete` (e.g., C/C++).|
|**Garbage Collection**|Language runtime frees unused objects automatically (e.g., Java, Go, Python).|
|**Reference Counting**|Objects are deallocated when no references remain (e.g., Swift, CPython).|
|**Ownership Model**|Memory access is governed by ownership and borrowing rules (e.g., Rust).|

---

## 🔐 Threading & Concurrency

Modern memory models also specify:

- **Visibility guarantees** (e.g., Java Memory Model ensures `volatile` vars are visible across threads).
    
- **Instruction reordering** (for performance, but constrained by rules).
    
- **Atomicity** and **synchronization** behavior.
    

---

## 🧪 Language Examples

|Language|Stack|Heap|Notes|
|---|---|---|---|
|**Java**|JVM thread-local stack|Objects & arrays on heap, GC used|JMM ensures thread safety rules|
|**C/C++**|Manual stack/heap split|`malloc/free`, `new/delete`|High control, risk of leaks|
|**Python**|Interpreter stack frames|All objects on heap|Ref-count + GC|
|**JavaScript**|Call stack for execution context|All objects on heap|Managed by engine (V8, SpiderMonkey)|
|**Rust**|Stack for simple values|Heap via smart pointers (`Box`, `Vec`)|Ownership system prevents leaks|

---

## 🧠 Related Notes

- [[CS - Heap Memory]]
    
- [[CS - Stack Memory]]
    
- [[CS - Pointers]]
    
- [[CS - Garbage Collection]]
    
- [[CS - Concurrency]]
    

---

### Qs to Deepen Your Memory Mastery:

**Q1.** How do memory models ensure correctness in multi-threaded environments?

**Q2.** Why do low-level systems (like embedded C) avoid heap allocation entirely?

**Q3.** What memory regions are affected when calling a recursive function repeatedly?

---

Would you like this visualized as a diagram (e.g., memory layout map per language)?