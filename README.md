# Eco Tracker

A responsive, green-themed eco-habit tracker made with **HTML, CSS, and vanilla JavaScript**. It works without a backend, database, API key, or framework.

## Features

- Home page with Start Tracking and Learn More links
- 12 daily eco-friendly habits across water, energy, waste, and nature
- Automatic eco-score (0–100) and progress percentage
- Date navigation to review or update past days (future days are disabled)
- Progress saved in browser `localStorage`
- Last-seven-days score chart
- Streak counter and achievement milestones
- Practical eco tips and rotating reminders
- Light/dark theme toggle
- Recent activity list
- Export saved progress as JSON
- Responsive layout for phones, tablets, and laptops
- Accessible labels and reduced-motion support

## Run it in VS Code

1. Extract `eco-tracker-website.zip`.
2. Open the extracted `eco-tracker-website` folder in VS Code.
3. Open `index.html`.
4. If you have the **Live Server** extension, right-click `index.html` and choose **Open with Live Server**. You can also open `index.html` directly in a modern browser.
5. Tick a few habits and refresh the page to test saving.

## Publish free with GitHub Pages

1. Create a new GitHub repository, for example `eco-tracker`.
2. Upload `index.html`, `style.css`, `script.js`, and `README.md` to the repository's root (not inside another nested folder).
3. On GitHub, open **Settings → Pages**.
4. Under Build and deployment, choose **Deploy from a branch**.
5. Choose branch `main` and folder `/ (root)`, then click **Save**.
6. Wait for GitHub Pages to publish the site. The published URL will be shown in the Pages settings.

## Important notes

- Progress is stored only in the current browser on the current device. It does not sync between devices or browsers.
- Clearing browser/site data may remove saved progress. Export your data periodically if you want a backup.
- This demo does not have accounts, cloud sync, or a database.
- The eco-score is a habit-completion score, **not a scientific measurement of carbon emissions or environmental savings**.
- Google Fonts are used when internet access is available; the page remains usable if fonts cannot load.
