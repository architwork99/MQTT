# ⚡ Quick Start Guide - ATAK MQTT Target System

Get up and running in 5 minutes!

## 🚀 Local Development (3 Steps)

### Step 1: Install Dependencies

```bash
cd D:\Vijay_Psitech\maritime\ATAK_MQTT
npm install
```

### Step 2: Configure Environment

The `.env` file is already configured with working Cloudinary credentials. No changes needed!

### Step 3: Start Development Server

```bash
npm run dev
```

Open your browser to `http://localhost:5173`

> **Note**: GPS and camera work on `localhost` without HTTPS (treated as secure origin).

---

## ☁️ Vercel Deployment (4 Steps)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

Follow the browser prompt to authenticate.

### Step 3: Deploy

```bash
cd D:\Vijay_Psitech\maritime\ATAK_MQTT
vercel
```

Answer the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **What's your project's name?** → atak-mqtt (or any name)
- **In which directory is your code located?** → ./
- **Want to modify settings?** → No

### Step 4: Add Environment Variables

After first deployment, add environment variables:

```bash
# Add via CLI
vercel env add CLOUDINARY_CLOUD_NAME
# Enter: drxofvjbi

vercel env add CLOUDINARY_API_KEY
# Enter: 222462328259684

vercel env add CLOUDINARY_API_SECRET
# Enter: Ez7j-oaGO6MmS2QO7dIRoEA7yKE

vercel env add CLOUDINARY_URL
# Enter: cloudinary://222462328259684:Ez7j-oaGO6MmS2QO7dIRoEA7yKE@drxofvjbi
```

**Or add via Dashboard**:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all 4 variables
5. Select all environments (Production, Preview, Development)

### Step 5: Redeploy

```bash
vercel --prod
```

Your app is now live! 🎉

---

## 📱 Mobile Testing

### Option 1: Direct URL

After Vercel deployment, open the URL on your mobile device:
```
https://atak-mqtt-yourusername.vercel.app
```

### Option 2: QR Code

Generate a QR code from your Vercel URL:
1. Go to https://qr-code-generator.com
2. Paste your Vercel URL
3. Scan with phone camera
4. Opens directly in browser

### Option 3: Local Network (with ngrok)

Test locally on mobile before deploying:

```bash
# Install ngrok
npm install -g ngrok

# Start your dev server
npm run dev

# In another terminal, create HTTPS tunnel
ngrok http 5173
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`) and open on mobile.

---

## 🧪 Quick Test

1. **Open the app** (localhost or Vercel URL)
2. **Grant GPS permission** when prompted
3. **Wait for GPS** coordinates to display
4. **Tap "Open Camera"** → Take a test photo
5. **Enter test data**:
   - Heading: 45
   - Pitch: 0
   - Roll: 0
   - Distance: 100
6. **Tap "Send Target"**
7. **Success!** Should see "✓ Target submitted successfully!"

---

## 🔍 Verify MQTT Message

### Option 1: Use aaronPyScript.py

If you have the main maritime project running:

```bash
cd D:\Vijay_Psitech\maritime\new_backend
python aaronPyScript.py
```

You should see:
```
[MQTT:RECV] aaron_nev/atak_targets
[DB:OK id=123]
```

### Option 2: Use MQTT Client

```bash
# Install mosquitto
# Windows: choco install mosquitto

# Subscribe to topic
mosquitto_sub -h broker.hivemq.com -t aaron_nev/atak_targets -v
```

You'll see the JSON message appear when you submit a target.

### Option 3: HiveMQ Web Client

1. Go to http://www.hivemq.com/demos/websocket-client/
2. Click "Connect"
3. Add Subscription:
   - Topic: `aaron_nev/atak_targets`
   - QoS: 1
4. Submit a target from your app
5. Message appears in the web client!

---

## 🐛 Troubleshooting

### GPS Not Working

**Problem**: "GPS permission denied"

**Solution**:
```bash
# Make sure you're using HTTPS or localhost
# Check browser console for errors
# Grant location permission in browser settings
```

### Camera Not Opening

**Problem**: Camera button doesn't work

**Solution**:
- HTTPS required (automatic on Vercel)
- Grant camera permission
- Try "Upload Photo" instead

### Build Fails

**Problem**: `npm run build` fails

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Vercel Deploy Fails

**Problem**: Deployment error

**Solution**:
```bash
# Check Vercel logs
vercel logs

# Verify environment variables are set
vercel env ls

# Try deploying again
vercel --prod
```

### Image Upload Error

**Problem**: "Image upload failed"

**Solution**:
- Verify Cloudinary credentials in environment variables
- Check image is under 10MB
- Use JPEG, PNG, or WebP format
- Check Vercel function logs for details

---

## 📊 Check Results

### Cloudinary Dashboard

1. Go to https://cloudinary.com/console
2. Login with your account
3. Media Library → `atak_targets` folder
4. See uploaded images!

### Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Deployments → Latest → Functions
4. See function invocations and logs

---

## ✅ Success Checklist

- [ ] `npm install` completed successfully
- [ ] `npm run dev` starts without errors
- [ ] App opens in browser
- [ ] GPS coordinates appear
- [ ] Camera opens and captures image
- [ ] Image preview shows correctly
- [ ] Form submits successfully
- [ ] Success message appears
- [ ] MQTT message received (verified with client)
- [ ] Image appears in Cloudinary dashboard
- [ ] Vercel deployment successful
- [ ] Mobile device can access app
- [ ] Everything works on mobile (GPS, camera, submit)

---

## 🎯 What's Next?

1. **Test on real mobile devices** - iOS Safari and Android Chrome
2. **Monitor MQTT messages** - Verify aaronPyScript.py receives data
3. **Check database** - Confirm data saved to maritimeDB_2
4. **Customize styling** - Modify Tailwind classes in App.jsx
5. **Add features** - See roadmap in README.md

---

## 📞 Need Help?

- **README.md** - Full documentation
- **Browser Console** (F12) - Check for errors
- **Vercel Logs** - `vercel logs`
- **MQTT Test Client** - http://www.hivemq.com/demos/websocket-client/

---

**Ready to capture targets! 🎯**
