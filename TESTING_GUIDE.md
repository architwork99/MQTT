# 🧪 Testing Guide - ATAK MQTT Target System

Comprehensive testing guide for local development and production deployment.

---

## 📋 Testing Checklist

### Frontend Testing

- [ ] **GPS Location**
  - [ ] Auto-captures on page load
  - [ ] Displays latitude/longitude correctly
  - [ ] Shows accuracy in meters
  - [ ] "Refresh" button updates location
  - [ ] Error message shows if permission denied

- [ ] **Camera Capture**
  - [ ] "Open Camera" button opens device camera
  - [ ] Prefers rear camera on mobile
  - [ ] Image preview displays after capture
  - [ ] Can clear and retake photo
  - [ ] Error message for invalid file type

- [ ] **Photo Upload**
  - [ ] "Upload Photo" button opens file picker
  - [ ] Accepts JPEG, PNG, WebP
  - [ ] Rejects other file types
  - [ ] Shows error for files >10MB
  - [ ] Image preview displays correctly

- [ ] **Form Validation**
  - [ ] Submit button disabled without GPS
  - [ ] Submit button disabled without image
  - [ ] All numeric inputs accept decimals
  - [ ] Heading limited to 0-360
  - [ ] Pitch limited to -90 to 90
  - [ ] Roll limited to -180 to 180

- [ ] **Submission**
  - [ ] Shows "Uploading..." state
  - [ ] Success message appears
  - [ ] Form resets after 2 seconds
  - [ ] Error message shows if fails

- [ ] **Responsive Design**
  - [ ] Works on mobile portrait
  - [ ] Works on mobile landscape
  - [ ] Works on tablet
  - [ ] Works on desktop
  - [ ] Touch-friendly buttons (min 44×44px)

### Backend Testing

- [ ] **API Endpoint**
  - [ ] Accepts POST requests
  - [ ] Returns 405 for other methods
  - [ ] Handles CORS correctly
  - [ ] Validates required fields
  - [ ] Returns proper error codes

- [ ] **Image Upload**
  - [ ] Uploads to Cloudinary successfully
  - [ ] Returns HTTPS URL
  - [ ] Images appear in `atak_targets` folder
  - [ ] Images optimized (max 1200×1200)
  - [ ] Handles upload errors gracefully

- [ ] **MQTT Publishing**
  - [ ] Connects to broker
  - [ ] Publishes with QoS 1
  - [ ] Message format matches specification
  - [ ] Disconnects cleanly
  - [ ] Handles connection timeout

### Integration Testing

- [ ] **End-to-End Flow**
  - [ ] GPS → Camera → Form → Submit → Success
  - [ ] Image appears in Cloudinary
  - [ ] MQTT message received by listener
  - [ ] Data saved to database (if using aaronPyScript.py)

- [ ] **Error Scenarios**
  - [ ] GPS permission denied
  - [ ] Camera permission denied
  - [ ] Network offline
  - [ ] Cloudinary upload fails
  - [ ] MQTT broker unreachable

### Browser Testing

- [ ] **Desktop Browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Edge (latest)
  - [ ] Safari (latest)

- [ ] **Mobile Browsers**
  - [ ] iOS Safari
  - [ ] iOS Chrome
  - [ ] Android Chrome
  - [ ] Android Firefox

### Performance Testing

- [ ] **Load Time**
  - [ ] Initial load <3 seconds
  - [ ] Time to interactive <5 seconds
  - [ ] GPS acquisition <3 seconds
  - [ ] Image upload <5 seconds

- [ ] **Bundle Size**
  - [ ] Total bundle <500KB gzipped
  - [ ] Lighthouse score >90

---

## 🧪 Test Scenarios

### Scenario 1: Happy Path

**Steps**:
1. Open app on mobile device
2. Grant GPS permission
3. Wait for coordinates to appear
4. Tap "Open Camera"
5. Grant camera permission
6. Take photo of target
7. Enter data:
   - Heading: 90
   - Pitch: 5
   - Roll: 0
   - Distance: 50
8. Tap "Send Target"

**Expected Result**:
- Success message appears
- Form resets after 2 seconds
- MQTT message published
- Image in Cloudinary

### Scenario 2: Photo Upload

**Steps**:
1. Open app
2. Wait for GPS
3. Tap "Upload Photo"
4. Select photo from gallery
5. Image preview appears
6. Fill form
7. Submit

**Expected Result**:
- Same as Scenario 1

### Scenario 3: GPS Error Handling

**Steps**:
1. Disable location services on device
2. Open app
3. Observe error message

**Expected Result**:
- "GPS permission denied" message
- "Refresh" button visible
- Submit button disabled

### Scenario 4: Invalid Image

**Steps**:
1. Open app
2. Wait for GPS
3. Try to upload PDF file

**Expected Result**:
- Error message: "Invalid file type"
- No image preview
- Submit button disabled

### Scenario 5: Large File

**Steps**:
1. Open app
2. Try to upload 15MB image

**Expected Result**:
- Error: "File too large. Maximum size is 10MB."
- No upload

### Scenario 6: Offline Mode

**Steps**:
1. Open app
2. Get GPS and image
3. Turn off network
4. Try to submit

**Expected Result**:
- Error message about network
- Can retry when online

---

## 🔧 Testing Tools

### 1. Local MQTT Listener

Create `mqtt-test.js`:

```javascript
const mqtt = require('mqtt');

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

client.on('connect', () => {
  console.log('✅ Connected to MQTT broker');
  client.subscribe('aaron_nev/atak_targets', { qos: 1 }, (err) => {
    if (!err) {
      console.log('✅ Subscribed to topic: aaron_nev/atak_targets');
    }
  });
});

client.on('message', (topic, message) => {
  console.log('\n📨 MQTT Message Received:');
  console.log('Topic:', topic);
  console.log('Message:', JSON.parse(message.toString()));
});

client.on('error', (err) => {
  console.error('❌ MQTT Error:', err);
});

process.on('SIGINT', () => {
  client.end();
  process.exit();
});
```

Run:
```bash
node mqtt-test.js
```

### 2. API Test Script

Create `api-test.js`:

```javascript
import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

const testAPI = async () => {
  const form = new FormData();

  form.append('lat', '19.008600');
  form.append('lon', '73.130071');
  form.append('heading', '45');
  form.append('pitch', '0');
  form.append('roll', '0');
  form.append('distance_m', '100');

  // Create a test image file
  const testImagePath = 'test-image.jpg';
  if (!fs.existsSync(testImagePath)) {
    console.error('❌ test-image.jpg not found. Please add a test image.');
    return;
  }

  form.append('image', fs.createReadStream(testImagePath));

  try {
    console.log('📤 Sending test request...');

    const response = await fetch('http://localhost:5173/api/submit-target', {
      method: 'POST',
      body: form,
      headers: form.getHeaders(),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ Success!');
      console.log('Response:', result);
    } else {
      console.error('❌ Error:', result);
    }
  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
};

testAPI();
```

Run:
```bash
node api-test.js
```

### 3. Browser DevTools Testing

**Console Tests**:

```javascript
// Test geolocation
navigator.geolocation.getCurrentPosition(
  pos => console.log('GPS:', pos.coords),
  err => console.error('GPS Error:', err)
);

// Test camera
navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
  .then(stream => {
    console.log('Camera OK');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('Camera Error:', err));
```

### 4. Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse https://atak-mqtt.vercel.app --view

# Or use Chrome DevTools:
# 1. Open DevTools (F12)
# 2. Lighthouse tab
# 3. Generate report
```

### 5. Network Throttling

**Chrome DevTools**:
1. Open DevTools (F12)
2. Network tab
3. Throttling dropdown → "Slow 3G"
4. Test app performance

---

## 📊 Expected Results

### MQTT Message Format

```json
{
  "ts": 1771045222.178948,
  "count": 1,
  "targets": [
    {
      "lat": 19.008600,
      "lon": 73.130071,
      "src_lat": 19.008600,
      "src_lon": 73.130071,
      "heading": 90,
      "pitch": 5,
      "roll": 0,
      "distance_m": 50,
      "ts": 1771045222.178948,
      "image": "https://res.cloudinary.com/drxofvjbi/image/upload/v1234567890/atak_targets/xyz.jpg"
    }
  ]
}
```

### API Success Response

```json
{
  "success": true,
  "message": "Target submitted successfully",
  "image_url": "https://res.cloudinary.com/drxofvjbi/image/upload/...",
  "mqtt_topic": "aaron_nev/atak_targets"
}
```

### API Error Responses

**Missing GPS (400)**:
```json
{
  "error": "Missing or invalid lat/lon"
}
```

**No Image (400)**:
```json
{
  "error": "No image file provided"
}
```

**Invalid Image Type (400)**:
```json
{
  "error": "Invalid image type. Allowed: image/jpeg, image/png, ..."
}
```

**Upload Failed (500)**:
```json
{
  "error": "Image upload failed"
}
```

**MQTT Failed (500)**:
```json
{
  "error": "MQTT publish failed"
}
```

---

## 🐛 Common Issues & Solutions

### GPS Always Loading

**Cause**: No HTTPS or permission denied

**Solution**:
- Use HTTPS (automatic on Vercel)
- Check browser permission settings
- Try on different browser/device

### Camera Not Opening

**Cause**: No HTTPS or permission denied

**Solution**:
- Use HTTPS (automatic on Vercel)
- Grant camera permission
- Check browser supports MediaDevices API

### Image Upload Timeout

**Cause**: Large file or slow network

**Solution**:
- Compress image before upload
- Use smaller test image
- Check network connection

### MQTT Not Publishing

**Cause**: Broker unreachable or timeout

**Solution**:
- Check broker.hivemq.com is accessible
- Verify network allows MQTT (port 1883)
- Increase timeout in API code

### Form Not Submitting

**Cause**: Validation error or network issue

**Solution**:
- Ensure GPS and image are captured
- Check browser console for errors
- Verify API endpoint is correct

---

## 📈 Performance Benchmarks

### Expected Metrics

| Metric | Target | Good | Needs Improvement |
|--------|--------|------|-------------------|
| Initial Load | <2s | <3s | >3s |
| GPS Acquisition | <2s | <5s | >5s |
| Image Upload | <3s | <5s | >5s |
| MQTT Publish | <1s | <2s | >2s |
| Total Submission | <5s | <10s | >10s |

### Bundle Size

| Asset | Size | Gzipped |
|-------|------|---------|
| HTML | ~1KB | ~0.5KB |
| CSS | ~10KB | ~3KB |
| JS (Vendor) | ~150KB | ~50KB |
| JS (App) | ~20KB | ~7KB |
| **Total** | **~181KB** | **~60KB** |

---

## ✅ Test Report Template

Use this template to document test results:

```
# Test Report - ATAK MQTT Target System

**Date**: 2026-02-15
**Tester**: Your Name
**Environment**: Production / Local
**URL**: https://atak-mqtt.vercel.app

## Frontend Tests

| Test | Status | Notes |
|------|--------|-------|
| GPS Capture | ✅ Pass | Acquired in 2s |
| Camera Access | ✅ Pass | Rear camera works |
| Photo Upload | ✅ Pass | Gallery picker works |
| Form Validation | ✅ Pass | All validations work |
| Submit Success | ✅ Pass | Success message shows |
| Mobile Responsive | ✅ Pass | Works on iPhone 12 |

## Backend Tests

| Test | Status | Notes |
|------|--------|-------|
| API Endpoint | ✅ Pass | 200 OK |
| Cloudinary Upload | ✅ Pass | Image uploaded |
| MQTT Publish | ✅ Pass | Message received |
| Error Handling | ✅ Pass | Proper error codes |

## Integration Tests

| Test | Status | Notes |
|------|--------|-------|
| End-to-End Flow | ✅ Pass | Full flow works |
| MQTT Reception | ✅ Pass | aaronPyScript.py received |
| Database Save | ✅ Pass | Data in maritimeDB_2 |

## Performance

- **Initial Load**: 1.8s
- **GPS Acquisition**: 2.1s
- **Image Upload**: 3.5s
- **Total Time**: 7.4s

## Issues Found

1. ~~GPS slow on iOS Safari~~ - Fixed by enabling high accuracy
2. ~~Camera permission unclear~~ - Added better error message

## Recommendations

- Add loading progress bar
- Add image compression before upload
- Cache GPS location for faster retries

## Overall Result: ✅ PASS
```

---

## 🎯 Testing Schedule

### Pre-Deployment

1. **Local Development** (1 hour)
   - Run all frontend tests
   - Test API locally
   - Verify MQTT connection

2. **Cross-Browser Testing** (30 min)
   - Chrome, Firefox, Safari
   - Desktop and mobile

3. **Mobile Device Testing** (1 hour)
   - Test on iOS device
   - Test on Android device
   - Various screen sizes

### Post-Deployment

1. **Smoke Testing** (15 min)
   - Verify deployment URL works
   - Test one complete submission
   - Check logs for errors

2. **Integration Testing** (30 min)
   - Verify MQTT messages received
   - Check Cloudinary uploads
   - Confirm database saves

3. **Performance Testing** (30 min)
   - Run Lighthouse audit
   - Check load times
   - Monitor function execution

### Ongoing

- **Weekly**: Review error logs
- **Monthly**: Performance audit
- **Quarterly**: Security review

---

**Ready to test! 🧪**
