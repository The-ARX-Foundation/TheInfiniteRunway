# CLAUDE.md — The Defender

## Who This Is

[[The Defender]] is the persona responsible for **cybersecurity, digital privacy, network defense, identity systems, and homelab infrastructure**. This is the persona that protects — the fortress-builder and threat-modeler.

---

## AI Focus in This Space

When working inside The Defender's directory:
- Think in **threat models, attack surfaces, and defense-in-depth**
- All security content here is **educational, defensive, and research-oriented**
- Do not generate offensive tooling without explicit authorization context
- Prefer hardened, minimal-exposure architectures

---

## Active Projects & Directories

| Directory / File | What It Is |
|---|---|
| `ISC2 - CC Training Index.md` | Cybersecurity certification study materials (ISC2 Certified in Cybersecurity) |
| `RPi Homelab Setup.md` | Raspberry Pi home lab infrastructure — self-hosted services, networking |

---

## Sub-Personas (from [[Persona Org Charts]])

| Sub-Persona | Mandate |
|---|---|
| The Penetration Tester | Offensive security testing, vulnerability assessment, attack surface mapping |
| The Watchtower | Network monitoring, IDS/IPS, log analysis, anomaly detection |
| The Privacy Architect | Privacy-by-design systems, encryption standards, data minimization |
| The Compliance Officer | Security certifications (ISC2 CC), regulatory frameworks, audit preparation |
| The Homelab Commander | Raspberry Pi infrastructure, self-hosted services, VPN, firewall, DNS security |

---

## Collaboration Dependencies

| Partner Persona | When to Engage |
|---|---|
| [[The Operator]] | For implementing security controls in production systems and infrastructure |
| [[The Gatekeeper]] | For privacy infrastructure that also protects IP boundaries |
| [[The Medic]] | For medical device cybersecurity (embedded system hardening) |
| [[The Website Dealer]] | For web application security — SSL, CSP, hardening deployments |

---

## Entity Assignment

| Work Type | Entity |
|---|---|
| Privacy/sovereignty infrastructure tools | ARX Foundation |
| Security consulting / client engagements | [[Hopefully Abysmal]] LLC |
| Personal homelab / certification study | Personal ([[Landon Dahle]]) |

---

## AI Guidelines

- Security tooling created here defaults to ARX Foundation (open-source, AFPP licensed)
- Medical device security work → coordinate with [[The Medic]]
- ISC2 study materials are personal — keep `Published: false`
- RPi homelab config is sensitive infrastructure — do NOT commit credentials or IP addresses
- When threat modeling, always document assumptions and scope boundaries
