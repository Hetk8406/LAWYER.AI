# How to Use Ngrok with Lawyer.AI (Single-Port Method)

## ⚡ Quick Cheat Sheet (Read this first!)

| Goal | Command | URL to visit | Note |
| :--- | :--- | :--- | :--- |
| **Develop Locally** (Code Changes) | `npm run dev` | `http://localhost:5173` | Hot-reloads instantly. Use this for 99% of your work. |
| **Share w/ Ngrok** (Show Friend) | `npm run build` <br> `npm run server` | `https://your-ngrok-url...` | **Must run BUILD first!** Backend serves the static files. |

---

## Detailed Guide: Exposing to Internet (Ngrok)

### Prerequisite
1.  **Stop all running terminals**.
2.  **Close** any running ngrok windows.

### Step 1: Configure Environment
1.  Start ngrok first to get your URL:
    ```powershell
    ngrok http 5000
    ```
2.  Copy the URL (e.g., `https://your-app.ngrok-free.app`).
3.  Open `d:\Projects\Lawyer.AI\Version 2\.env`.
4.  Update the API URL:
    ```properties
    VITE_API_URL=https://your-app.ngrok-free.app
    ```

### Step 2: Build & Run
Since we are in "Production Mode", you must turn your React code into static HTML/JS files first.

1.  Open a new terminal (keep ngrok running).
2.  **Build the Frontend** (Crucial Step!):
    ```powershell
    npm run build
    ```
3.  **Run the Server**:
    ```powershell
    npm run server
    ```
    
### Step 3: Share
Send the **Ngrok URL** to your teammate. They can open it and see the full App!

---

## Returning to Local Development
When you are done sharing and want to code again:

1.  **Stop** ngrok and the server.
2.  Change `.env` back to localhost:
    ```properties
    VITE_API_URL=http://localhost:5000
    ```
3.  Run:
    ```powershell
    npm run dev
    ```
