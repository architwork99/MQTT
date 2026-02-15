# 🚀 Vercel Deployment Guide - ATAK MQTT

Complete step-by-step guide for deploying to Vercel.

---

## 📋 Prerequisites

- [x] Node.js 18+ installed
- [x] Git installed (optional but recommended)
- [x] Vercel account (sign up at https://vercel.com)
- [x] Cloudinary account credentials

---

## 🎯 Deployment Methods

### Method 1: Vercel CLI (Recommended)

#### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

Verify installation:
```bash
vercel --version
```

#### Step 2: Login to Vercel

```bash
vercel login
```

This will open your browser. Choose your authentication method:
- **Continue with GitHub**
- **Continue with GitLab**
- **Continue with Bitbucket**
- **Continue with Email**

#### Step 3: Navigate to Project

```bash
cd D:\Vijay_Psitech\maritime\ATAK_MQTT
```

#### Step 4: Deploy (Preview)

```bash
vercel
```

**Answer the prompts**:

```
? Set up and deploy "D:\Vijay_Psitech\maritime\ATAK_MQTT"? [Y/n]
→ Y

? Which scope do you want to deploy to?
→ <Your Vercel Account>

? Link to existing project? [y/N]
→ N

? What's your project's name?
→ atak-mqtt

? In which directory is your code located?
→ ./

? Want to modify these settings? [y/N]
→ N
```

**Result**:
```
✅  Preview: https://atak-mqtt-abc123.vercel.app
```

#### Step 5: Add Environment Variables

**Option A: Via CLI**

```bash
# Cloudinary Cloud Name
vercel env add CLOUDINARY_CLOUD_NAME
# When prompted, enter: drxofvjbi
# Select: Production, Preview, Development

# Cloudinary API Key
vercel env add CLOUDINARY_API_KEY
# Enter: 222462328259684
# Select: Production, Preview, Development

# Cloudinary API Secret
vercel env add CLOUDINARY_API_SECRET
# Enter: Ez7j-oaGO6MmS2QO7dIRoEA7yKE
# Select: Production, Preview, Development

# Cloudinary URL
vercel env add CLOUDINARY_URL
# Enter: cloudinary://222462328259684:Ez7j-oaGO6MmS2QO7dIRoEA7yKE@drxofvjbi
# Select: Production, Preview, Development
```

**Option B: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project (`atak-mqtt`)
3. Click **Settings** tab
4. Click **Environment Variables** in sidebar
5. Add each variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `CLOUDINARY_CLOUD_NAME` | `drxofvjbi` | All |
| `CLOUDINARY_API_KEY` | `222462328259684` | All |
| `CLOUDINARY_API_SECRET` | `Ez7j-oaGO6MmS2QO7dIRoEA7yKE` | All |
| `CLOUDINARY_URL` | `cloudinary://222462328259684:Ez7j-oaGO6MmS2QO7dIRoEA7yKE@drxofvjbi` | All |

Click **Save** after each variable.

#### Step 6: Deploy to Production

```bash
vercel --prod
```

**Result**:
```
✅  Production: https://atak-mqtt.vercel.app
```

Your app is now live! 🎉

---

### Method 2: GitHub Integration (Automatic Deployments)

#### Step 1: Create GitHub Repository

```bash
cd D:\Vijay_Psitech\maritime\ATAK_MQTT

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: ATAK MQTT Target System"
```

#### Step 2: Create Remote Repository

1. Go to https://github.com/new
2. Repository name: `atak-mqtt`
3. Description: "Mobile web app for ATAK target capture and MQTT transmission"
4. Visibility: Public or Private
5. Click **Create repository**

#### Step 3: Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/yourusername/atak-mqtt.git

# Push
git push -u origin main
```

#### Step 4: Import to Vercel

1. Go to https://vercel.com/new
2. Click **Import Git Repository**
3. Select your GitHub account
4. Find `atak-mqtt` repository
5. Click **Import**

#### Step 5: Configure Project

- **Project Name**: `atak-mqtt`
- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### Step 6: Add Environment Variables

Before clicking **Deploy**, expand **Environment Variables** and add:

```
CLOUDINARY_CLOUD_NAME = drxofvjbi
CLOUDINARY_API_KEY = 222462328259684
CLOUDINARY_API_SECRET = Ez7j-oaGO6MmS2QO7dIRoEA7yKE
CLOUDINARY_URL = cloudinary://222462328259684:Ez7j-oaGO6MmS2QO7dIRoEA7yKE@drxofvjbi
```

#### Step 7: Deploy

Click **Deploy** button.

Wait 1-2 minutes for build to complete.

**Result**:
```
✅  Deployment successful!
🌐  https://atak-mqtt-yourusername.vercel.app
```

#### Step 8: Automatic Deployments

Now every `git push` will trigger a new deployment automatically! 🎉

```bash
# Make changes
vim src/App.jsx

# Commit
git add .
git commit -m "Updated UI"

# Push (auto-deploys)
git push
```

---

## 🔧 Advanced Configuration

### Custom Domain

1. Go to Vercel Dashboard → Your Project
2. Click **Settings** → **Domains**
3. Add your domain (e.g., `targets.yourcompany.com`)
4. Update DNS records as instructed
5. Wait for DNS propagation (5-30 minutes)

### Custom Build Settings

Edit `vercel.json` to customize build:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

### Region Configuration

Deploy to specific regions for lower latency:

```json
{
  "regions": ["iad1", "sfo1", "lhr1"]
}
```

Regions:
- `iad1` - Washington, DC, USA
- `sfo1` - San Francisco, USA
- `lhr1` - London, UK
- `gru1` - São Paulo, Brazil
- `hnd1` - Tokyo, Japan

---

## 📊 Monitoring & Logs

### View Deployment Logs

**Via CLI**:
```bash
vercel logs
```

**Via Dashboard**:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Deployments → Select deployment → View Logs

### View Function Logs

**Via CLI**:
```bash
vercel logs --follow
```

**Via Dashboard**:
1. Deployments → Select deployment
2. Functions → `api/submit-target`
3. View real-time logs

### Analytics

**Via Dashboard**:
1. Your Project → Analytics
2. See:
   - Page views
   - Visitors
   - Top pages
   - Countries
   - Devices

---

## 🔒 Security Best Practices

### 1. Protect Environment Variables

Never commit `.env` to git:

```bash
# Already in .gitignore
echo ".env" >> .gitignore
```

### 2. Restrict CORS (Production)

Edit `api/submit-target.js`:

```javascript
// Development
res.setHeader('Access-Control-Allow-Origin', '*');

// Production
res.setHeader('Access-Control-Allow-Origin', 'https://atak-mqtt.vercel.app');
```

### 3. Use Cloudinary Signed Uploads

For production, use signed uploads:

```javascript
cloudinary.v2.uploader.upload(
  filePath,
  {
    folder: 'atak_targets',
    signature: generateSignature(), // Add signature
    api_key: process.env.CLOUDINARY_API_KEY,
  }
);
```

### 4. Add Rate Limiting

Install rate limiter:

```bash
npm install express-rate-limit
```

Add to API:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

export default limiter(handler);
```

---

## 🧪 Testing Deployment

### 1. Check Homepage

```bash
curl https://atak-mqtt.vercel.app
```

Should return HTML.

### 2. Test API Endpoint

```bash
curl -X OPTIONS https://atak-mqtt.vercel.app/api/submit-target
```

Should return 200 OK.

### 3. Test Image Upload

Create test script `test-api.js`:

```javascript
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('lat', '19.008600');
form.append('lon', '73.130071');
form.append('heading', '45');
form.append('pitch', '0');
form.append('roll', '0');
form.append('distance_m', '100');
form.append('image', fs.createReadStream('test-image.jpg'));

form.submit('https://atak-mqtt.vercel.app/api/submit-target', (err, res) => {
  console.log(res.statusCode);
  res.on('data', (chunk) => console.log(chunk.toString()));
});
```

Run:
```bash
node test-api.js
```

### 4. Mobile Device Testing

1. Open URL on mobile: `https://atak-mqtt.vercel.app`
2. Grant GPS permission
3. Grant camera permission
4. Capture test image
5. Submit target
6. Verify success message

---

## 🚨 Troubleshooting

### Build Fails

**Error**: `npm run build` failed

**Solution**:
```bash
# Check build locally first
npm run build

# If successful, commit and push again
git add .
git commit -m "Fix build"
git push
```

### Environment Variables Not Working

**Error**: Cloudinary upload fails

**Solution**:
1. Verify variables in Vercel Dashboard
2. Check variable names match exactly
3. Redeploy after adding variables:
   ```bash
   vercel --prod
   ```

### Function Timeout

**Error**: "Function execution timed out"

**Solution**:

Upgrade Vercel plan or optimize function:
- Pro plan: 60s timeout
- Optimize image upload
- Add timeout handling

### Domain Not Working

**Error**: Custom domain shows error

**Solution**:
1. Check DNS records are correct
2. Wait 24-48 hours for DNS propagation
3. Verify SSL certificate is active

---

## 📈 Performance Optimization

### 1. Enable Edge Caching

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### 2. Optimize Images

Already optimized via Cloudinary, but can add:

```javascript
cloudinary.v2.uploader.upload(filePath, {
  quality: "auto:eco", // More aggressive compression
  fetch_format: "auto", // Auto WebP
});
```

### 3. Enable Compression

Already enabled by Vercel, but verify:

```bash
curl -I https://atak-mqtt.vercel.app | grep -i "content-encoding"
# Should show: content-encoding: gzip
```

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables added
- [ ] Production deployment successful
- [ ] Homepage loads correctly
- [ ] API endpoint responds
- [ ] GPS works on mobile
- [ ] Camera works on mobile
- [ ] Image upload succeeds
- [ ] MQTT message publishes
- [ ] Images appear in Cloudinary
- [ ] Function logs show no errors
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] CORS configured for production
- [ ] Analytics enabled
- [ ] Monitoring set up

---

## 🎉 Success!

Your ATAK MQTT Target System is now deployed to Vercel!

**Production URL**: https://atak-mqtt.vercel.app (your actual URL)

**Next Steps**:
1. Test on real mobile devices
2. Share URL with team
3. Monitor usage in Vercel Dashboard
4. Check MQTT messages in backend
5. Review images in Cloudinary

---

**Need help?** Check the [README.md](README.md) for full documentation.
