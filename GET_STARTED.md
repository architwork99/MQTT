# 🚀 GET STARTED - ATAK MQTT Target System

**Your full-stack mobile web app is ready!** Follow these simple steps to get it running.

---

## 📦 What You Have

A complete mobile-responsive web application that:

- ✅ Captures GPS location automatically
- ✅ Takes photos with device camera or uploads from gallery
- ✅ Collects target data (heading, pitch, roll, distance)
- ✅ Uploads images to Cloudinary CDN
- ✅ Publishes data via MQTT to your maritime monitoring system
- ✅ Ready to deploy to Vercel (free hosting)

---

## ⚡ Quick Start (3 Steps)

### Step 1: Install Dependencies

**Windows**:
```bash
cd D:\Vijay_Psitech\maritime\ATAK_MQTT
INSTALL.bat
```

**Mac/Linux**:
```bash
cd ATAK_MQTT
./install.sh
```

**Or manually**:
```bash
npm install
```

### Step 2: Start Development Server

```bash
npm run dev
```

**Output**:
```
  VITE v5.0.12  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### Step 3: Open in Browser

Open `http://localhost:5173` in your browser.

**You should see**:
- "ATAK MQTT Target System" header
- GPS location section (auto-capturing)
- Camera/upload buttons
- Target data form

---

## 🧪 Test It Locally

1. **Grant GPS Permission** when prompted
2. **Wait for GPS** coordinates to appear
3. **Click "Open Camera"** → Take a test photo (or "Upload Photo")
4. **Fill in test data**:
   - Heading: `45`
   - Pitch: `0`
   - Roll: `0`
   - Distance: `100`
5. **Click "Send Target"**
6. **Success!** You should see "✓ Target submitted successfully!"

---

## ☁️ Deploy to Vercel (5 Minutes)

### One-Time Setup

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### Deploy

```bash
# From ATAK_MQTT directory
vercel
```

**Answer prompts**:
- Set up and deploy? → **Y**
- Which scope? → **(Select your account)**
- Link to existing project? → **N**
- Project name? → **atak-mqtt**
- Directory? → **./  **
- Modify settings? → **N**

**You'll get a preview URL**: `https://atak-mqtt-abc123.vercel.app`

### Add Environment Variables

**Via Vercel Dashboard**:

1. Go to https://vercel.com/dashboard
2. Select `atak-mqtt` project
3. Settings → Environment Variables
4. Add these 4 variables:

| Variable Name | Value |
|---------------|-------|
| `CLOUDINARY_CLOUD_NAME` | `drxofvjbi` |
| `CLOUDINARY_API_KEY` | `222462328259684` |
| `CLOUDINARY_API_SECRET` | `Ez7j-oaGO6MmS2QO7dIRoEA7yKE` |
| `CLOUDINARY_URL` | `cloudinary://222462328259684:Ez7j-oaGO6MmS2QO7dIRoEA7yKE@drxofvjbi` |

5. Select **All environments** for each variable
6. Click **Save**

### Deploy to Production

```bash
vercel --prod
```

**You'll get a production URL**: `https://atak-mqtt.vercel.app`

---

## 📱 Test on Mobile

1. **Open the Vercel URL** on your mobile device
2. **Grant GPS permission**
3. **Grant camera permission**
4. **Take a photo** of any object
5. **Fill in test data**
6. **Submit**
7. **Success!** ✅

---

## 🔍 Verify MQTT Integration

### Start MQTT Listener

In your main maritime project, start the MQTT listener:

```bash
cd D:\Vijay_Psitech\maritime\new_backend
python aaronPyScript.py
```

**Output**:
```
[MQTT] Connected to broker.hivemq.com
[MQTT] Subscribed to aaron_nev/atak_targets
```

### Submit a Target

From your mobile device, submit a target.

**You should see in the console**:
```
[MQTT:RECV] aaron_nev/atak_targets
{
  "ts": 1771045222.178948,
  "count": 1,
  "targets": [{
    "lat": 19.008600,
    "lon": 73.130071,
    "heading": 45,
    "pitch": 0,
    "roll": 0,
    "distance_m": 100,
    "image": "https://res.cloudinary.com/drxofvjbi/image/upload/..."
  }]
}
[DB:OK id=123]
```

### Check Database

```sql
-- Connect to PostgreSQL
psql -h 192.168.10.106 -U postgres -d maritimeDB_2

-- Check recent ATAK targets
SELECT id, name, latitude, longitude, image_url, created_at
FROM atak
ORDER BY created_at DESC
LIMIT 5;
```

You should see your submitted target with the image URL!

---

## 📊 Project Structure

```
ATAK_MQTT/
├── 📄 README.md                    # Complete documentation
├── ⚡ QUICKSTART.md                # This file
├── 🚀 DEPLOYMENT_GUIDE.md          # Detailed Vercel deployment
├── 🧪 TESTING_GUIDE.md             # Testing procedures
├── 📋 PROJECT_SUMMARY.md           # Project overview
│
├── 🛠️ INSTALL.bat / install.sh     # Installation scripts
│
├── src/
│   ├── App.jsx                    # Main React component
│   ├── index.css                  # Tailwind styles
│   └── main.jsx                   # React entry point
│
├── api/
│   └── submit-target.js           # Serverless API endpoint
│
├── package.json                   # Dependencies
├── vite.config.js                 # Vite config
├── vercel.json                    # Vercel config
├── tailwind.config.js             # Tailwind config
└── .env                           # Environment variables
```

---

## 📚 Documentation Guide

| Document | When to Read | What It Contains |
|----------|--------------|------------------|
| **GET_STARTED.md** (this file) | Start here! | Quick setup and first steps |
| **README.md** | After setup | Full feature documentation |
| **QUICKSTART.md** | Need fast setup | 5-minute installation guide |
| **DEPLOYMENT_GUIDE.md** | When deploying | Complete Vercel deployment |
| **TESTING_GUIDE.md** | When testing | Testing procedures and tools |
| **PROJECT_SUMMARY.md** | Overview needed | Project status and deliverables |

---

## 🎯 Next Steps

### ✅ Immediate (Today)

1. [x] Install dependencies → `npm install`
2. [ ] Test locally → `npm run dev`
3. [ ] Verify GPS and camera work
4. [ ] Submit a test target

### ✅ Short-Term (This Week)

1. [ ] Deploy to Vercel → `vercel`
2. [ ] Test on real mobile device
3. [ ] Verify MQTT integration
4. [ ] Check database receives data
5. [ ] Share with team

### ✅ Long-Term (Future)

1. [ ] Add user authentication
2. [ ] Implement offline mode
3. [ ] Add target history view
4. [ ] Create map visualization
5. [ ] Gather user feedback

---

## 🐛 Common Issues

### GPS Not Working

**Problem**: "GPS permission denied"

**Solution**:
- Use HTTPS (automatic on Vercel, localhost also works)
- Grant location permission in browser
- Enable GPS on device

### Camera Not Opening

**Problem**: Camera button doesn't work

**Solution**:
- Use HTTPS (automatic on Vercel)
- Grant camera permission in browser
- Try "Upload Photo" instead

### Build Fails

**Problem**: `npm run build` or `vercel` fails

**Solution**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### MQTT Not Working

**Problem**: Messages not received

**Solution**:
- Ensure `aaronPyScript.py` is running
- Check network allows MQTT (port 1883)
- Verify broker: `broker.hivemq.com`
- Check Vercel function logs

---

## 📞 Need Help?

1. **Check Documentation**: Read README.md for detailed info
2. **Browser Console**: Press F12 to see errors
3. **Vercel Logs**: Run `vercel logs` to see backend errors
4. **Test MQTT**: Use mosquitto client to verify broker connection

---

## ✨ Features at a Glance

| Feature | Description |
|---------|-------------|
| 📍 **Auto GPS** | Location captured automatically |
| 📷 **Camera** | Direct camera access or upload |
| 🎯 **Target Data** | Heading, pitch, roll, distance |
| ☁️ **Cloud Storage** | Images in Cloudinary CDN |
| 📡 **MQTT** | Real-time message publishing |
| 📱 **Mobile-First** | Optimized for smartphones |
| 🌐 **HTTPS** | Secure connection (required) |
| 🚀 **Vercel** | Free hosting and deployment |

---

## 🎉 You're All Set!

Your ATAK MQTT Target System is ready to use!

**Start with**:
```bash
npm run dev
```

Then open `http://localhost:5173` and start capturing targets! 🎯

---

**Questions?** Read the [README.md](README.md) for complete documentation.

**Ready to deploy?** See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for Vercel instructions.

**Need to test?** Check [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing procedures.

---

**Built with ❤️ for maritime ATAK operations**

**Status**: ✅ Ready to Use
**Version**: 1.0.0
**Last Updated**: February 15, 2026
