---
Date Created: "2025-06-25 09:35"
Last Updated: "2026-03-21 04:31"
tags:
  - Area
Index: 
Topic:
  - "[[Biomedical Engineering]]"
Status: Unweathered
Published: false
---
---

Themes: [[Biomedical Engineering]]

---
# GPT Formalized
## 🫀 **Project Overview: Cardiac Shunt Occlusion & Adverse Event Prediction**

### **Objective**

To analyze patient data from Driscoll Children’s Hospital, focusing on individuals with aortopulmonary (AP) shunts, in order to build predictive models for adverse events such as cardiac arrest. This effort will support clinical decision-making and potential automation of risk stratification tools.

---

### **Current Status**

- Awaiting final readiness of assigned student (now cleared to proceed).
    
- Initial efforts to begin with a **test patient** for pipeline development.
    
- **IRB Considerations**:
    
    - Project is currently under “preparatory to research” status.
        
    - No full IRB protocol approved yet; cannot store or formally analyze data until approved.
        
    - May begin protocol review and draft submission processes now.
        
    - Emphasis on **decision support tools**—automated analysis potential to be scoped.
        

---

### **Key Components**

#### **1. Data Strategy**

- **Event Identification**: Define what constitutes an "adverse event" in this context, particularly cardiac arrest post-shunt.
    
- **Data Anonymization**:
    
    - Shift timestamps (e.g., random day offset).
        
    - Randomized or hashed patient identifiers.
        
- **Data Types and Formats** (to review):
    
    - Clinical platforms and EMR systems in use.
        
    - Formats: vital sign logs, procedural notes, imaging metadata, etc.
        
    - Focus: 72-hour post-operative window until patient transfer to step-down unit.
        

#### **2. Clinical Workflow Mapping**

- Study the **Norwood procedure** pathway.
    
- Map out:
    
    - Data collection intervals and methods (monitoring, manual entry, etc.).
        
    - Real-time vs retrospective interpretation and limitations.
        
    - Challenges clinicians face with real-time monitoring.
        
- Include **pre-birth diagnostics** and **pre-op stages** in the pipeline.
    

#### **3. Broader Research Directions**

- Potential collaboration with neurology:
    
    - Risk stratification for **neurogenic bladder** leading to kidney disease.
        
    - Idea: **Mobile app** for clinic staff to input positioning data and receive real-time risk scores.
        
- Parallel exploration of similar **neurology data science projects** during timeline (2026–2028).
    

#### **4. Project Infrastructure**

- Build a modular **data science pipeline** alongside test patient work.
    
- Focus on reproducibility and eventual automation.
    
- Consider a dashboard or alert system as a future deliverable.
    

---

### ✅ **Action Items**

| Task                                                                  | Owner                   | Timeline            |
| --------------------------------------------------------------------- | ----------------------- | ------------------- |
| ✅ Begin with test patient data for dry run                            | You                     | Immediate           |
| 🔍 Define “adverse event” criteria clinically                         | You + Clinician Partner | This week           |
| 🛡 Review data anonymization procedures (date shifting, ID scrubbing) | You                     | This week           |
| 📑 Draft IRB protocol for approval                                    | You                     | June–July           |
| 📥 Request clinical workflow documentation (Norwood post-op)          | You                     | ASAP                |
| 🎥 Watch Biodesign lecture (relevant to real-time monitoring)         | You                     | This week           |
| 📊 Review available EMR platforms and data export formats             | You                     | After test patient  |
| 📱 Scope neurology app idea (neurogenic bladder risk)                 | Optional (parallel)     | Q3–Q4               |
| 🧠 Map pre-birth and pre-op decision support touchpoints              | You                     | As part of pipeline |
| 🗂 Document pipeline components and challenges for reproducibility    | You                     | Ongoing             |

---
---
# Week 1 Plan

Here's a refined **remote work agenda for this week**, including resources to catch up on the Norwood procedure and biodesign essentials:

## 🗓️ **Week’s Timeline**

### **Monday**

- **Email clinical leads at Driscoll** to **request post-op Norwood workflow documents** (e.g., CHOP pathway) for reference.
    
- Start reviewing the **CHOP Norwood clinical pathway** to familiarize yourself with key post-op data collection points (e.g., hemodynamics, sedation, imaging) ([pathways.chop.edu](https://pathways.chop.edu/clinical-pathway/newborn-norwood-physiology-shunt-dependent-pulmonary-blood-flow-inpatient-clinical-pathway?utm_source=chatgpt.com "Newborn with Norwood Physiology or Shunt Dependent Pulmonary ...")).
    

### **Tuesday**

- Continue digesting the CHOP pathway—note timing of data capture within **days 0–2 post-op**, such as vitals, echo, fluid management, sedation metrics ([pathways.chop.edu](https://pathways.chop.edu/clinical-pathway/newborn-norwood-physiology-shunt-dependent-pulmonary-blood-flow-inpatient-clinical-pathway?utm_source=chatgpt.com "Newborn with Norwood Physiology or Shunt Dependent Pulmonary ...")).
    
- **Search for webinars** on Norwood post-op care (e.g. via Heart University “Monitoring and Managing a Post-operative Norwood in the ICU”) ([heartuniversity.org](https://www.heartuniversity.org/webinar_categories/npc-qic-global-single-ventricle-learning-series/npc-qic-webinar-2/?utm_source=chatgpt.com "The Norwood Procedure & Post-Operative Care - Heart University")).
    

### **Wednesday**

- **Watch 1–2 online [[Lectures]]** covering Norwood post-op monitoring—identify clinical challenges and data sources in real time.
    
- Begin mapping which data points (e.g., HR, BP, echo results) are available in the EMR system.
    

### **Thursday**

- Watch the targeted **biodesign lecture on near‑real‑time cardiac monitoring** (e.g., Stanford innovation in heart rhythm detection like Zio Patch) ([med.stanford.edu](https://med.stanford.edu/news/insights/2018/07/biodesign-fellows-simplify-heart-rhythm-monitoring/?utm_source=chatgpt.com "Biodesign fellows simplify heart rhythm monitoring - Stanford Medicine")).
    
- Reflect on how that technology parallels challenges in Norwood post-op care.
    

### **Friday**

- **Compile a summary**: Identify gaps in your knowledge of the Norwood workflow and list EMR data sources to explore.
    
- Prepare an email requesting sample EMR data exports or field definitions from IT/data team.
    

## 📚 **Remote Learning Resources**

1. **CHOP and Cleveland Clinic overviews of Norwood** offer solid introduction into stages, complications, and data-collection intervals ([my.clevelandclinic.org](https://my.clevelandclinic.org/health/treatments/24794-norwood-procedure?utm_source=chatgpt.com "Norwood Procedure: Details, Recovery & Outlook - Cleveland Clinic"), [pathways.chop.edu](https://pathways.chop.edu/clinical-pathway/newborn-norwood-physiology-shunt-dependent-pulmonary-blood-flow-inpatient-clinical-pathway?utm_source=chatgpt.com "Newborn with Norwood Physiology or Shunt Dependent Pulmonary ...")).
    
2. **Heart University webinars** such as “Monitoring and Managing a Post-operative Norwood in the ICU” provide structured insight into ICU workflows ([heartuniversity.org](https://www.heartuniversity.org/webinar_categories/npc-qic-global-single-ventricle-learning-series/npc-qic-webinar-2/?utm_source=chatgpt.com "The Norwood Procedure & Post-Operative Care - Heart University")).
    
3. **Stanford Biodesign articles/case studies** on real-time cardiac monitoring, such as the Zio Patch, illustrate approaches for ambulatory rhythm capture and early real-time analytics ([biodesign.stanford.edu](https://biodesign.stanford.edu/our-impact/technologies/irhythm.html?utm_source=chatgpt.com "iRhythm | Stanford Mussallem Center for Biodesign")).
    


## ✅ **This Week’s Deliverables**

-  Sent email to clinical team requesting protocols.
    
-  Completed reading on clinical pathway and webinar summaries.
    
-  Watched identified biodesign lecture; drafted notes linking to real-time monitoring.
    
-  Created summary document outlining key post-op data points and next EMR integration steps.
    


Let me know if you'd like help drafting any emails or setting up meetings with the clinical or IT teams!

---
---
# Initial Email

Here’s a professional and concise draft for your initial email request:


**Subject:** Request for Norwood Post-Operative Clinical Workflow Documentation

Dear [Recipient’s Name],

I [[Hope]] this message finds you well. I'm reaching out as part of our data science initiative with Driscoll Children’s Hospital focused on predicting adverse events in patients with aortopulmonary (AP) shunts.

To effectively scope and structure the project, I’m currently mapping the clinical workflow surrounding the **Norwood procedure**, particularly during the **first 72 hours post-operation**—up until transfer to the step-down unit. Would it be possible to share any available protocols, pathway documents, or clinician notes outlining:

- Typical data collected during this window (e.g., vitals, imaging, interventions)
    
- Decision points for monitoring or escalation
    
- Any associated documentation standards or EMR forms
    

This will greatly aid our understanding of real-time monitoring constraints and support the construction of a meaningful, clinically grounded data pipeline.

Please let me know if there's someone else I should be contacting instead or if you’d prefer to discuss this briefly over a call.

Warm regards,  
**[[Landon Dahle]]**  
Data Science Intern | Driscoll Children's Hospital  
B.S. [[Biomedical Engineering]]  
📧 [your email]  
📞 [your phone, optional]


---
# Raw Notes
Goal
- Capturing data from patients with AP shunts at driscoll site
- synthesize the information into the data science effort of predicting adverse events

Start with test patient
Determine how we're going to identify the event
was on hold until student was ready to go though
first major hurdle is IRB
- review preperatory to research
- no IRB protocol though
- but they should be ready to make decisions "decision support"
	- how much can be automated, etc.

Data anonymization -> shift dates, randomize patient ID

Building project pipeline along the way (26-27, 27-28)
- can look into neurology projects?

Neurologist risk - neurogenic bladder for kidney disease
- app for clinic to plug in positions and make risk score

Can look into data but not store it until IRB approval
- systems
- platforms
- formats
- data types

norwood procedure? 
map out clinical workflow post-surgery
"at least until the patient goes to the step-down unit" ~72 hour timeframe
- what data is being collected
- understand how interpretation of data real-time
- tldr -> realtime challenges 

biodesign lecture to watch

experience -> pre-birth identification, pre-op, etc.

Need to request protocols from our end for review

