---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Area
Index: 
Topic:
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Programming]]

Absolutely. That Reddit advice is solid — learning by building your own secured stack is the best way to develop practical cybersecurity intuition. Since you’ve got a Raspberry Pi and want to deploy a real-world security monitoring and automation stack (like Wazuh), I’ll break this into a **6-week homelab roadmap**.

---

# 🛠️ Raspberry Pi Cybersecurity Homelab Roadmap

### 🔧 Week 1: Foundations — Secure Your Base

**Goal:** Lock down your Pi, prep your network.

-  Flash and install a hardened OS (e.g., **Raspberry Pi OS Lite** or **Ubuntu Server**)
    
-  Change default credentials; create limited sudo user
    
-  Set up SSH with **key-based auth**, disable password login
    
-  Enable automatic updates + fail2ban + ufw (basic firewall)
    
-  Assign static local IP address
    
-  Setup DNS with Pi-hole or Cloudflare DNS
    
-  Install `nmap`, `netstat`, and `htop` for quick local debugging
    

**Outcome:** Hardened Linux base system, ready for hosting.

---

### 📦 Week 2: Server Stack — Learn Web & Cloud Basics

**Goal:** Host your own site securely + understand ports, services.

-  Install **NGINX** or **Apache**
    
-  Deploy a test site (HTML or use something like `Hugo`, `Jekyll`, or `Ghost`)
    
-  Use `ufw` to open only port 80 and 443
    
-  Set up **Let’s Encrypt SSL** via Certbot
    
-  Setup a domain (Cloudflare or Namecheap), connect DNS to Pi
    
-  Basic WAF: Configure rate limits, block common bad requests
    

**Bonus:** Try port-forwarding from your router to make it public or tunnel via Cloudflare.

---

### 🧠 Week 3: Learn Logging, Users, and Linux Internals

**Goal:** Understand what’s running and who’s doing what.

-  Explore `journalctl`, `/var/log/auth.log`, `/var/log/syslog`
    
-  Add a second "test" user; restrict access, try sudo lockdowns
    
-  Install and configure **Auditd**
    
-  Learn `ps`, `top`, `who`, `last`, `netstat`, `lsof`, `tcpdump`
    
-  Watch logs while doing things (e.g., failed logins)
    

---

### 🕵️ Week 4: Deploy Wazuh — Security Monitoring & EDR

**Goal:** Learn endpoint detection, event correlation, and agent-based monitoring.

-  Install **Wazuh server** on the Raspberry Pi (or connect it to a cloud Wazuh manager)
    
-  Install **Wazuh agents** on your devices:
    
    - Linux desktop/laptop
        
    - Windows (via MSI installer)
        
    - macOS (via PKG)
        
-  Configure rules: monitor SSH, sudo abuse, file integrity
    
-  View the Wazuh dashboard (self-hosted or via cloud UI)
    
-  Enable real-time alerts via email/Discord/N8N
    

---

### 🌐 Week 5: Build a Threat Model and Practice Defense

**Goal:** Simulate threat actor behavior and watch alerts roll in.

-  Try local **nmap**, **brute-force**, and **file tamper** tests
    
-  Practice **reverse shells** on test VMs in LAN (e.g., with Netcat or msfvenom)
    
-  Tune Wazuh alerts and rules
    
-  Create Wazuh correlation rules for multistage attacks
    
-  Practice log forensics from `/var/log` and Wazuh logs
    

---

### 🧩 Week 6: Expand — Cloud VM + External Exposure

**Goal:** Simulate real-world attack surface.

-  Spin up a **cheap cloud VM** (e.g., Oracle Cloud Free Tier, Lightsail, or Linode)
    
-  Set up same stack: Hardened OS, Wazuh agent, web app
    
-  Add WAF like **Cloudflare**, **ModSecurity**, or AWS WAF
    
-  Open specific ports, configure security groups/firewalls
    
-  Monitor attack attempts (you will get them fast!)
    

**Bonus:** Automate your stack with Docker + Docker Compose

---

# 🧠 Skills You’ll Develop

|Category|Tools / Concepts|
|---|---|
|Linux Security|SSH hardening, firewalls, fail2ban|
|Web Security|NGINX/Apache, HTTPS, WAFs|
|Monitoring & EDR|Wazuh, Auditd, log analysis|
|Network Security|nmap, ufw, tcpdump, IDS basics|
|Threat Simulation|Brute-force, malware basics, forensics|
|DevOps Basics|Docker, domains, DNS, certificates|
|Cloud Hardening|IAM, security groups, remote logging|

---

Would you like me to turn this into a printable checklist / Obsidian note / Notion board format? Or expand a specific week into a full tutorial?