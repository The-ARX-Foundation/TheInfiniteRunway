---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Area
Index: 
Topic:
  - "[[Signal Processing]]"
  - "[[Statistics]]"
  - "[[Computational Neuroscience]]"
Status: Unweathered
Published: false
---
---

Themes: [[Signal Processing]], [[Statistics]], [[Computational Neuroscience]]

## Module 1 — Reboot, Rigor, and Modeling Mindset

**Goals:** rebuild intuition; get proof-capable; see calculus/ODEs as modeling tools.  
**Focus:** dimensional analysis, units/scaling; derivatives as rates; integrals as accumulations; ODE intuition; PDE “feel” (diffusion/reaction–diffusion); linearization, stability, equilibria.  
**Do/Watch/Read:**

- Velleman, _How to Prove It_ (Ch. 1–4: logic, sets, proof patterns).
    
- 3Blue1Brown “Essence of Calculus” (limits/derivatives/integrals as pictures).
    
- Steve Brunton: “Differential Equations in Action” + “Applied Math for Engineers”.
    
- Skim Ermentrout & Terman, _Mathematical Foundations of Neuroscience_ for motivation.  
    **Practice:** 30-min/day proof drill (state → attempt → counterexample check); one page of e-paper notes per concept (Idea → Equation → Biological analog → Simulation idea).
    

---

## Module 2 — Linear Algebra for State-Space Thinking (+ Control Intuition)

**Goals:** treat neurons/networks as linear systems around equilibria.  
**Focus:** vectors/matrices/linear maps; eigenvalues/eigenvectors (modes/oscillations); SVD; least-squares; matrix exponential; stability of linear systems.  
**Do/Watch/Read:**

- Strang, _Linear Algebra and Learning from Data_ (or Anton for gentler start).
    
- Brunton: “Dynamical Systems” + “Control Bootcamp” (equilibria, linearization, eigen-placement).  
    **Practice:** code a leaky integrator ( \dot{x}=-ax+bu ) and compare Euler vs exact (e^{At}); visualize step/impulse responses.
    

---

## Module 3 — Signals & Systems I: Time Domain

**Goals:** unify circuits, spikes, and BOLD/EEG as signals.  
**Focus:** LTI systems; convolution/correlation; impulse & step responses.  
**Do/Watch/Read:**

- Oppenheim & Willsky, _Signals and Systems_ (ch. on LTI + convolution).
    
- MIT OCW 6.003 equivalents as needed.  
    **Practice:** derive RC low-pass as an LTI system; simulate spike trains → convolve with post-synaptic kernel.
    

---

## Module 4 — Signals & Systems II: Frequency Domain

**Goals:** reason in frequency; avoid aliasing traps.  
**Focus:** Fourier & Laplace; frequency response/transfer functions; sampling, aliasing, spectral leakage; windowing; power spectra.  
**Do/Watch/Read:**

- Oppenheim & Willsky (Fourier/Laplace chapters).
    
- Python: `numpy.fft`, `scipy.signal`.  
    **Practice:** compute PSD of synthetic spike trains; design band-pass for EEG rhythm; compare time vs frequency views.
    

---

## Module 5 — Probability & Statistics I (for Neural Variability)

**Goals:** speak uncertainty.  
**Focus:** random variables; expectation/variance; Gaussian/Poisson/log-normal/exponential; likelihoods; intro to Bayesian thinking.  
**Do/Watch/Read:**

- MacKay, _Information Theory, Inference, and Learning Algorithms_ (early chapters).
    
- StatQuest videos to cement intuition.  
    **Practice:** simulate Poisson spiking with rate modulation; estimate parameters, CIs; compare MLE vs MAP on toy problems.
    

---

## Module 6 — Information Theory & Bayesian Decoders

**Goals:** connect coding theories to models.  
**Focus:** entropy, mutual information, KL; simple neural decoders; Markov models; intro SDEs.  
**Do/Watch/Read:**

- MacKay (entropy→MI→coding); Sterling & Laughlin, _Principles of Neural Design_ (selected chapters).  
    **Practice:** build a simple Bayesian stimulus decoder from noisy spike counts; estimate information rate.
    

---

## Module 7 — Numerical Methods You’ll Actually Use

**Goals:** simulate safely and fast enough.  
**Focus:** Euler, RK2/RK4; stiffness & stability regions; step-size control.  
**Do/Watch/Read:**

- Any intro Numerical Analysis (target ODE chapters).  
    **Practice:** reproduce stiff vs non-stiff behaviors on HH-like surrogates; compare explicit RK vs semi-implicit tricks.
    

---

## Module 8 — Analysis for Modelers (Targeted)

**Goals:** fill proof/theorem gaps you’ll encounter.  
**Focus:** limits/continuity; series; multivariable derivatives; key theorems used in stability & identifiability arguments.  
**Do/Watch/Read:**

- Buck or Apostol, _Advanced Calculus_ (skim, then deep-dive as needed).
    
- Keep Garrity, _All the Math You Missed_, as your just-in-time patch kit.  
    **Practice:** prove one stability or convergence statement you actually used in Modules 2–7.
    

---

## Module 9 — Single-Neuron Dynamics I (Phase Planes)

**Goals:** “see” neuron dynamics.  
**Focus:** LIF; phase portraits; nullclines; fixed points; local stability.  
**Do/Watch/Read:**

- Izhikevich, _Dynamical Systems in Neuroscience_ (phase plane chapters).
    
- Brunton: Nonlinear dynamics intros if needed.  
    **Practice:** implement LIF; plot nullclines/trajectories; reproduce f-I curves.
    

---

## Module 10 — Single-Neuron Dynamics II (Nonlinear Models & Bifurcations)

**Goals:** handle richer excitability.  
**Focus:** FitzHugh–Nagumo; Hodgkin–Huxley intuition; common bifurcations.  
**Do/Watch/Read:**

- Izhikevich (FHN, bifurcations).
    
- Dayan & Abbott, _Theoretical Neuroscience_ (neural coding & stochastic spiking).  
    **Practice:** simulate FHN; locate a Hopf or saddle-node bifurcation; compare coding predictions to your info-theory metrics (Module 6).
    

---

## Module 11 — Populations, Fields, Memory, and Metastability

**Goals:** step beyond single units.  
**Focus:** Wilson–Cowan; neural fields; Hopfield networks; oscillations; metastable dynamics; connect to QPP/metastability interests.  
**Do/Watch/Read:**

- Dayan & Abbott (population chapters).
    
- Ermentrout & Terman (neural fields/oscillations).  
    **Practice:** simulate Wilson–Cowan; map parameter regions (oscillation vs quiescence); relate to spectral features from Module 4.
    

---

## Module 12 — Capstone Integration & Extensions

**Goals:** tie math→model→signal→inference into one pipeline.  
**Focus:** end-to-end mini-project (e.g., design a closed-loop filter for an oscillatory population, or an info-optimal decoder for a stimulus).  
**Do/Watch/Read:**

- Revisit Brunton for control framing; optionally Brian2 tutorials for speed.  
    **Practice (choose one):**
    
- **Control capstone:** linearize population model; design controller; simulate closed loop; analyze stability margins.
    
- **Coding capstone:** simulate noisy neural responses; implement Bayesian decoder; estimate MI; validate with frequency-domain features.
    

---

## Keep-handy references (use across modules)

- Garrity, _All the Math You Missed_ — rapid gap-filler.
    
- Dayan & Abbott; Izhikevich; Ermentrout & Terman — core neuro math texts.
    
- Oppenheim & Willsky; Strang; MacKay; Velleman — pillars for signals/LA/info/proofs.
    

## De-prioritize for now (revisit if/when needed)

- Abstract algebra, Galois theory, algebraic topology.
    
- Deep differential geometry/manifolds (only later for Riemannian metrics on covariance/FC manifolds).
    

## Tools & e-paper workflow (steady across modules)

- **Stack:** Python + NumPy/SciPy + Matplotlib (or Brian2).
    
- **Note template per concept:** _Idea → Equation → Biological analog → Simulation idea → One plot → One sentence takeaway_.
    
- Export problem sets to PDF, annotate on your e-paper; snapshot finished pages into an Obsidian “Modeling Log”.
    

