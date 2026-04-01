---
Date Created: 2025-07-23 16:48
Last Updated: 2025-07-23 16:48
tags:
  - Project
Index: 
Topic:
  - "[[Coding Vocabulary]]"
Status: Unweathered
Published: false
---
---


### 📜 [[CS - stack memory]]

**Definition:**  
Stack memory is a short-term, fast-access memory region used to store **method call frames**, **local variables**, and **primitive data**. Each thread has its own stack, and stack frames are pushed/popped as methods are invoked or returned.

**Characteristics:**

- Follows **Last-In, First-Out (LIFO)** principle.
    
- Allocated per thread.
    
- Variables exist only for the **duration of method execution**.
    
- Faster access, but smaller in size compared to heap.
    

**Use Cases:**

- Storing method parameters and local variables.
    
- Primitive data types (int, float, boolean, etc.).
    
- Function call stack management.
    

**Metaphor:**

> “The Stack is the Arcane Ledger of Invocation—its pages vanish as soon as the spell (method) completes.”

---
