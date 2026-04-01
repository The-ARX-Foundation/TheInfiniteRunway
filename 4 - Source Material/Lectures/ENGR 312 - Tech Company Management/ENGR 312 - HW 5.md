---
Date Created: 2026-03-11 00:15
Last Updated: 2026-03-11 00:15
tags:
  - Resource
Index:
  - "[[Lectures]]"
Topic:
  - "[[ENGR 312 - Tech Company Management]]"
  - "[[Biomedical Engineering]]"
  - "[[Signal Processing]]"
  - "[[Programming]]"
Status: Unweathered
Published: false
---
---

Themes: [[Biomedical Engineering]], [[Signal Processing]], [[Programming]]

# 1. What is your big take away from guest speaker Kim Rentsch?  What could Ms. Rentsch do to improve her talk?  Would you recommend her as a speaker for this class next semester?

While not necessarily relevant to the material discussed, a personal concept I took away from Ms. Kim Rentsch's talk was that our career path is not set in stone; rather if we take the opportunities presented to us we will succeed in ways we didn't even know were possible.
On the material, my biggest takeaway was the importance of supply chain management in industry; her broad and rich experience in logistics, supply chain, and inventory management across diverse sectors like CIA operations, retail (The Container Store), and Foot Locker allowed for her to teach a very informative lesson on the  importance of consistent tech investments in retail.
I would most definitely recommend her as a speaker for the next semester; her wealth of experience in global supply chains, ability to discuss real-world logistics challenges, and the diversity of her career make her an asset for students exploring operations and leadership.

# 2.  Consider the technology that you are using for your presentations in this class.  What materials are critical to your operations?  Who would be the source of those materials?  What arrangements (contract) would you direct the purchasing department to make with those key suppliers?  (Do some research.  Provide links to the actual suppliers.)


### Supply Chain Components for MyoSense:

#### a. Components:
(copied from my research for the supply chain presentation)
Our miniature myoelectric biosensors will need the following sub-assemblies, raw materials would be sourced by the respective manufacturers and final assembly conducted at a local manufacture at a location predetermined for optimal distribution.

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

#### b. Contract Points
To effectively manage the procurement and supply chain, the following contract elements will be critical:
- Electrode (Myoelectric Sensing Array) Contract Requirements:
	- Biocompatibility Certification: Ensure all electrode materials are FDA and/or ISO 10993 certified for medical-grade use.
	- Flexibility for R&D: Since the electrodes may undergo iterative design modifications, the contract should include flexibility for low-volume, customizable production runs to accommodate innovation.
	- Lead Time Agreements: Given that the electrodes are custom-built, ensure lead times are clearly stated, with penalties for delays, especially as these are critical to the function of the sensor array.

- Semiconductor Chips ([[Signal Processing]] Unit) Contract Requirements:
	- Custom Design: Work with TSMC/GlobalFoundries to create bespoke chips with low-power, high-sensitivity [[Signal Processing]] capabilities.
	- NDA & IP Agreements: Given that the chips may require specialized design to accommodate the biosensor’s needs, NDAs to protect intellectual property (IP) must be prioritized.
	- Supply Contingencies: Since global semiconductor shortages are an ongoing risk, include clauses for supply guarantees or secondary suppliers.

- Microcontroller Unit (MCU) Contract Requirements:
	- Long-term Supplier Relationship: Establish long-term agreements to ensure stable supplies of microcontrollers, with pricing locked in for several years to avoid cost fluctuations.
	- Support for Integration: Request technical support and documentation for integrating MCUs with other components (e.g., BLE integration with signal processing chips).
	- Defect and Warranty Clauses: Include stringent [[Quality Control]] clauses, especially since the MCUs are critical for signal transmission and processing in real-time.

- Biocompatible Housing Contract Requirements:
	- Material Safety & Compliance: The materials must comply with medical safety standards (ISO 10993, FDA Class II/III device standards), which should be clearly outlined in the contract.
	- Sterilization Protocols: The supplier must provide materials that can withstand sterilization processes, especially if this is a reusable or implantable device.
	- Volume and Cost Management: Agree on volume discount clauses, as biocompatible materials can be expensive when procured in small quantities. Ensuring price adjustments at higher order volumes would be beneficial.

- Power Source (Micro-battery or Energy Harvesting Unit) Contract Requirements:
	- Battery Life Guarantees: Given the medical use, micro-batteries should come with guaranteed operational lifetimes and performance metrics under specific conditions (e.g., human body temperature).
	- Energy Harvesting Capabilities: For the energy-harvesting unit, performance guarantees around kinetic or thermal energy conversion are crucial.
	- End-of-Life Recycling: Set up return/recycling protocols for used batteries, in compliance with environmental regulations, and offer extended warranties.

- RF or Wireless Communication Module Contract Requirements:
	- Data Transmission Reliability: Specify minimum standards for signal integrity and interference minimization, particularly in a medical environment where failure could be critical.
	- Cybersecurity Compliance: Since patient data may be transmitted wirelessly, suppliers must comply with cybersecurity standards (e.g., HIPAA compliance for medical devices).
	- Supply Flexibility: Include clauses for rapid scaling, as demand for wireless modules might surge depending on the biosensor’s market success.


# 3.  Refer back to our end of class discussion on 10/15 about automation, robotic, data analytics, AI in the supply chain.  What are some key benefits we are seeing in supply chain from these new technologies?  What else could be done to supply chains to further increase efficiencies?  Be creative.  There are no wrong answers to this last part.

The key benefits we are currently seeing is the rise of smarter automation, the "dark factories" described in lecture. This moves jobs from the monotony of factory work to the higher level management of these smart systems. To further increase the efficiencies brought forth by these technologies, one idea I feel will occur in the near future is the implementation of blockchain for inventory management transparency. Blockchain technology could enhance transparency and [[Trust]] by providing an immutable ledger of every transaction and inventory movement. This would be particularly valuable for industries like pharmaceuticals or food, where traceability is crucial for ensuring quality and compliance with regulations. Smart [[Contracts]] on blockchain could automate payments upon the delivery of goods, reducing the administrative overhead of invoicing and payment reconciliation.