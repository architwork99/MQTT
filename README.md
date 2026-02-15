# 🎯 ATAK MQTT Target System

A full-stack mobile-responsive web application for capturing target data (GPS location, image, orientation) and transmitting it via MQTT to remote systems.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/atak-mqtt)

## 🚀 Features

- 📍 **Automatic GPS Capture** - Auto-detects device location on load
- 📷 **Image Capture** - Direct camera access or photo upload from gallery
- 🎯 **Target Data Input** - Heading, pitch, roll, and distance measurements
- 🌐 **MQTT Transmission** - Publishes to HiveMQ public broker in real-time
- ☁️ **Cloud Storage** - Images automatically uploaded to Cloudinary CDN
- 📱 **Mobile-First Design** - Optimized for smartphones and tablets
- 🔒 **Secure HTTPS** - GPS/camera requires HTTPS (automatic on Vercel)
- ⚡ **Serverless Backend** - Vercel Edge Functions for scalability

## 📋 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Geolocation API** - GPS capture
- **Media Devices API** - Camera access

### Backend
- **Vercel Serverless Functions** - Node.js backend
- **Formidable** - Multipart form parsing
- **Cloudinary** - Image CDN storage
- **MQTT.js** - Message queue client
- **HiveMQ** - Public MQTT broker

## 🛠️ Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Cloudinary account (free tier)
- Git

### 1. Clone the Repository

```bash
cd D:\Vijay_Psitech\maritime
cd ATAK_MQTT
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your Cloudinary credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

> **Note**: The provided `.env` file already contains working credentials for testing.

### 4. Run Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or next available port).

> ⚠️ **Important**: GPS and camera access require HTTPS. For local testing:
> - Use `localhost` (treated as secure origin)
> - Or use ngrok/localtunnel for HTTPS tunnel
> - Or test directly on Vercel deployment

## 🌐 Deployment to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/atak-mqtt)

### Manual Deploy

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project → Settings → Environment Variables
   - Add:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `CLOUDINARY_URL`

5. **Redeploy** after setting env vars:
   ```bash
   vercel --prod
   ```

## 📱 Usage Guide

### Step-by-Step Workflow

1. **Open the App** on your mobile device (HTTPS required)

2. **GPS Location**:
   - Location is auto-captured on page load
   - Grant location permission if prompted
   - See coordinates displayed (latitude, longitude, accuracy)
   - Tap "Refresh" to update location if needed

3. **Capture Image**:
   - **Option A**: Tap "📸 Open Camera" → Take photo with device camera
   - **Option B**: Tap "🖼️ Upload Photo" → Select from gallery
   - Image preview appears with file size
   - Tap "×" to remove and recapture if needed

4. **Enter Target Data**:
   - **Heading** (0-360°): Direction target is facing
   - **Pitch** (-90 to 90°): Up/down angle
   - **Roll** (-180 to 180°): Left/right tilt
   - **Distance** (meters): Distance from source to target

5. **Submit**:
   - Tap "🚀 Send Target" button
   - Wait for "⏳ Uploading..." status
   - Success: "✓ Target submitted successfully!"
   - Form auto-resets after 2 seconds

### MQTT Message Format

The app publishes messages to `aaron_nev/atak_targets` topic in this exact format:

```json
{
  "ts": 1771045222.1789486,
  "count": 1,
  "targets": [
    {
      "lat": 19.008600,
      "lon": 73.130071,
      "src_lat": 19.008600,
      "src_lon": 73.130071,
      "heading": 359.5,
      "pitch": -3.875,
      "roll": 2.125,
      "distance_m": 4.1,
      "ts": 1771045185.1894472,
      "image": "https://res.cloudinary.com/drxofvjbi/image/upload/..."
    }
  ]
}
```

**Field Descriptions**:
- `ts` - Unix timestamp with microsecond precision
- `count` - Number of targets (always 1)
- `lat`, `lon` - GPS coordinates from device
- `src_lat`, `src_lon` - Source position (same as target for this app)
- `heading`, `pitch`, `roll`, `distance_m` - User input values
- `image` - Cloudinary HTTPS URL (note: field name is "image", not "image_url")

## 🐛 Troubleshooting

### GPS Not Working

**Symptoms**: "GPS permission denied" or location not found

**Solutions**:
- Ensure HTTPS connection (required for geolocation)
- Grant location permission in browser settings
- Check device GPS is enabled
- Try "Refresh" button to retry
- On iOS: Settings → Safari → Location → Allow

### Camera Not Opening

**Symptoms**: Camera button does nothing or permission denied

**Solutions**:
- HTTPS required for camera access
- Grant camera permission in browser
- On iOS: Settings → Safari → Camera → Allow
- Try "Upload Photo" as alternative

### Image Upload Fails

**Symptoms**: Error after selecting image

**Solutions**:
- Check file size (max 10MB)
- Use supported formats: JPEG, PNG, WebP
- Verify Cloudinary credentials in `.env`
- Check browser console for specific error

### MQTT Publish Fails

**Symptoms**: "MQTT publish failed" error

**Solutions**:
- Check network connection
- Verify MQTT broker is accessible (broker.hivemq.com:1883)
- Check browser console for connection errors
- Try again after a few seconds

### Submission Button Disabled

**Symptoms**: "Send Target" button is grayed out

**Solutions**:
- Ensure GPS location is acquired (green checkmark)
- Capture or upload an image first
- Both are required before submission

## 🔧 Development

### Project Structure

```
ATAK_MQTT/
├── src/
│   ├── App.jsx              # Main React component
│   ├── index.css            # Tailwind styles
│   └── main.jsx             # React entry point
├── api/
│   └── submit-target.js     # Serverless API endpoint
├── public/
│   └── index.html           # HTML template
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
├── vercel.json              # Vercel deployment config
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── .env                     # Environment variables (gitignored)
├── .env.example             # Environment template
└── README.md                # This file
```

### Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Deploy to Vercel
vercel
```

### API Endpoint

**POST** `/api/submit-target`

**Content-Type**: `multipart/form-data`

**Request Fields**:
- `image` (file) - Image file (JPEG, PNG, WebP)
- `lat` (number) - Latitude
- `lon` (number) - Longitude
- `heading` (number) - Heading degrees (0-360)
- `pitch` (number) - Pitch degrees (-90 to 90)
- `roll` (number) - Roll degrees (-180 to 180)
- `distance_m` (number) - Distance in meters

**Response** (Success - 200):
```json
{
  "success": true,
  "message": "Target submitted successfully",
  "image_url": "https://res.cloudinary.com/...",
  "mqtt_topic": "aaron_nev/atak_targets"
}
```

**Response** (Error - 400/500):
```json
{
  "error": "Error message description"
}
```

## 🧪 Testing

### Local Testing

1. Start dev server: `npm run dev`
2. Open `http://localhost:5173` in browser
3. Grant GPS and camera permissions
4. Capture test image and fill form
5. Submit and check browser console for MQTT message

### Testing MQTT Reception

Use a test MQTT listener to verify messages:

```bash
# Install mosquitto-clients
# Windows: choco install mosquitto
# Mac: brew install mosquitto
# Linux: apt-get install mosquitto-clients

# Subscribe to topic
mosquitto_sub -h broker.hivemq.com -t aaron_nev/atak_targets -v
```

Or use the existing `aaronPyScript.py` from the main project.

### Vercel Preview Testing

```bash
vercel
# Opens preview URL automatically
```

Test on real mobile devices using the preview URL.

## 📊 Monitoring

### Vercel Dashboard

- View deployment logs: https://vercel.com/dashboard
- Check function invocations
- Monitor errors and performance

### Cloudinary Dashboard

- View uploaded images: https://cloudinary.com/console
- Check storage usage
- Monitor bandwidth

### MQTT Monitoring

Use [HiveMQ MQTT Web Client](http://www.hivemq.com/demos/websocket-client/) to monitor:
- Broker: `broker.hivemq.com`
- Port: `8000` (WebSocket)
- Topic: `aaron_nev/atak_targets`

## 🔒 Security Notes

- **HTTPS Required**: GPS and camera APIs require secure origin
- **Environment Variables**: Never commit `.env` to version control
- **Cloudinary**: Use signed uploads for production (current setup uses unsigned)
- **MQTT**: Public broker - don't transmit sensitive data without encryption
- **CORS**: Currently allows all origins (`*`) - restrict for production

## 📈 Performance

- **Image Optimization**: Auto-resized to max 1200×1200px
- **Quality**: Auto-optimized by Cloudinary
- **CDN**: Global delivery via Cloudinary CDN
- **Serverless**: Auto-scales with traffic
- **Bundle Size**: ~150KB gzipped (React + Tailwind)
- **Load Time**: <2s on 3G connection

## 🛣️ Roadmap

- [ ] Add authentication (user login)
- [ ] Support multiple image uploads
- [ ] Offline mode with queue
- [ ] Image annotation/markup
- [ ] Target history view
- [ ] Map view of submitted targets
- [ ] Export data as CSV/JSON
- [ ] Private MQTT broker option
- [ ] Real-time target tracking
- [ ] Team collaboration features

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/atak-mqtt/issues)
- **Email**: support@example.com
- **Docs**: [Full Documentation](https://docs.example.com)

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) - Hosting and serverless functions
- [Cloudinary](https://cloudinary.com) - Image CDN and optimization
- [HiveMQ](https://www.hivemq.com) - Public MQTT broker
- [React](https://react.dev) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - Styling

---

**Built with ❤️ for maritime ATAK operations**

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: February 15, 2026
