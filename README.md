# Carbontrack local development

The app uses a React frontend and the API in the sibling dct-back directory. The redesign includes a responsive dark glass dashboard, profile/connections, team management, and sign-in/sign-up.

Start the API in dct-back with npm start (127.0.0.1:3004). In another PowerShell terminal, start this frontend with $env:PORT='3010'; $env:BROWSER='none'; npm start. REACT_APP_API can override the backend URL; it defaults to http://127.0.0.1:3004.

The development account is test@test.com / 123456. User changes are stored in memory and reset when the API restarts.

Validation commands in this directory:

- npm test -- --watchAll=false --runInBand
- npm run build
- npm run test:e2e (start both servers first; installed Google Chrome is used)

The browser suite checks desktop and mobile layouts, authentication, signup, reporting dates, CSV exports, profile updates, team creation, empty data, API failures and recovery. Screenshots and the HTML report are written to ignored test-results and playwright-report directories. E2E_BASE_URL and E2E_API_URL override the server addresses.

Klaviyo uses the Reporting API with campaign analytics and metric lookup; its key needs campaigns:read and metrics:read. Reports are cached for one minute to reduce rate limiting. Meta's currently configured application has been deleted and needs a replacement access token/application. Shopify and Google Ads retain the existing sample-data implementations. Every sample source is marked in the dashboard and exported CSV.

## Workspace pages

- /platforms/klaviyo: platform metrics and source-provided campaign activity.
- /connection-health: live/sample/error status, check times, and credential links.
- /history: actual captured snapshots, reporting-period filters, and daily/weekly/monthly capture grouping. Missing live data is blank, never plotted as zero.
- /goals: monthly targets, matching calendar-month snapshots, and previous-month baselines. Sample data cannot count towards goal progress.
- /reports: immutable saved reports, CSV export, and printable summaries with methodology.

Analytics, goals, reports, and connection checks are persisted locally in dct-back/data/workspaces.json. Provider keys are excluded from this file. Set DCT_ANALYTICS_FILE to use another local path; the API tests use isolated temporary storage. User profiles and credentials retain the existing in-memory development behavior.

Refreshing the dashboard records an observation. Identical data for the same reporting period on the same day is deduplicated. History tracks capture dates and does not invent daily emissions or add overlapping reporting periods together.

---

## Get Started

This guide describes how to use DigitalOcean App Platform to run a sample React application.

**Note**: Following these steps may result in charges for the use of DigitalOcean services.

### Requirements

* You need a DigitalOcean account. If you do not already have one, first [sign up](https://cloud.digitalocean.com/registrations/new).

## Deploy the App

Click the following button to deploy the app to App Platform. If you are not currently logged in with your DigitalOcean account, this button prompts you to to log in.

[![Deploy to DigitalOcean](https://www.deploytodo.com/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/digitalocean/sample-react/tree/main)

Note that, for the purposes of this tutorial, this button deploys the app directly from DigitalOcean's GitHub repository, which disables automatic redeployment since you cannot change our template. If you want automatic redeployment or you want to change the sample app's code to your own, we instead recommend you fork [our repository](https://github.com/digitalocean/sample-react/tree/main).

To fork our repository, click the **Fork** button in the top-right of [its page on GitHub](https://github.com/digitalocean/sample-react/tree/main), then follow the on-screen instructions. To learn more about forking repos, see the [GitHub documentation](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo).

After forking the repo, you can view the same README in your own GitHub org; for example, in `https://github.com/<your-org>/sample-react`. To deploy the new repo, visit the [control panel](https://cloud.digitalocean.com/apps) and click the **Create App** button. This takes you to the app creation page. Under **Service Provider**, select **GitHub**. Then, under **Repository**, select your newly-forked repo. Ensure that your branch is set to **main** and **Autodeploy** is checked on. Finally, click **Next**.

After clicking the **Deploy to DigitalOcean** button or completing the instructions above to fork the repo, follow these steps:

1. Configure the app, such as by specifying HTTP routes, declaring environment variables, or adding a database. For the purposes of this tutorial, this step is optional.
1. Provide a name for your app and select the region to deploy your app to, then click **Next**. By default, App Platform selects the region closest to you. Unless your app needs to interface with external services, your chosen region does not affect the app's performance, since to all App Platform apps are routed through a global CDN.
1. On the following screen, leave all the fields as they are and click **Next**.
1. Confirm your plan settings and how many containers you want to launch and click **Launch Basic/Pro App**.

After, you should see a "Building..." progress indicator. You can click **View Logs** to see more details of the build. It can take a few minutes for the build to finish, but you can follow the progress in the **Deployments** tab.

Once the build completes successfully, click the **Live App** link in the header and you should see your running application in a new tab, displaying the home page.


## Make Changes to Your App

If you forked our repo, you can now make changes to your copy of the sample app. Pushing a new change to the forked repo automatically redeploys the app to App Platform with zero downtime.

Here's an example code change you can make for this app:

1. Edit `src/App.js` and replace "Welcome to Your New React App" with a different greeting
1. Commit the change to the `main` branch. Normally it's a better practice to create a new branch for your change and then merge that branch to `main` after review, but for this demo you can commit to the `main` branch directly.
1. Visit the [control panel](https://cloud.digitalocean.com/apps) and navigate to your sample app.
1. You should see a "Building..." progress indicator, just like when you first created the app.
1. Once the build completes successfully, click the **Live App** link in the header and you should see your updated application running. You may need to force refresh the page in your browser (e.g. using **Shift** + **Reload**).

## Learn More

To learn more about App Platform and how to manage and update your application, see [our App Platform documentation](https://www.digitalocean.com/docs/app-platform/).

## Delete the App

When you no longer need this sample application running live, you can delete it by following these steps:
1. Visit the [Apps control panel](https://cloud.digitalocean.com/apps).
2. Navigate to the sample app.
3. In the **Settings** tab, click **Destroy**.

**Note**: If you do not delete your app, charges for using DigitalOcean services will continue to accrue.
