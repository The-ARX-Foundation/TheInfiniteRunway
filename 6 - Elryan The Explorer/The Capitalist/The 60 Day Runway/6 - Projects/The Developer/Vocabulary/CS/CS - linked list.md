---
Date Created: 2025-07-23 23:42
Last Updated: 2025-07-23 23:42
tags:
  - Project
Index:
  - "[[Computer Science Vocabulary List]]"
Topic: []
Status: Unweathered
Published: false
---
---

Ah, now you ask for the **root form of the Chain Itself**—what is a **linked list**, this ancient and elegant construct of the Low-Level Plane?

Let us now **weave the truth from first principles**, programmatically and conceptually.

---

## 🔗 What Is a Linked List?

A **linked list** is a **linear data structure** where elements (called **nodes**) are **connected by references** rather than memory placement.

Each node holds:

- A **value**
    
- A **reference (or pointer)** to the next node
    

> Unlike arrays, linked lists do not rely on contiguous memory.  
> Each node is its own **independent heap entity**, bound only by the reference it carries.

---

## 🧱 Structure of a Node (Singly Linked)

```java
class Node {
    int data;
    Node next;  // reference to the next node
}
```

This defines a **node**. (explained how this works in [[JAVA - making a linked list]])To build a chain:

```java
Node a = new Node();
a.data = 10;

Node b = new Node();
b.data = 20;

a.next = b; // links a → b
```

Thus:

```
[a: 10] → [b: 20] → null
```

---

## 🧙‍♂️ How Is It Different from an Array?

|Feature|Array|Linked List|
|---|---|---|
|Memory|Contiguous block|Scattered (heap allocations)|
|Insertion|Costly in middle (`O(n)`)|Efficient (`O(1)` at head)|
|Access|Fast random access (`O(1)`)|Sequential only (`O(n)`)|
|Resize|Requires new allocation|Grows naturally via links|
|Cache Locality|High (good)|Low (bad)|

---

## 🔁 Iterating Over a Linked List

```java
Node current = head;
while (current != null) {
    System.out.println(current.data);
    current = current.next;
}
```

---

## 🔂 Variants of Linked Lists

|Type|Structure|Notes|
|---|---|---|
|**Singly Linked**|Each node has `next`|Default, simple|
|**Doubly Linked**|Each node has `next` and `prev`|Allows reverse traversal|
|**Circular Linked**|Last node’s `next` points to head|Useful in round-robin, buffers|

---

## 🛠️ Why Use a Linked List?

- Constant-time insertion/removal at the **head**
    
- Excellent for **queues**, **stacks**, and **hash table buckets**
    
- Supports **dynamic memory** usage (you don’t need to know size in advance)
    

---

## 📜 Complete Example: Java Singly Linked List

```java
class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
        this.next = null;
    }
}

public class LinkedListDemo {
    public static void main(String[] args) {
        Node head = new Node(10);
        head.next = new Node(20);
        head.next.next = new Node(30);

        Node current = head;
        while (current != null) {
            System.out.println(current.data);
            current = current.next;
        }
    }
}
```

### Output:

```
10
20
30
```

---

## 🧠 Reflection Questions

**Q1.** Why do you think linked lists are a good fit for hash table chaining but not ideal for high-speed iteration?

**Q2.** How would you reverse a singly linked list in-place, without using recursion?

**Q3.** How could a linked list be enhanced to support fast index-based lookup—would it still be a linked list?

!!BREATHE!!