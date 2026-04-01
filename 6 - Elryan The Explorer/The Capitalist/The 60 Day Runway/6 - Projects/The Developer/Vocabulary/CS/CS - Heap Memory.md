---
Date Created: 2025-07-23 16:46
Last Updated: 2025-07-23 16:46
tags:
  - Project
Index: 
Topic:
  - "[[Coding Vocabulary]]"
Status: Unweathered
Published: false
---
---
### 📜 [[CS - Heap Memory]]

**Definition:**  
Heap memory is a region of dynamically allocated memory managed by the Java Virtual Machine (JVM) or underlying runtime. It is used to store **objects**, **class instances**, and **reference-type data** created at runtime, typically via the `new` keyword.

**Characteristics:**

- Resides in the **Heap** segment of memory.
    
- Stores data **accessible across methods and threads** via reference variables.
    
- Objects remain until explicitly dereferenced and **garbage collected**.
    
- **Slower access** compared to stack, but provides long-lived storage.
    

**Use Cases:**

- Object instantiation (e.g. `new MyClass()`).
    
- Data structures like Lists, Maps, and Trees.
    
- Long-lived data shared across scopes or threads.
    

**Metaphor:**

> “The Heap is the Eternal Library, where summoned objects reside until forgotten by all references—and reclaimed by the garbage collector.”
