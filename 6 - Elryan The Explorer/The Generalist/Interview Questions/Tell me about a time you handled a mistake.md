---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index: 
Topic:
  - "[[Biomedical Engineering]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Biomedical Engineering]], [[Programming]]

## 1. **Haridas Lab — Shape Memory Anchor Failure**

**Situation:** You were working on the _Chorioanchor v2_ for fetoscopic surgery.  
**Task:** Design and test a shape-memory anchoring tool.  
**Mistake:** After investing substantial effort into designing and testing shape memory polymers, you discovered they actually **reduced anchoring strength**.  
**Action:** You built custom testing rigs, quantitatively analyzed results in cardiac tissue, and **recognized and admitted** the failure — choosing to **pivot the project** instead of forcing the idea forward.  
**Result:** Your data-led approach prevented wasted time and allowed the team to reorient design goals — a mature and responsible outcome.

🎤 **How to phrase it in the interview:**

> “In one project, I helped design a fetoscopic anchoring tool using shape memory polymers. After weeks of prototyping and building a thermal testing rig, our quantitative imaging showed the material actually decreased anchor retention. At first, it felt like a failure — but by analyzing and presenting the data clearly, we scrapped that direction and moved on quickly. It taught me that admitting a design flaw early is better than sinking effort into a dead-end.”


_(This is your favorite — now with STAR breakdown)_

**S**: Working on a fetoscopic anchoring tool, I hypothesized that incorporating shape memory polymers would improve retention in fetal membrane tissue.  
**T**: I was responsible for designing, prototyping, and testing multiple variants using thermal cycling and tissue anchoring rigs.  
**A**: After weeks of fabrication, I built a test rig and ran quant imaging on ex vivo cardiac tissue. The results consistently showed **reduced** anchoring performance due to recoil forces from the shape memory material.  
**R**: Instead of pushing forward, I presented the negative results, **scrapped the shape memory direction**, and helped steer the team toward passive geometry-based retention designs.  
**Lesson**: Don’t fall in [[Love]] with the cool tech — let the data lead.



---

## 6. **Haridas Lab — Communication Gap on ISO Cytotoxicity Testing**

**S**: You were collaborating with materials science researchers unfamiliar with ISO 10993 protocols.  
**T**: Your role was to ensure proper adhesive extraction and L929 exposure protocols.  
**A**: You assumed they understood the sterility and incubation requirements — but their initial samples came contaminated or improperly incubated.  
**R**: You clarified roles, created a step-by-step checklist, and gave a short walkthrough, ensuring better alignment moving forward.  
**Lesson**: **Cross-disciplinary work requires translation**, not just explanation — clarity over assumption.

---

## **Haridas Lab – Atrial Shunt Soldering Failure**

**S**: While developing a fetoscopic electrosurgical tool using flexible PCBs, I was tasked with manually soldering biphasic leads to deliver precise electrical signals for cardiac tissue incision trials.  
**T**: I needed to prepare a batch of test-ready PCBs for stimulation trials on ex vivo bovine hearts, ensuring structural integrity and electrical reliability.  
**A**: In the initial iteration, I used too high of a soldering iron temperature, which caused the pads to **delaminate from the flexible PCB substrate**. This led to **mechanical failure** in the lead bonds during testing. Once I observed this failure, I diagnosed the issue, reinforced the existing connections with **non-conductive adhesive** to prevent stress fractures, and updated the SOP with **lower-temp solder settings** and thermal limits.  
**R**: The fix restored mechanical durability without compromising electrical performance. Subsequent batches had **zero delamination**, and the improved SOP is still in use.  
**Lesson**: Even small process variables — like iron temp — can have **cascading effects on device integrity**. It taught me the importance of tuning fabrication protocols to match the materials used, especially in **bioelectronic hardware**.

---
---

# JARVIS

Awesome — JARVIS offers **plenty of potential “mistake turned success” stories** across:

- OCR/LLM failures
    
- latency issues
    
- integration bugs
    
- stakeholder assumptions
    
- evaluation surprises
    

Below are a few mistake-driven STAR narratives you can adapt depending on the question or tone of the interview:

---

## 🤖 1. **OCR Misfire Due to Font Assumptions**

**S**: Early in the project, we assumed standard OCR models would handle engineering documents well.  
**T**: We tried to use a stock Tesseract pipeline for both typed and handwritten texts.  
**A**: It **completely failed on stylized CAD-generated fonts and handwritten labels**, especially ones using symbols or tight kerning. Instead of tweaking parameters blindly, I led a benchmarking comparison using IAM datasets and built a hybrid pipeline combining IAM for handwriting and tuned Tesseract for print.  
**R**: Character recognition accuracy jumped from **~70% to over 98%** on our test set, enabling usable downstream parsing.  
**Lesson**: Never assume domain data is “normal.” Tailoring pipelines to real-world variation makes all the difference.

---

## 🧠 2. **LLM Gave Fast but Wrong Answers (Latency vs Accuracy Tradeoff)**

**S**: We integrated an LLM (LLaMA3) to answer user questions from technical documents.  
**T**: Our goal was <5 second response time without loss of accuracy.  
**A**: To boost speed, I experimented with chunking optimizations—but discovered that our faster queries were **retrieving incomplete or misleading chunks** (e.g., partial specs or outdated SOPs).  
**R**: I added context length diagnostics and fallback reranking using TF-IDF if no chunk exceeded a confidence threshold. The result was a ~3x slower response time, but **accuracy improved measurably**, and we added a caching layer to recover speed.  
**Lesson**: In regulated domains, **accuracy > speed** — better to slow down slightly than mislead a user.

---

## 🔗 3. **API Broke Due to Circular Calls in Integration**

**S**: During orchestration, our Paperless-NGX API and LangChain chunking looped recursively due to a misconfigured endpoint call.  
**T**: I was tasked with debugging why queries froze or crashed the system under certain file types.  
**A**: I traced the logs and discovered a **cyclical call stack** where a document with embedded links triggered its own fetch repeatedly.  
**R**: I added a caching and document ID-check layer to prevent repeat pulls. We also limited depth for link-following.  
**Lesson**: Integration layers need **guards against recursion and circular logic**, especially with documents that reference each other (common in engineering specs).

---

## 📊 4. **Evaluation Model Surprised Us — Recall Mismatch**

**S**: We were comparing search relevance between LLaMA3 and a proprietary generator.  
**T**: We expected LLaMA3 to outperform based on precision _and_ recall.  
**A**: Surprisingly, recall plateaued at 0.50 despite high precision. At first we thought the model was undertrained.  
**R**: On closer inspection, we realized our corpus was **semantically redundant**—multiple docs had nearly the same info, so “misses” were sometimes false negatives. We updated our evaluation method to use **graded relevance scoring** and added human evaluation tiers.  
**Lesson**: Benchmarking isn't always as objective as it looks — the way you **define relevance and "truth"** shapes what “good” means.

---

## 🧪 5. **Hardcoded Paths Broke Docker Integration**

**S**: While dockerizing our AI backend, we kept hitting file not found errors.  
**T**: Turns out one team member had hardcoded Windows paths in the OCR and LangChain script configs.  
**A**: I rewrote the entire system with **relative paths and environment variable injection** and documented volume mounts in the Docker Compose.  
**R**: That fixed cross-platform deployment. Later, it enabled the system to run on a Raspberry Pi with minimal config changes.  
**Lesson**: What feels like a shortcut early on becomes a **scaling bottleneck later**—infrastructure must be portable by design.

---

## 🛠️ 6. **User Testing Revealed Overengineering**

**S**: We built a powerful interface with full question answering, semantic clustering, and advanced reranking.  
**T**: During our sponsor demo, the feedback was… polite.  
**A**: We asked directly and realized users **just wanted fast keyword search and good PDF previews** — the full LLM integration felt like overkill for daily use.  
**R**: We built a toggle to use either “simple mode” or “AI mode,” and reprioritized UX clarity.  
**Lesson**: **Build what users _need_, not just what’s cool to make.** Overengineering can be a form of ego.

---

Would you like one of these turned into a punchy 1–2 minute spoken answer to practice with? Or linked to a specific behavioral prompt like:

- "Tell me about a time you made a technical mistake"
    
- "Tell me about a time you had to debug a complex system"
    
- "Tell me about a time you had to shift priorities based on user feedback"
    

Just say the word.