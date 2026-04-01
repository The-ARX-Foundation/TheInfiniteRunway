---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[Lectures]]"
Topic:
  - "[[MTDE 489 - Startup Fundamentals]]"
  - "[[Biomedical Engineering]]"
  - "[[Signal Processing]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Biomedical Engineering]], [[Signal Processing]], [[Programming]]

1.  What is your big take away from case study #3 and our class discussion on sales?

Contrary to popular [[Belief]], the use of exclusivity as a launchpad for success was a much welcomed new perspective offered by the second part of the case study ("When Should You Allow Exclusivity in Deals?" by Mark Suster).  As such my biggest takeaway was that it has its time and place, but you must do your best to only use it when it benefits you (both parties ideally, but you prioritize yourself lol). 

2.  What is your big take away from guest speaker Quinten Sauvage?  What could Mr. Sauvage do to improve his talk?  Would you recommend him as a speaker for this class next semester?

Mr. Sauvage's lecture was quite informative into the real world of startups, reinforcing what we had learned in class thus far. My biggest takeaway was that of the need for an amazing funding pitch, as I thought his was done really well. As such I do feel that the topics mentioned became repetitive to what was taught in class, so I feel having him come in earlier in the year would be more beneficial (though learning it in the class is just as good.) I would recommend him as a speaker for this class next semester, but as stated maybe earlier on so as not to be redundant.

3.  Think about your startup idea for this class.  How would you approaching scaling your idea?  What tools would you need?  Who are the key vendors you would need to start relationships with?  Do some research.  I want to see links to specific tools and proposed vendors.
Under the scenario where we have finalized our design, we would need to start thinking about manufacturing en-mass; potentially changing the design to be manufactured easier. As such reaching out to medical device machining companies to determine the best course of action for manufacturing of each subassembly would be crucial (one local example would be the machine shop in the ETB headed by Mr. Jeff Miller https://engineering.tamu.edu/biomedical/research/facilities/shop-equipment.html as I have an in through working in a medical device fabrication lab).

Post scaling, our miniature myoelectric biosensors will need the following sub-assemblies; raw materials would be sourced by the respective manufacturers and final assembly conducted at a local manufacture at a location predetermined for optimal distribution.

(the rest is copied from my research for the 312 supply chain presentation)

- Electrodes (Myoelectric Sensing Array):
	- Ultra-thin and flexible electrodes made of biocompatible conductive materials like platinum or titanium. These are crucial for detecting subtle electrical signals from muscles.
    - Suppliers: Medical-grade material manufacturers, for our specific use case this is where the most innovation would occur; we would need to manufacture in house though could utilize sourced nitinol wiring and use a local medical plastics manufacturer (IPM for the Mexico manufacturing perspective) to coat and form the wire into the electrode configurations we design.
	    - https://www.ipm.mx/

- Semiconductor Chips ([[Signal Processing]] Unit):
	- These chips would handle the detection and processing of muscle signals in real time. They would likely be custom-designed for ultra-low power consumption and high sensitivity.
	- Suppliers: Specialized semiconductor manufacturers (e.g., TSMC, GlobalFoundries).
		- https://www.tsmc.com/english
		- https://gf.com/manufacturing-services/

- Microcontroller Unit (MCU):
	- A miniature MCU for data processing and signal transmission, likely with integrated Bluetooth Low Energy (BLE) or wireless capabilities to communicate with external devices.
    - Suppliers: On top of the chip manufacturers, would partner with major microcontroller suppliers (e.g., Texas Instruments, NXP Semiconductors).
	    - https://www.ti.com/microcontrollers-mcus-processors/overview.html/
	    - https://www.nxp.com/products/processors-and-microcontrollers:MICROCONTROLLERS-AND-PROCESSORS

- Biocompatible Housing:
	- The biosensor needs a protective casing made from biocompatible polymers or ceramics, ensuring it can be safely implanted without causing adverse reactions.
    - Suppliers: Medical-grade polymer/ceramic manufacturers (e.g., DuPont, Evonik).
	    - https://www.dupont.com/industries/health-care-and-medical.html
	    - https://www.evonik.com/en/markets/market_1345345.html


- Power Source (Micro-battery or Energy Harvesting Unit):
	- Either a rechargeable micro-battery or an energy-harvesting module that can utilize kinetic or thermal energy from the body.
    - Suppliers: Specialized energy storage or harvesting companies (e.g., SolidEnergy, Ilika for micro-batteries).
	    - https://ses.ai/li-metal-batteries/
	    - https://www.ilika.com/micro-solid-state-batteries


- RF or Wireless Communication Module:
	- Enables data transmission from the biosensor to external devices (smartphones, medical devices).
    - Suppliers: RF module suppliers (e.g., Murata, Qualcomm).
	    - https://www.murata.com/en-us/products/inductor/chip
	    - https://www.qualcomm.com/products/connected-healthcare
