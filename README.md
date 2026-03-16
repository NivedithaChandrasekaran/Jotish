## 🚀 Overview

A high-performance dashboard built using **React** that demonstrates custom UI rendering, browser hardware APIs, manual list virtualization, and data visualization.

The application is intentionally built **without using UI libraries** such as MUI or Bootstrap and **without virtualization libraries** such as react-window. This ensures that the core logic for rendering, performance optimization, and UI behavior is implemented manually.

The project includes a complete workflow:

* Login
* Employee dashboard with virtualized list
* Identity verification using camera and signature
* Insights page with SVG-based data visualization

## Key Technical Implementations

### 1. Custom List Virtualization

To efficiently render **1,000+ employee records**, I implemented a custom virtualization mechanism to avoid rendering unnecessary DOM nodes.

**How it works**

**Viewport**

* A fixed height container with `overflow-y: auto` acts as the scrollable viewport.

**Spacer Element**

* An inner container is given a height equal to:

Total Items × Row Height

This ensures the scrollbar behaves as if all rows are rendered.

**Index Calculation**
Based on the scroll position:

startIndex = Math.floor(scrollTop / rowHeight)
endIndex = startIndex + Math.ceil(viewportHeight / rowHeight)

**Dynamic Rendering**
Only rows between `startIndex` and `endIndex` are rendered.

**Position Adjustment**
Rendered rows are shifted using:

transform: translateY(startIndex * rowHeight)

This creates the illusion of a full list while keeping the DOM lightweight.

### 2. Identity Verification & Image Merging

The verification flow integrates browser hardware APIs.

**Camera Capture**

* Uses the `MediaDevices.getUserMedia()` API to access the user's camera.

**Image Capture**

* A frame from the video stream is captured using the HTML5 Canvas API.

**Signature Drawing**

* A drawing layer allows the user to add a signature using mouse interactions on a canvas overlay.

**Image Merge**

* The captured image and the signature canvas are merged programmatically into a single **audit image (Base64/PNG)** using the Canvas API.

### 3. Data Visualization

Employee salary distribution is visualized using **raw SVG element**
