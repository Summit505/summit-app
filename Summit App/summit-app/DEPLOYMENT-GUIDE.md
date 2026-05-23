# SUMMIT APP — DEPLOYMENT GUIDE
## From beta web app to App Store

---

# PART 1: DEPLOY THE BETA (Vercel — Free, ~15 minutes)
### This gets you a live URL you can share TODAY

---

## STEP 1: Install Node.js
1. Go to https://nodejs.org
2. Download the LTS version (the green button)
3. Run the installer — click through all defaults
4. Open Terminal (Mac) or Command Prompt (Windows)
5. Type: node --version
6. You should see something like: v18.17.0
7. If you see a version number, Node is installed correctly

---

## STEP 2: Set Up the Project on Your Computer
1. Download the summit-app folder from this conversation
2. Unzip it if needed — you should see a folder called "summit-app"
3. Open Terminal / Command Prompt
4. Navigate into the folder:
   cd path/to/summit-app
   (Example on Mac: cd Downloads/summit-app)
5. Install dependencies:
   npm install
6. You'll see a lot of text scroll by — this is normal
7. When it finishes, test locally:
   npm run dev
8. Open your browser and go to: http://localhost:5173
9. The app should appear. If it does, you're ready to deploy.
10. Press Ctrl+C in Terminal to stop the local server

---

## STEP 3: Create a GitHub Account (free)
You need this to connect to Vercel.
1. Go to https://github.com
2. Click Sign Up
3. Follow the steps to create an account
4. Verify your email address

---

## STEP 4: Push the Project to GitHub
1. In Terminal, while inside the summit-app folder:
   git init
   git add .
   git commit -m "Summit app v1.0 beta"
2. Go to https://github.com/new
3. Repository name: summit-app
4. Set to Public or Private (either works)
5. Click Create Repository
6. GitHub will show you commands — copy and run the ones that say:
   git remote add origin https://github.com/YOURNAME/summit-app.git
   git branch -M main
   git push -u origin main
7. Refresh the GitHub page — you should see your files there

---

## STEP 5: Deploy on Vercel (free)
1. Go to https://vercel.com
2. Click Sign Up — sign up with your GitHub account
3. Click Add New Project
4. Find summit-app in your repository list and click Import
5. Vercel will detect it's a Vite app automatically
6. Click Deploy
7. Wait 60-90 seconds
8. Vercel gives you a URL like: https://summit-app-xyz.vercel.app
9. Open that URL on your iPhone — the app is live!

---

## STEP 6: Share the Beta
1. Send the Vercel URL to anyone you want to test with
2. Tell them: "Open this on your phone, then tap Share → Add to Home Screen"
3. It installs like a real app with its own icon
4. Data saves locally to their device
5. You can update the app anytime by pushing to GitHub — Vercel redeploys automatically

---

## STEP 7: Custom Domain (optional, $10-15/year)
1. Buy a domain at https://namecheap.com (e.g. summitapp.co)
2. In Vercel, go to your project → Settings → Domains
3. Add your domain and follow the DNS instructions
4. Your app is now at your own URL

---
---

# PART 2: APPLE DEVELOPER ACCOUNT (~30 minutes)
### You need this for TestFlight beta testing and App Store submission

---

## STEP 1: Create Your Apple Developer Account
1. Go to https://developer.apple.com
2. Click Account in the top right
3. Sign in with your Apple ID (or create one)
4. Click Join the Apple Developer Program
5. Click Enroll
6. Choose Individual (unless you're registering as a company)
7. Fill in your legal name and address
8. Pay the $99/year fee
9. Apple will approve your account — usually same day, sometimes up to 24 hours

---

## PART 3: TESTFLIGHT BETA (requires a Mac with Xcode)
### This is the proper Apple beta testing tool

---

## STEP 1: Install Xcode on a Mac
1. Open the Mac App Store
2. Search for Xcode
3. Click Get / Install (it's free, about 10GB)
4. Wait for it to download and install
5. Open Xcode and accept the license agreement

---

## STEP 2: Convert to React Native with Expo
The current app is React (web). To put it in TestFlight and the App Store
it needs to be a native app. We use Expo to do this.

1. Install Expo CLI:
   npm install -g expo-cli eas-cli
2. Create a new Expo project:
   npx create-expo-app SummitApp
   cd SummitApp
3. Replace the App.js content with the React Native version
   (Claude will generate this in your next session)

---

## STEP 3: Configure Your App Identity in Expo
1. Open app.json in your project and update:
   {
     "expo": {
       "name": "Summit",
       "slug": "summit-app",
       "version": "1.0.0",
       "bundleIdentifier": "com.YOURNAME.summitapp",
       "ios": {
         "bundleIdentifier": "com.YOURNAME.summitapp",
         "buildNumber": "1"
       }
     }
   }
2. Replace YOURNAME with your actual name or brand (no spaces)
3. The bundle identifier must be unique globally — add your name to make it unique

---

## STEP 4: Connect Expo to Your Apple Developer Account
1. In Terminal, from your project folder:
   eas login
2. Enter your Expo account credentials (create one free at expo.dev)
3. Then:
   eas build:configure
4. Follow the prompts — it will ask for your Apple Developer credentials
5. Sign in with your Apple ID when prompted
6. Expo will automatically create the provisioning profiles and certificates

---

## STEP 5: Build for TestFlight
1. In Terminal:
   eas build --platform ios --profile preview
2. This uploads your code to Expo's cloud builders
3. Takes about 10-15 minutes
4. When done, you get a link to download a .ipa file
5. You can also run: eas submit --platform ios
   to submit directly to App Store Connect

---

## STEP 6: Set Up TestFlight in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Sign in with your Apple ID
3. Click My Apps
4. Click the + button → New App
5. Fill in:
   - Platform: iOS
   - Name: Summit
   - Primary Language: English
   - Bundle ID: select the one you created (com.YOURNAME.summitapp)
   - SKU: summit-app-001
6. Click Create

---

## STEP 7: Upload Your Build
1. After your EAS build completes, Expo will ask to submit to TestFlight
2. Or manually: in App Store Connect → your app → TestFlight tab
3. Your build will appear under iOS Builds within a few minutes
4. Apple runs an automated review (usually 5-30 minutes)
5. Once approved, click the build and enable it for testing

---

## STEP 8: Invite Beta Testers
1. In TestFlight tab → Testers & Groups
2. Click the + next to Testers
3. Enter email addresses of people you want to invite
4. They get an email with a link to install TestFlight (free app)
5. They install TestFlight, then install Summit through it
6. They can send you feedback directly through TestFlight
7. You can have up to 10,000 external testers

---

## STEP 9: When You're Ready for the App Store
1. Go to App Store Connect → your app → App Store tab
2. Fill in:
   - App description (what it does)
   - Keywords (summit, hiking, training, fitness, recovery)
   - Category: Health & Fitness
   - Screenshots (required — at least 3 for iPhone)
   - Privacy Policy URL (required — host a simple one on your Vercel site)
3. Under Pricing, set it to Free (or paid if you choose)
4. Click Submit for Review
5. Apple reviews take 1-3 business days
6. They may ask questions or request changes
7. Once approved, your app goes live on the App Store

---

# WHAT TO DO RIGHT NOW (TODAY)

1. Deploy the web beta on Vercel (Part 1 above) — share with friends today
2. Get your Apple Developer account ($99)
3. In your next Claude session: ask for the React Native conversion
4. Then follow Part 3 above to get to TestFlight

---

# QUESTIONS YOU MAY HAVE

Q: Do I need a Mac for the App Store?
A: Yes. Xcode only runs on Mac. If you don't have one, a Mac mini starts at $599,
   or you can rent Mac-in-cloud at https://www.macincloud.com for ~$25/month.

Q: Can Android users use the app?
A: The Vercel web app works on any phone. For a native Android app,
   Expo can also build for Android — we'd add that in a future session.

Q: How much does all this cost?
A: Vercel free tier: $0 / Apple Developer: $99/year / Domain (optional): ~$12/year
   Total to launch: $99-$111 for year one.

Q: Do I need to know how to code to maintain this?
A: Not really. Updates go through Claude → copy new code → push to GitHub → 
   Vercel redeploys automatically. For native app updates, run eas build again.

Q: What is a Privacy Policy and where do I get one?
A: Apple requires one for App Store apps. In your next session, ask Claude
   to generate a privacy policy for Summit. Host it as a page on your Vercel site.

---

# FILES IN THIS PACKAGE

summit-app/
├── index.html          ← Entry point with PWA/iPhone meta tags
├── package.json        ← Project dependencies
├── vite.config.js      ← Build configuration
├── vercel.json         ← Vercel deployment settings
├── generate-icons.js   ← Script to create placeholder app icons
├── src/
│   ├── main.jsx        ← React entry point
│   └── App.jsx         ← The full Summit app (all your code)
└── public/
    └── manifest.json   ← PWA manifest (enables Add to Home Screen)

---

Built with React + Vite. Designed for iOS PWA and React Native conversion.
SUMMIT APP v1.0 — 2026
