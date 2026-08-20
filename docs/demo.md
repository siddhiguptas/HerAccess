# HerAccess — 2.5-Minute Demo Walkthrough Script

This script provides a concise, high-impact demonstration designed specifically for hackathon judges across all 4 prize tracks (**Web-Slinger**, **Suit-Up**, **Spider-Sense**, **Daily Bugle**).

---

## 🎬 Demo Timeline (Total: 2 Minutes 30 Seconds)

### 0:00 – 0:20 | Scene 1: The Problem & Vision
* **Narration**: *"When a young woman moves to a new city for college or work, essential information is severely fragmented across dozens of unstructured municipal portals, individual hostel websites, and niche directories. There is no single verified source with provenance."*
* **Visual**: Show HerAccess homepage with conversational prompt: *"I'm a female student moving to Lucknow for college. I need a women's hostel under ₹12,000 with public transport and healthcare nearby."*

---

### 0:20 – 0:45 | Scene 2: Intent Parsing & Deterministic Discovery
* **Action**: Click Search.
* **Narration**: *"HerAccess does not let an AI invent recommendations. It parses natural-language intent into structured requirements and queries our verified database acquired via Bright Data Scraper Studio."*
* **Visual**:
  * Show the extracted requirements pill.
  * Show the interactive Leaflet map rendering hostels, metro stations, 24x7 hospitals, chemists, and police women help desks.

---

### 0:45 – 1:15 | Scene 3: Signature Features (Evidence & Local Support Chain)
* **Action**:
  1. Click **Evidence** on a hostel card (e.g. *Kamla Girls Hostel*).
  2. Toggle **Why This Result?**.
  3. Toggle **Support Chain**.
* **Narration**:
  * *"Every single fact is backed by verifiable source evidence with verbatim quotes and timestamps."*
  * *"The 'Why This Result?' engine explains the exact deterministic scoring factors."*
  * *"The Local Support Chain links the hostel into a 5-point safety ecosystem: nearest metro (0.4 km), tertiary hospital, 24x7 chemist, and UP 1090 command."*

---

### 1:15 – 1:35 | Scene 4: Conflicts & Freshness
* **Action**: Switch to the **Conflicts** tab.
* **Narration**: *"When public websites disagree on facts—like curfew times or monthly rent—HerAccess never silently guesses. It highlights both claims with provenance."*
* **Visual**: Show side-by-side discrepancy card.

---

### 1:35 – 2:15 | Scene 5: The Hero Moment — Website Breaks & Scraper Self-Heals
* **Action**:
  1. Click **1. Simulate Layout Break** in the top Demo Bar.
  2. Open the **Health Center** tab to show collector `c_hostel_sulekha_01` drop to **0.0% validation (Failed)**.
  3. Click **2. Run `bdata scraper heal`**.
  4. Watch the status transition to **Healing** and then recover to **100% Healthy** with the **EXACT SAME Collector ID**.
* **Narration**:
  * *"When the source website changes its DOM structure, required fields fail validation."*
  * *"HerAccess detects the anomaly and triggers Bright Data's `bdata scraper heal` workflow."*
  * *"The scraper heals, the SAME Collector ID is maintained, and our downstream application continues seamlessly with zero code changes."*

---

### 2:15 – 2:30 | Scene 6: Conclusion
* **Narration**: *"HerAccess turns messy, fragmented public web data into verified, life-enabling local infrastructure for women. Powered by Bright Data Scraper Studio."*
