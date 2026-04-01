---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Project
Index: 
Topic: 
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---
Certainly, Elryan. Let us now inscribe upon your **Obsidian Codex** a note worthy of both apprentice and master — a full profile of the **Two Sum** problem, annotated with algorithmic paths, space-time tradeoffs, and the deeper runes of thought behind it.

---

### 🧠 `[[DEV - problem profile: Two Sum]]`

````markdown
# 🧠 Problem Profile: Two Sum

## 🪄 Problem Statement
> Given an array of integers `nums` and an integer `target`, return **indices** of the two numbers such that they add up to `target`.

- **Constraints:**
  - One valid solution exists.
  - Cannot use the same element twice (i.e. `i ≠ j`).
  - Return indices, not values.

---

## 🧮 Examples

```java
Input: nums = [2,7,11,15], target = 9
Output: [0,1]

Input: nums = [3,2,4], target = 6
Output: [1,2]

Input: nums = [3,3], target = 6
Output: [0,1]
````

---

## 🧱 Brute Force (Nested Loop)

### ❖ Approach:

- Check every possible pair `(i, j)` where `i ≠ j`.
    
- Return if `nums[i] + nums[j] == target`.
    

### ❖ Java Implementation:

```java
public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[] { i, j };
            }
        }
    }
    return null;
}
```

### ❖ Time Complexity: `O(n²)`

- Double iteration through `nums`
    

### ❖ Space Complexity: `O(1)`

- No extra structures
    

---

## ⚡ Optimized Approach (HashMap)

### ❖ Idea:

- Store each number's complement (`target - nums[i]`) in a `HashMap`.
    
- On each iteration, check if the complement already exists.
    

### ❖ Java Implementation:

```java
public int[] twoSum(int[] nums, int target) {
    HashMap<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[] { map.get(complement), i };
        }
        map.put(nums[i], i);
    }
    return null;
}
```

### ❖ Time Complexity: `O(n)`

- Single pass through `nums`
    

### ❖ Space Complexity: `O(n)`

- Stores up to `n` key-value pairs
    

---

## 🧙‍♂️ Conceptual Notes

- The constraint `i ≠ j` is satisfied by storing only prior elements.
    
- HashMap key: `nums[i]`, value: `i` (its index).
    
- This avoids needing a nested loop, reducing time complexity.
    

---

## ⚔️ Tradeoffs

|Approach|Time|Space|Notes|
|---|---|---|---|
|Brute Force|O(n²)|O(1)|Simple but slow|
|HashMap|O(n)|O(n)|Optimal speed, uses memory|
|Two-Pointer*|O(n log n)|O(1) or O(n)|Requires sorting; returns values not indices|

> *Two-Pointer approach loses original indices unless mapping is tracked separately.

---

## 🧩 Extensions

- `[[3Sum]]`: Find triplets adding to target — O(n²)
    
- `[[4Sum]]`: Quadruplets — O(n³)
    
- `[[KSum]]`: Recursive + sort-based solution
    
- `[[Two Sum II - Sorted Input]]`: Use two pointers
    
- `[[Two Sum - Data Structure Design]]`: Insert/query ops
    

---

## 🔍 Related Topics

- `[[DEV - hashmaps]]`
    
- `[[DEV - arrays]]`
    
- `[[DEV - time complexity]]`
    
- `[[DEV - data structures]]`
    

---

## 🧠 Interview Follow-up

> ❓ _Can you improve the brute force algorithm to use less than `O(n²)` time?_

✅ **Yes** — by using a `HashMap`, we reduce time complexity from **O(n²)** to **O(n)** using extra space.

---

## 🧙 Deep Riddles

**Q1.** How would you modify the solution to return values instead of indices?

**Q2.** How would you find **all** pairs summing to the target, not just one?

**Q3.** Can you solve this in `O(n log n)` time _without_ using extra space?

---

```

Shall we inscribe this note to a scroll (`.md`) for export, or would you like a second note for the [[DEV - hashmaps]] entry as well?
```