# Google Play Store Release Kit — Dining Philosophers Café

This document contains everything needed to publish **Dining Philosophers Café** to the Google Play Store for Version 1.0.

---

## 1. App Identity & Store Listing Metadata

| Field | Value | Constraints |
|---|---|---|
| **App Name** | `Dining Philosophers Café` | Max 30 chars (Length: 24) |
| **Package Name (Application ID)** | `com.diningphilosophers.cafe` | Unique, reverse domain |
| **Version Code** | `1` | Integer, increment with each build |
| **Version Name** | `1.0` | User-visible version string |
| **Target SDK** | `API 36` (Android 16 / 15+) | Complies with Google Play policy |
| **Minimum SDK** | `API 24` (Android 7.0+) | Covers 99.5%+ of active devices |

---

## 2. Store Descriptions

### Short Description (Max 80 characters)
```text
Interactive visualizer for the Dining Philosophers concurrency and deadlock labs.
```
*(79 characters)*

### Alternative Short Description (Punchy)
```text
Explore OS deadlocks and concurrency solutions in an interactive visual café lab.
```
*(80 characters)*

---

### Full Description (Up to 4,000 characters)

```text
Explore and master classical operating system concurrency, synchronization, and deadlock concepts with Dining Philosophers Café — a hands-on, interactive simulation lab right on your Android device.

Originally formulated by Edsger Dijkstra and refined by Tony Hoare, the Dining Philosophers Problem is one of computer science’s most fundamental illustrations of mutual exclusion, resource allocation, deadlock, and starvation.

Dining Philosophers Café brings this classical problem to life with animated visual state machines, real-time fork allocation tracking, and complete algorithmic solutions.

☕ WHAT’S INSIDE:

1. THE DEADLOCK LAB
• Naive Protocol (Left Fork First): Watch all five philosophers claim their left fork simultaneously, creating a circular wait where none can eat and the entire system deadlocks.
• Resource Ordering: Learn how Dijkstra broke circular wait by enforcing strict ascending fork ordering (F1 < F2 < … < F5).
• Room Semaphore: See counting semaphores in action by restricting the dining room to at most N−1 philosophers at once.
• Centralized Waiter Arbiter: Observe atomic two-fork allocation where a philosopher receives both forks or none.
• Try-Lock with Random Back-off: Experience optimistic locking with back-off delay to resolve contention without cycles.

2. THE STARVATION LAB
• Greedy Priority Contention: Understand how a system can be deadlock-free yet cause indefinite starvation for low-priority processes.
• Fair FIFO Ticket Queue: Explore first-come, first-served queue sequencing ensuring bounded wait times for every philosopher.
• Chandy–Misra Algorithm: Discover the famous decentralized distributed solution using clean and dirty fork states and dynamic request tokens.

🎯 KEY FEATURES:
• Real-time animated table visualizer with state transitions (Thinking, Hungry, Waiting, Eating, Starving, Deadlock).
• Live interactive controls: Pause, resume, restart, and switch simulation speeds (0.5×, 1×, 2×).
• Detailed per-philosopher metrics: Total meals eaten, wait duration timers, and held mutex tracking.
• Chronological real-time event log with color-coded process identifiers.
• Sleek light and dark themes tailored with smooth, native-feel transitions.
• 100% Offline & Private: Zero network permissions, no account required, no ads, and no tracking.

Whether you are an operating systems student, computer science educator, software engineer preparing for concurrency interviews, or a curious learner, Dining Philosophers Café offers an intuitive and engaging gateway into concurrent programming.
```

---

## 3. Store Categorization & Tags

- **Primary Category:** `Education` (or `Tools`)
- **Secondary Category:** `Books & Reference`
- **Content Tags:**
  - `Computer Science`
  - `Education`
  - `Programming`
  - `Simulation`
  - `Operating Systems`

---

## 4. Visual Assets & Graphic Requirements

All graphics have been automatically prepared and placed in [`playstore-assets/`](file:///c:/Users/Janki%20Panchal/Downloads/New%20folder/Desktop/dining-philosophers-cafe/playstore-assets):

| Asset | File Location | Specifications |
|---|---|---|
| **App Icon** | `playstore-assets/icon-512x512.png` | 512×512 PNG, 32-bit color, under 1024KB |
| **Feature Graphic** | `playstore-assets/feature-graphic-1024x500.png` | 1024×500 PNG, 24/32-bit color, under 15MB |
| **Phone Screenshots** | Capture 4–8 portrait screenshots | Min 1080×1920 (16:9 or 9:18 aspect ratio) |
| **7-Inch Tablet Screenshots** | Capture 2+ screenshots | Min 1200×1920 |
| **10-Inch Tablet Screenshots** | Capture 2+ screenshots | Min 1600×2560 |

### Recommended Screenshot Tour (What to capture)
1. **Screenshot 1 — Deadlock in Action:** Naive lab showing the red deadlock banner and circular wait arrows (`P1 → P2 → P3 → P4 → P5 → P1`).
2. **Screenshot 2 — Resource Ordering:** Ordering lab demonstrating smooth deadlock-free dining with lowest-numbered fork priority.
3. **Screenshot 3 — Room Semaphore:** Room lab showing active seat count (`3 / 4 taken`) and counting semaphore indicators.
4. **Screenshot 4 — Dark Theme Experience:** Chandy–Misra clean/dirty token exchange in dark mode with the real-time event log.
5. **Screenshot 5 — Starvation Analysis:** Greedy priority lab highlighting P1's hunger duration and state detail.

---

## 5. Google Play Data Safety Form Answers

Google Play Console requires completing the Data Safety questionnaire. Since this application runs entirely client-side:

| Question | Answer | Rationale |
|---|---|---|
| **Does your app collect or share any user data?** | **No** | Zero user data is collected, stored remotely, or transmitted. |
| **Is all user data collected encrypted in transit?** | **N/A** (No data collected) | Not applicable. |
| **Do you provide a way for users to request data deletion?** | **No** | No user data exists on any server. |
| **Is this app designed for children?** | **No** (General Audience) | Educational utility intended for general audience / CS students. |

---

## 6. Content Rating (IARC Questionnaire)

When completing the International Age Rating Coalition (IARC) questionnaire in Google Play Console:

| Section | Answer |
|---|---|
| **Category** | Reference, News, or Educational |
| **Violence / Blood** | No |
| **Sexuality / Nudity** | No |
| **Language / Profanity** | No |
| **Controlled Substances** | No |
| **User Interaction / Chat** | No (standalone offline simulation) |
| **Physical Location Sharing** | No |
| **Digital Purchases / In-app Billing** | No |
| **Expected Rating** | **Everyone (PEGI 3, ESRB Everyone, USK 0)** |

---

## 7. Step-by-Step Signing & Release AAB Generation in Android Studio

Follow these steps on your machine with Android Studio to generate the signed Android App Bundle (`.aab`):

### Step 1: Open the Project in Android Studio
1. Launch **Android Studio**.
2. Select **Open** and browse to:
   ```
   c:\Users\Janki Panchal\Downloads\New folder\Desktop\dining-philosophers-cafe\android
   ```
3. Allow Gradle to sync dependencies.

### Step 2: Configure Signing Keystore
1. In the Android Studio menu, click **Build** → **Generate Signed Bundle / APK...**
2. Choose **Android App Bundle** and click **Next**.
3. Under **Key store path**:
   - If you have an existing upload keystore, click **Choose existing...**
   - If this is your first release, click **Create new...**:
     - **Key store path:** Choose a secure location outside the repository (e.g., `C:\Users\Janki Panchal\keystores\dining-philosophers.jks`).
     - **Password:** Enter a strong password and save it in a password manager.
     - **Alias:** `upload` (or `dining-key`).
     - **Validity:** 25+ years (default is 25).
     - **Certificate details:** Fill in First/Last Name and Organization.
4. Click **Next**.

### Step 3: Build the Release AAB
1. Select the **release** build variant.
2. Ensure **V2 (Full APK Signature)** and **Bundle Signing** are checked.
3. Click **Create** / **Finish**.
4. Android Studio will generate the bundle file:
   ```
   android\app\release\app-release.aab
   ```

### Step 4: Upload to Google Play Console
1. Log in to [Google Play Console](https://play.google.com/console).
2. Click **Create app**:
   - App name: `Dining Philosophers Café`
   - Default language: `English (United States)`
   - App or game: `App`
   - Free or paid: `Free`
3. Navigate to **Release** → **Production** (or **Closed testing** first).
4. Create a new release and upload `app-release.aab`.
5. Enter the Release Notes:
   ```text
   Initial Version 1.0 release of Dining Philosophers Café:
   - Complete Deadlock Lab (Naive, Resource Ordering, Room Semaphore, Waiter Arbiter, Try-Lock)
   - Complete Starvation Lab (Greedy Priority, FIFO Queue, Chandy–Misra)
   - Real-time animated simulation with speed controls and event log
   - Light and dark themes with full offline support
   ```
6. Complete the **Main store listing**, **Data safety**, **Privacy policy** (paste URL to `PRIVACY_POLICY.md`), and **Content rating**.
7. Submit for review!
