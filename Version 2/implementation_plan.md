# Implementation Plan - AI Chat UI Redesign (ChatGPT Style)

## Goal
Redesign the AI Chat interface to closely resemble the clean, minimal, and premium aesthetic of ChatGPT, specifically improving the mobile experience.

## User Review Required
None.

## Proposed Changes
### AI Chat Page
#### [MODIFY] [ChatPage.jsx](file:///d:/Projects/Lawyer.AI/Version%202/src/pages/Dashboard/ChatPage.jsx)
-   **Color Palette**: Switch to a cleaner dark theme (Gray/Black) instead of the current radial purple gradient. match `var(--bg-dark)` mostly.
-   **Layout**:
    -   **Header**: Add a dedicated mobile header bar (simulating the sticky top bar).
    -   **Message List**: Remove bubble backgrounds for a more "text-first" look (like ChatGPT). Use Icons for role identification.
    -   **Input Area**:
        -   Make it a floating "Pill" shape.
        -   Center it with a max-width.
        -   Add the characteristic "disclaimer text" below it.
-   **Welcome Screen**:
    -   Center Logo (Lawyer.AI icon).
    -   2x2 Grid for suggestions with subtle borders.

### CSS Adjustments
-   Typography: Ensure `Inter` is used strictly.
-   Spacing: Increase breathing room between messages.

## Verification Plan
### Manual Verification
1.  **Mobile View (Responsive)**:
    -   Check sidebar toggle behavior.
    -   Verify Input bar is floating and does not cover the last message.
    -   Verify "Welcome Screen" grid layout on small screens.
2.  **Aesthetics**:
    -   Confirm "ChatGPT vibe" (clean dark grays, white text, subtle borders).
