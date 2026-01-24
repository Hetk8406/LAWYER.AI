# Task Checklist - LawAI 2.0

## Phase 1: Initialization & Auth
- [ ] **Project Setup (LawAI_2.0)** <!-- id: 4 -->
    - [x] Create new directory `c:\Project\LawAI_2.0` <!-- id: 5 -->
    - [x] Initialize React (Vite) project <!-- id: 6 -->
    - [x] **[USER ACTION REQUIRED]** Add folder to Workspace <!-- id: 7 -->
- [x] **Authentication UI** <!-- id: 8 -->
    - [x] Create Layout (Split Screen) <!-- id: 9 -->
    - [x] Implement Login Form <!-- id: 10 -->
    - [x] Implement Signup Form <!-- id: 11 -->
    - [x] Ensure Mobile Responsiveness <!-- id: 12 -->
- [ ] **Debugging Blank Screen** <!-- id: 17 -->
    - [x] Add Error Boundary <!-- id: 18 -->
    - [x] Verify Layout with Borders <!-- id: 19 -->
    - [x] Check React/Vite Compatibility <!-- id: 20 -->
    - [x] Fix React Icons Import Crash <!-- id: 21 -->
    - [/] Fix Dashboard Blank Screen (Emergency Rewrites) <!-- id: 105 -->
    - [x] **Expand Signup Form Fields** <!-- id: 22 -->
        - [x] Analyze Old Signup Form <!-- id: 23 -->
        - [x] Add Role Selection & Extra Fields <!-- id: 24 -->
        - [x] Fix Scroll & Layout Issues <!-- id: 25 -->
    - [x] **Google Authentication** <!-- id: 26 -->
        - [x] Install Firebase SDK <!-- id: 28 -->
        - [x] Add "Continue with Google" Button UI <!-- id: 27 -->
        - [x] Setup Firebase Config <!-- id: 29 -->
    - [x] **Backend Integration** <!-- id: 30 -->
        - [x] Analyze Legacy Auth Logic <!-- id: 31 -->
        - [x] Create AuthContext (Axios + State) <!-- id: 32 -->
        - [x] Connect Login Form to API <!-- id: 33 -->
        - [x] Connect Signup Form to API <!-- id: 34 -->
    - [x] **Dashboard Implementation** <!-- id: 35 -->
        - [x] Create Dashboard Layout (Top Navbar) <!-- id: 36 -->
        - [x] Build Main Dashboard Widgets <!-- id: 37 -->
        - [x] Implement Features Page (Porting Legacy Content) <!-- id: 39 -->
        - [x] Implement About Page (Porting Legacy Content) <!-- id: 38 -->
        - [x] Implement About Page (Porting Legacy Content) <!-- id: 38 -->
        - [/] Redesign About & Features Pages (New UI) <!-- id: 102 -->
        - [/] Fix Profile Navigation, Update Logic & Redesign Page <!-- id: 100 -->
        - [x] Move Backend to New Project Folder <!-- id: 101 -->
        - [x] Implement Contact Support Page <!-- id: 40 -->
        - [x] Enhance Dashboard Content (Testimonials, Features) <!-- id: 41 -->

## Phase 2: Core Migration (TBD)
- [x] Chatbot Integration <!-- id: 13 -->
    - [x] Restore "Legacy Perfect" Model & Logic
    - [x] Add General Knowledge (General.json)
    - [x] Hybrid ChatGPT-style UI with Legacy Brain
- [x] Blog Feature <!-- id: 14 -->
    - [x] Backend (Models, Controller, Routes)
    - [x] Frontend (Listing, Create, Detail Pages)
    - [x] Integration with Navbar & Router
- [x] Courtroom Feature <!-- id: 15 -->
    - [x] Backend (Socket.io, Models, Controllers)
    - [x] Frontend (Real-time Chat UI, Contexts)
    - [x] Integration with Dashboard
- [x] IPC Dictionary <!-- id: 16 -->
    - [x] Backend (Search Controller & Routes)
    - [x] Frontend (IPC Finder Page)
- [x] Footer Integration
- [x] **Admin Panel Integration**
    - [x] Create Admin Layout (Sidebar/Navbar)
    - [x] Implement Admin Dashboard
    - [x] Implement Admin Login Redirect Logic
    - [x] Users Management
    - [x] Lawyers Management
    - [x] IPC Management

- [x] **Address Dashboard Stability** (Rollover)
    - [x] Re-verify DashboardHome blank screen issue.
    - [x] Fix Admin Login Redirect (currently goes to /dashboard)
- [x] **Address Dashboard Stability** (Rollover)
    - [x] Re-verify DashboardHome blank screen issue.
    - [x] Fix Admin Login Redirect (currently goes to /dashboard)
    - [x] **Fix Admin Panel Theme** (Current: Light/Unreadable, Target: Dark Mode)
- [x] **Address Dashboard Stability** (Rollover)
    - [x] Re-verify DashboardHome blank screen issue.
    - [x] Fix Admin Login Redirect (currently goes to /dashboard)
    - [x] **Fix Admin Panel Theme** (Current: Light/Unreadable, Target: Dark Mode)
    - [x] **Fix Admin Routing Issues** (Blog/Contact links cause logout)
    - [x] **Fix Admin Verification Lockout** (Exempt 'admin' from phone/email checks)
    - [x] **Fix Dev Environment** (Port conflicts, Flask missing, Recharts deps)

## Phase 3: User Dashboard Refinements
- [x] **Navbar Simplification**
    - [x] Remove Features, About, Contact from Navbar (Keep in Footer)
- [x] **Access Control & Login Fixes**
    - [x] Verify Role-based Access (Civilians/Lawyers)
    - [x] Fix Login Redirects if needed
- [x] **Fine-tune Access Control**
    - [x] Block Courtroom for Law Students (Navbar + Route)
    - [x] Block Blogs for Civilians (Navbar + Route)
- [x] **Fine-tune Access Control**
    - [x] Block Courtroom for Law Students (Navbar + Route)
    - [x] Block Blogs for Civilians (Navbar + Route)

## Phase 4: UI/UX Refinements
- [x] **Footer Redesign**
    - [x] Make Footer Compact & Modern
    - [x] Fix "Start at Bottom" issue (Implement ScrollToTop)

## IPC Debugging
- [x] Debug "No results found" for "302"
    - [x] Verify `IPC.json` contains "IPC 302"
    - [x] Test search logic with reproduction script
    - [x] Fix: Strip quotes from query to handle user input like '302'
    - [x] Fix: Sort results to prioritize Section matches (e.g. ensure "IPC 302" comes before "IPC 46")
    - [x] Fix: Create `.env` and add API URL fallback in Frontend to prevent 404s

## IPC UI Enhancements
- [x] **Implement Details Modal**
    - [x] Add `selectedIPC` state to `IPCPage.jsx`
    - [x] Create Modal styled components (Overlay, Content)
    - [x] Implement click handler on `ResultCard`
    - [x] Display full detailed content in Modal
- [x] **Implement Results Pagination**
    - [x] Add pagination state and logic (3 items/page) in `IPCPage.jsx`
    - [x] Create Pagination styled components
    - [x] Render pagination controls

## Phase 3: Courtroom Refactor (Lawyer-Client Chat)
- [x] **Analyze & Cleanup**
    - [x] Explore existing Courtroom Layout and Logic
    - [x] Remove "Create Room" / "Join Room" features
- [x] **Role-Based User Logic**
    - [x] Backend: Update `getUsers` endpoint to filter by role (Inverse Role Listing)
    - [x] Frontend: Display only permissible chat partners in Sidebar
- [x] **Debugging & Validation**
    - [x] Verify API logic returns correct contacts
    - [x] Verify email/auth middleware (patched/verified users)
