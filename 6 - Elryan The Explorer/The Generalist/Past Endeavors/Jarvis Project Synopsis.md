---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Area
Index: 
Topic:
  - "[[Programming]]"
  - "[[Statistics]]"
  - "[[Machine Learning]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]], [[Statistics]], [[Machine Learning]]

Certainly, Elryan. Here is a **full, comprehensive synopsis** of your **JARVIS senior capstone project**, crafted as a standalone summary fit for grant proposals, portfolios, or future publications:

---

### 🧠 Project Title:

**JARVIS: Enabling Engineering Documentation**
(*Justified AI Retrieval for Verified Information Systems*)

### 🎯 Objective

The JARVIS project was conceived to resolve a major operational bottleneck at **Medtronic**: the inability to rapidly and reliably access engineering documentation across their vast ecosystem of 95,000+ employees, 81 manufacturing sites, and 191 clinical trials. The team tackled this challenge by developing a **locally processed, AI-enhanced document management system (eDMS)** that can digitize, tag, and semantically retrieve both printed and handwritten documents with high speed and accuracy—while ensuring regulatory compliance and system usability.

---

### 🧩 The Problem

Large-scale medical device manufacturers like Medtronic are burdened by:

* **Slow document retrieval** across siloed systems
* **Ineffective search tools** for complex technical queries
* **Compliance challenges** with documentation for audits (e.g. FDA, GDPR)
* **Inability to integrate documentation from mergers/acquisitions**

> Nearly 75% of workers cite poor digital organization as a barrier to productivity (Adobe, 2023), a problem multiplied exponentially in MedTech environments.

---

### 🔧 Solution Overview

**JARVIS** is a modular pipeline that integrates four intelligent subsystems:

1. **VISION – Smart OCR:**
   Extracts structured text from both digital and handwritten documents using advanced optical character recognition.

   * Models: IAM + Tesseract fusion
   * Metrics: >98% character recognition accuracy (CER/WER)

2. **KAREN – Semantic Tagging & Search:**
   Enables high-recall, high-precision search through a layered method:

   * **SpaCy** for text cleaning
   * **TF-IDF** for term weighting
   * **BioBERT + K-Means** for semantic clustering
   * **Fuzzy Search + TF-IDF Fallback** for fault-tolerant query matching
   * Final recall reached **≥95%**, exceeding the benchmark for functional correctness.

3. **JARVIS – Question Answering Engine:**
   Answers user questions in natural language using AI.

   * Initial models: Roberta-base-squad-v2, later integrated with **LangChain**
   * Enhanced with **cached embeddings (Chroma)** to reduce multi-document latency from **27 min → <3 seconds**
   * Handled queries with contexts up to **4096+ tokens**

4. **ULTRON – Integration & Orchestration:**
   Full-stack integration using local endpoints:

   * **POST request** triggers semantic query via **Ollama**
   * Paperless-NGX API fetches matching documents
   * LangChain chunks and reranks relevant content
   * Final answer rendered via Ollama or other LLM
   * Fully compliant with **ISO 27001, GDPR**, and performance-rated **≥4.5/5** in usability testing

---

### 🧪 Testing & Validation

#### ⚡ Test 1: Response Time Optimization

* Compared **manual pipeline**, **LLaMA3**, and **proprietary** integrations
* No statistical latency differences overall (ANOVA p = 0.35)
* **Query generation speed** showed significant variance: proprietary method was **10–100× faster**

#### 📚 Test 2: Search Relevance Evaluation

* 10 benchmark queries tested on 1000-doc set
* Both systems (LLaMA3 & proprietary) achieved **100% precision**
* LLaMA3 achieved **0.50 recall**, proprietary **0.40 recall** (not statistically significant, McNemar p = 1.00)

---

### 🧱 Technical Stack

| Component          | Technologies Used                                                   |
| ------------------ | ------------------------------------------------------------------- |
| **DMS Backend**    | Paperless-NGX (Django, Python, TypeScript, HTML, SCSS, Docker)      |
| **AI Engine**      | LangChain, Ollama, Roberta, LLaMA3, Chroma, SpaCy, TF-IDF, BioBERT  |
| **Embedding + QA** | Chroma for vector store, LangChain RetrievalQA, local LLM inference |
| **Deployment**     | Dockerized microservices with local endpoint orchestration          |

---

### 🧭 Outcomes & Contributions

* Demonstrated a **scalable, modular AI system** that can be deployed locally—no cloud dependency
* Achieved **high accuracy, low-latency** document querying suitable for high-regulation environments
* Produced **quantitative validation reports**, system [[Architecture]], UX designs, and a full end-to-end prototype
* Built a **reusable integration framework** between NLP, semantic search, OCR, and backend DMSs

---

### 🔮 Future Directions

* **Hardware acceleration** via NPUs to support lightweight, embedded use (e.g., Raspberry Pi)
* **Query generator refinement** using rule-based or hybrid models for traceable decision paths
* Expanded **graded relevance datasets** and larger corpus testing
* Deployment-ready **caching, load-balancing, and edge-case failover systems**
* Explore **document presentation UIs** for interactive exploration

---

### 🏅 Recognition

This project was conducted under the direction of **Dr. Franck Diaz** and **Dr. Zachary Bujnoch**, with contributions from Medtronic advisors. The system was showcased via poster, final presentation, and live demonstrations, and it met all the functional requirements set by the sponsor—proving not only the feasibility but also the necessity of localized AI for modern engineering operations.

---

Would you like this rewritten as a 3-minute pitch, academic abstract, or GitHub README summary next?
