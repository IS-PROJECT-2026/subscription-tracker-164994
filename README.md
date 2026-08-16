# SubTrack

SubTrack is a lightweight web application for tracking recurring subscriptions and understanding spending patterns. It helps users record subscriptions, monitor upcoming payments, and view spending insights from a clean dashboard.

## Purpose

The purpose of SubTrack is to provision a simple, client-side subscription management tool that works directly in the browser without a backend service.

## Core Functionality

SubTrack allows users to:

- Add subscriptions with name, category, price, billing cycle, next payment date, and status
- Edit or delete existing subscriptions
- Search subscriptions by name
- Filter subscriptions by category, billing cycle, and status
- View monthly and yearly spending estimates
- Track the number of active subscriptions
- View spending analysis grouped by category
- Highlight upcoming payments
- Toggle between light and dark theme modes

## Main Features

- Data validation for all subscription form fields
- Safe handling of malformed stored data
- Local persistence using browser LocalStorage
- Responsive layout for desktop and mobile
- Accessible interactions with reduced-motion support

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6)
- Browser LocalStorage API
- Git and GitHub
- GitHub Pages (deployment)

## Live Deployment

SubTrack is deployed on GitHub Pages:

- https://is-project-2026.github.io/subscription-tracker-164994/

If the page returns 404, confirm GitHub Pages is configured to deploy from the main branch (see Deployment section below), then wait a few minutes for publishing to finish.

## Deployment (GitHub Pages)

1. Open the repository on GitHub.
2. Go to Settings > Pages.
3. Under Build and deployment:
4. Set Source to Deploy from a branch.
5. Set Branch to main and folder to /(root).
6. Click Save.
7. Wait for the Pages build to complete and open the live URL.

## Project Structure

```text
subscription-tracker-164994/
|-- index.html
|-- README.md
|-- css/
|   `-- style.css
`-- js/
    |-- app.js
    `-- subscription-model.js
```

## Local Run

Because this is a static client-side app, you can run it by opening index.html in a browser or by using a local static server.

## Submission Readiness Checklist

- README includes system purpose and functionality
- README includes technologies used
- README includes live deployment URL
- GitHub Pages configured from main branch
- Deployment link opens and app loads successfully
- Main features work on deployed app
- Required submission.md is present and fully completed
