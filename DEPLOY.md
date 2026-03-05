# Deploying Mhenga Media on Railway

This guide puts the site online so your client can access it from any browser.

---

## Step 1 — Set up MongoDB Atlas (free cloud database)

1. Go to **https://www.mongodb.com/cloud/atlas** and create a free account
2. Click **Build a Cluster** → choose the **FREE (M0)** tier → pick a region close to you → click **Create Deployment**
3. Create a database user:
   - Username: `mhengaAdmin`
   - Password: click **Autogenerate** and **copy it somewhere safe**
4. Under **Network Access** → click **Add IP Address** → choose **Allow Access from Anywhere** (0.0.0.0/0)
5. Go to **Database** → click **Connect** → choose **Drivers** → copy the connection string  
   It looks like: `mongodb+srv://mhengaAdmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Replace `<password>` with the password you created in step 3
7. Add a database name in the URI: `mongodb+srv://mhengaAdmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/mhenga_media?retryWrites=true&w=majority`

---

## Step 2 — Push code to GitHub

If you haven't already:
```bash
cd "C:\Users\BRIAN\Documents\GitHub\Mhenga-media"
git add .
git commit -m "Add backend and admin panel"
git push
```

---

## Step 3 — Deploy on Railway

1. Go to **https://railway.app** and sign in with your GitHub account
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your **Mhenga-media** repository
4. Railway will create a service — click on it, then go to **Settings**:
   - Set **Root Directory** to `backend`
   - Railway auto-detects Node.js and runs `npm install` + `npm start`
5. Go to the **Variables** tab and add these:
   | Key              | Value                                           |
   |------------------|-------------------------------------------------|
   | `NODE_ENV`       | `production`                                    |
   | `PORT`           | `5000`                                          |
   | `MONGO_URI`      | _your MongoDB Atlas connection string from Step 1_ |
   | `JWT_SECRET`     | _a long random string (32+ chars)_              |
   | `JWT_EXPIRES_IN` | `2h`                                            |
   | `ADMIN_EMAIL`    | `glennaspin9@gmail.com`                         |
   | `ADMIN_PASSWORD` | `#Gee26.`                                       |
   | `CORS_ORIGIN`    | `*`                                             |
6. Go to **Settings** → **Networking** → click **Generate Domain** to get a public URL
7. Railway will redeploy automatically — wait for the build to finish

---

## Step 4 — Seed the admin user

Option A — Railway shell:
1. Install the Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link to your project: `railway link`
4. Run: `railway run npm run seed`

Option B — One-time seed on first deploy:
1. In the Variables tab, make sure `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set
2. Go to **Settings** → temporarily change **Start Command** to:  
   `node src/seed.js && node src/server.js`
3. Wait for deploy, check logs for "Admin user created"
4. Change the start command back to: `node src/server.js`

---

## Step 5 — Access your site

- **Main site**: `https://your-app.up.railway.app`
- **Admin panel**: `https://your-app.up.railway.app/admin`
- Login with: `glennaspin9@gmail.com` / your password

---

## Notes

- Railway gives you $5 free credit/month on the Hobby plan (no credit card needed for trial).
- To use a custom domain, go to **Settings** → **Networking** → **Custom Domain**.
- MongoDB Atlas free tier gives 512 MB storage — plenty for a portfolio/booking site.
- Railway auto-deploys when you push to GitHub.
