import { useState, useEffect } from 'react'

function App() {
  // State management
  const [gpsLocation, setGpsLocation] = useState(null)
  const [gpsLoading, setGpsLoading] = useState(true)
  const [gpsError, setGpsError] = useState(null)

  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageError, setImageError] = useState(null)

  const [targetData, setTargetData] = useState({
    heading: 0,
    pitch: 0,
    roll: 0,
    distance: 0
  })

  const [submitting, setSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState(null)

  const [gyroData, setGyroData] = useState(null)
  const [gyroPermission, setGyroPermission] = useState('checking') // checking, granted, denied, not-supported
  const [gyroError, setGyroError] = useState(null)

  const [mode, setMode] = useState('json') // 'json' or 'capture'
  const [rawJson, setRawJson] = useState('')
  const [jsonSubmitting, setJsonSubmitting] = useState(false)
  const [jsonStatus, setJsonStatus] = useState(null)

  // Get GPS location on mount
  useEffect(() => {
    getGPSLocation()
  }, [])

  // Initialize gyroscope on mount
  useEffect(() => {
    initializeGyroscope()

    return () => {
      // Cleanup: remove event listener
      window.removeEventListener('deviceorientation', handleOrientation)
    }
  }, [])

  const getGPSLocation = () => {
    setGpsLoading(true)
    setGpsError(null)

    if (!navigator.geolocation) {
      setGpsError('GPS not supported by your device')
      setGpsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: position.coords.accuracy
        })
        setGpsLoading(false)
      },
      (error) => {
        let errorMsg = 'Unable to get GPS location'
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'GPS permission denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'GPS position unavailable. Please try again.'
            break
          case error.TIMEOUT:
            errorMsg = 'GPS request timed out. Please try again.'
            break
        }
        setGpsError(errorMsg)
        setGpsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  // Initialize gyroscope/orientation sensors
  const initializeGyroscope = async () => {
    if (!window.DeviceOrientationEvent) {
      setGyroPermission('not-supported')
      setGyroError('Device orientation not supported on this device')
      return
    }

    // For iOS 13+ devices, need to request permission
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      setGyroPermission('checking')
    } else {
      // Android and older iOS - start listening immediately
      startGyroscope()
    }
  }

  // Request permission (iOS 13+)
  const requestGyroPermission = async () => {
    try {
      const permission = await DeviceOrientationEvent.requestPermission()
      if (permission === 'granted') {
        setGyroPermission('granted')
        startGyroscope()
      } else {
        setGyroPermission('denied')
        setGyroError('Gyroscope permission denied. Please enable in settings.')
      }
    } catch (error) {
      setGyroPermission('denied')
      setGyroError('Error requesting gyroscope permission: ' + error.message)
    }
  }

  // Start listening to orientation events
  const startGyroscope = () => {
    setGyroPermission('granted')
    setGyroError(null)
    window.addEventListener('deviceorientation', handleOrientation, true)
  }

  // Handle orientation event
  const handleOrientation = (event) => {
    const { alpha, beta, gamma } = event

    // alpha: 0-360 (compass heading)
    // beta: -180 to 180 (pitch - front/back tilt)
    // gamma: -90 to 90 (roll - left/right tilt)

    if (alpha !== null && beta !== null && gamma !== null) {
      const gyroValues = {
        heading: parseFloat(alpha.toFixed(1)),
        pitch: parseFloat(beta.toFixed(1)),
        roll: parseFloat(gamma.toFixed(1))
      }

      setGyroData(gyroValues)

      // Auto-update target data with gyroscope values
      setTargetData(prev => ({
        ...prev,
        heading: gyroValues.heading,
        pitch: gyroValues.pitch,
        roll: gyroValues.roll
      }))
    }
  }

  // Handle camera capture
  const handleCameraCapture = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/jpeg,image/png,image/webp'
    input.capture = 'environment' // Use rear camera on mobile

    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        handleImageFile(file)
      }
    }

    input.click()
  }

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      handleImageFile(file)
    }
  }

  // Process image file
  const handleImageFile = (file) => {
    setImageError(null)

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setImageError('Invalid file type. Please use JPEG, PNG, or WebP.')
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      setImageError('File too large. Maximum size is 10MB.')
      return
    }

    // Set the file and create preview
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  // Clear selected image
  const clearImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    setImageError(null)
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    setTargetData(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }))
  }

  // Validate form
  const validateForm = () => {
    if (!gpsLocation) {
      return 'GPS location not available. Please refresh location.'
    }
    if (!selectedImage) {
      return 'Please capture or upload a photo.'
    }
    return null
  }

  // Submit target
  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setSubmitStatus({ type: 'error', message: validationError })
      return
    }

    setSubmitting(true)
    setSubmitStatus(null)

    try {
      // Prepare form data
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('lat', gpsLocation.lat)
      formData.append('lon', gpsLocation.lon)
      formData.append('heading', targetData.heading)
      formData.append('pitch', targetData.pitch)
      formData.append('roll', targetData.roll)
      formData.append('distance_m', targetData.distance)

      // Submit to API
      const response = await fetch('/api/submit-target', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: '✓ Target submitted successfully!'
        })

        // Reset form after 2 seconds
        setTimeout(() => {
          clearImage()
          setTargetData({ heading: 0, pitch: 0, roll: 0, distance: 0 })
          setSubmitStatus(null)
        }, 2000)
      } else {
        throw new Error(result.error || 'Submission failed')
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: `Error: ${error.message}`
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Format JSON for display
  const formatJson = () => {
    try {
      const parsed = JSON.parse(rawJson)
      const formatted = JSON.stringify(parsed, null, 2)
      setRawJson(formatted)
      setJsonStatus({ type: 'success', message: '✓ JSON formatted' })
      setTimeout(() => setJsonStatus(null), 2000)
    } catch (error) {
      setJsonStatus({ type: 'error', message: 'Invalid JSON format' })
    }
  }

  // Submit raw JSON
  const handleJsonSubmit = async () => {
    setJsonSubmitting(true)
    setJsonStatus(null)

    try {
      // Validate JSON
      let payload
      try {
        payload = JSON.parse(rawJson)
      } catch (error) {
        throw new Error('Invalid JSON format. Please check your input.')
      }

      // Submit to API
      const response = await fetch('/api/submit-raw-json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok) {
        setJsonStatus({
          type: 'success',
          message: `✓ ${result.message || 'JSON submitted successfully!'}`
        })

        // Clear after 3 seconds
        setTimeout(() => {
          setRawJson('')
          setJsonStatus(null)
        }, 3000)
      } else {
        throw new Error(result.error || 'Submission failed')
      }
    } catch (error) {
      setJsonStatus({
        type: 'error',
        message: `Error: ${error.message}`
      })
    } finally {
      setJsonSubmitting(false)
    }
  }

  // Cloudinary image URLs for CoT generation
  const COT_IMAGES = [
    'https://res.cloudinary.com/drxofvjbi/image/upload/v1771139514/samples/animals/cat.jpg',
    'https://res.cloudinary.com/drxofvjbi/image/upload/v1771139516/samples/animals/reindeer.jpg',
    'https://res.cloudinary.com/drxofvjbi/image/upload/v1771139518/samples/landscapes/architecture-signs.jpg',
    'https://res.cloudinary.com/drxofvjbi/image/upload/v1771139519/samples/landscapes/beach-boat.jpg',
    'https://res.cloudinary.com/drxofvjbi/image/upload/v1771139526/samples/balloons.jpg',
    'https://res.cloudinary.com/drxofvjbi/video/upload/v1771139522/samples/elephants.mp4'
  ]

  // Generate realistic CoT data
  const generateCoT = () => {
    // Random coordinates around Arabian Sea / Indian Ocean region
    const baseLatitudes = [15.0, 18.5, 19.0, 20.5, 22.0, 12.5, 16.8]
    const baseLongitudes = [68.0, 70.5, 72.8, 73.1, 75.3, 77.5, 69.2]

    const randomLat = baseLatitudes[Math.floor(Math.random() * baseLatitudes.length)] + (Math.random() - 0.5) * 0.1
    const randomLon = baseLongitudes[Math.floor(Math.random() * baseLongitudes.length)] + (Math.random() - 0.5) * 0.1

    // Small offset for src coordinates (simulating device location vs target location)
    const srcLat = randomLat + (Math.random() - 0.5) * 0.001
    const srcLon = randomLon + (Math.random() - 0.5) * 0.001

    // Random number of targets (1-3)
    const targetCount = Math.floor(Math.random() * 3) + 1
    const targets = []

    for (let i = 0; i < targetCount; i++) {
      const targetLat = randomLat + (Math.random() - 0.5) * 0.05
      const targetLon = randomLon + (Math.random() - 0.5) * 0.05

      targets.push({
        lat: parseFloat(targetLat.toFixed(6)),
        lon: parseFloat(targetLon.toFixed(6)),
        src_lat: parseFloat(srcLat.toFixed(6)),
        src_lon: parseFloat(srcLon.toFixed(6)),
        heading: parseFloat((Math.random() * 360).toFixed(1)),
        pitch: parseFloat((Math.random() * 20 - 10).toFixed(3)),
        roll: parseFloat((Math.random() * 6 - 3).toFixed(3)),
        distance_m: parseFloat((Math.random() * 4990 + 10).toFixed(1)),
        ts: (Date.now() / 1000) - Math.random() * 300, // Random time within last 5 minutes
        image: COT_IMAGES[Math.floor(Math.random() * COT_IMAGES.length)]
      })
    }

    const cotData = {
      ts: Date.now() / 1000,
      count: targetCount,
      targets: targets
    }

    setRawJson(JSON.stringify(cotData, null, 2))
    setJsonStatus({ type: 'success', message: `✓ Generated ${targetCount} target(s)` })
    setTimeout(() => setJsonStatus(null), 2000)
  }

  // Copy JSON to clipboard
  const copyToClipboard = async () => {
    if (!rawJson) return

    try {
      await navigator.clipboard.writeText(rawJson)
      setJsonStatus({ type: 'success', message: '✓ Copied to clipboard!' })
      setTimeout(() => setJsonStatus(null), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = rawJson
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setJsonStatus({ type: 'success', message: '✓ Copied to clipboard!' })
      } catch (err) {
        setJsonStatus({ type: 'error', message: 'Failed to copy' })
      }
      document.body.removeChild(textArea)
      setTimeout(() => setJsonStatus(null), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 pb-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 pt-4">
          <h1 className="text-3xl font-bold text-sky-400 mb-2">
            ATAK MQTT Target System
          </h1>
          <p className="text-slate-400 text-sm">
            Capture target data and transmit via MQTT
          </p>
        </div>

        {/* Mode Selection - Two Options */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* JSON Mode (Default - Left) */}
          <button
            onClick={() => setMode('json')}
            className={`py-4 px-4 rounded-lg font-bold text-lg transition-all ${
              mode === 'json'
                ? 'bg-orange-600 text-white shadow-lg scale-105'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">📋</span>
              <span className="text-sm">Paste JSON</span>
            </div>
          </button>

          {/* Capture Mode (Right) */}
          <button
            onClick={() => setMode('capture')}
            className={`py-4 px-4 rounded-lg font-bold text-lg transition-all ${
              mode === 'capture'
                ? 'bg-green-600 text-white shadow-lg scale-105'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">📸</span>
              <span className="text-sm">Take Photo</span>
            </div>
          </button>
        </div>

        {/* ===== JSON PASTE MODE ===== */}
        {mode === 'json' && (
          <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">
              📋 Paste CoT Response JSON
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Paste your complete MQTT JSON payload below and send directly to the broker.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <button
                onClick={generateCoT}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded text-sm font-bold transition-colors shadow-md"
              >
                🎲 Generate CoT
              </button>
              <button
                onClick={copyToClipboard}
                disabled={!rawJson}
                className="px-4 py-2 bg-green-700 hover:bg-green-600 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📋 Copy
              </button>
              <button
                onClick={formatJson}
                disabled={!rawJson}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✨ Format
              </button>
              <button
                onClick={() => setRawJson('')}
                disabled={!rawJson}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🗑️ Clear
              </button>
            </div>

            {/* JSON Textarea */}
            <div className="relative">
              <textarea
                value={rawJson}
                onChange={(e) => setRawJson(e.target.value)}
                placeholder={`Paste your JSON here, for example:\n{\n  "ts": 1771045222.178,\n  "count": 1,\n  "targets": [\n    {\n      "lat": 19.0086,\n      "lon": 73.1301,\n      "heading": 359.5,\n      "pitch": -3.875,\n      "roll": 2.125,\n      "distance_m": 4.1,\n      "image": "https://..."\n    }\n  ]\n}`}
                className="w-full h-96 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-orange-500 resize-none"
                spellCheck="false"
              />
              {rawJson && (
                <div className="absolute top-2 right-2 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
                  {rawJson.length} chars
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleJsonSubmit}
              disabled={jsonSubmitting || !rawJson}
              className="w-full mt-4 py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-bold text-white text-lg transition-colors shadow-lg active:bg-orange-700"
            >
              {jsonSubmitting ? '⏳ Sending...' : '🚀 Send JSON to MQTT'}
            </button>

            {/* Status Message */}
            {jsonStatus && (
              <div
                className={`mt-4 p-4 rounded-lg text-center font-semibold ${
                  jsonStatus.type === 'success'
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-red-900/50 text-red-300 border border-red-700'
                }`}
              >
                {jsonStatus.message}
              </div>
            )}

            {/* Help Text */}
            <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
              <p className="text-slate-400 text-xs mb-2">
                <strong className="text-slate-300">Required fields per target:</strong>
              </p>
              <ul className="text-slate-400 text-xs space-y-1 ml-4">
                <li>• <code className="text-sky-400">lat</code> - Latitude (number)</li>
                <li>• <code className="text-sky-400">lon</code> - Longitude (number)</li>
                <li>• <code className="text-sky-400">heading</code> - Heading in degrees (0-360)</li>
                <li>• <code className="text-sky-400">pitch</code> - Pitch in degrees (-180 to 180)</li>
                <li>• <code className="text-sky-400">roll</code> - Roll in degrees (-90 to 90)</li>
                <li>• <code className="text-sky-400">distance_m</code> - Distance in meters</li>
              </ul>
              <p className="text-slate-400 text-xs mt-2">
                <strong className="text-slate-300">Optional:</strong> <code className="text-slate-500">image</code>, <code className="text-slate-500">ts</code>, <code className="text-slate-500">src_lat</code>, <code className="text-slate-500">src_lon</code>
              </p>
            </div>
          </div>
        )}

        {/* ===== CAPTURE MODE ===== */}
        {mode === 'capture' && (
          <>
            {/* GPS Status */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-200">
              📍 GPS Location
            </h2>
            <button
              onClick={getGPSLocation}
              disabled={gpsLoading}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm disabled:opacity-50"
            >
              {gpsLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {gpsLoading && (
            <p className="text-slate-400 text-sm">Acquiring GPS location...</p>
          )}

          {gpsError && (
            <p className="text-red-400 text-sm">{gpsError}</p>
          )}

          {gpsLocation && (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-slate-400">Latitude:</span>
                <span className="text-slate-200 ml-2 font-mono">
                  {gpsLocation.lat.toFixed(6)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Longitude:</span>
                <span className="text-slate-200 ml-2 font-mono">
                  {gpsLocation.lon.toFixed(6)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400">Accuracy:</span>
                <span className="text-slate-200 ml-2">
                  ±{gpsLocation.accuracy.toFixed(1)}m
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Gyroscope Status */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-slate-200">
              🧭 Gyroscope / Orientation
            </h2>
            {gyroPermission === 'checking' && (
              <button
                onClick={requestGyroPermission}
                className="px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded text-sm font-semibold"
              >
                Enable
              </button>
            )}
            {gyroData && (
              <span className="text-green-400 text-sm">● Live</span>
            )}
          </div>

          {gyroPermission === 'not-supported' && (
            <p className="text-yellow-400 text-sm">{gyroError}</p>
          )}

          {gyroPermission === 'denied' && (
            <p className="text-red-400 text-sm">{gyroError}</p>
          )}

          {gyroPermission === 'checking' && (
            <p className="text-slate-400 text-sm">
              Tap <strong>Enable</strong> to allow gyroscope access
            </p>
          )}

          {gyroPermission === 'granted' && !gyroData && (
            <p className="text-slate-400 text-sm">Waiting for sensor data...</p>
          )}

          {gyroData && (
            <div className="grid grid-cols-1 gap-3 text-sm">
              {/* Heading */}
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Heading (α)</span>
                  <span className="text-2xl font-bold text-sky-400 font-mono">
                    {gyroData.heading}°
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Compass direction (0-360°)</div>
              </div>

              {/* Pitch */}
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Pitch (β)</span>
                  <span className="text-2xl font-bold text-green-400 font-mono">
                    {gyroData.pitch}°
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Front/back tilt (-180 to 180°)</div>
              </div>

              {/* Roll */}
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Roll (γ)</span>
                  <span className="text-2xl font-bold text-purple-400 font-mono">
                    {gyroData.roll}°
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">Left/right tilt (-90 to 90°)</div>
              </div>
            </div>
          )}
        </div>

        {/* Image Capture */}
        <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            📷 Target Image
          </h2>

          {!imagePreview ? (
            <div className="space-y-3">
              <button
                onClick={handleCameraCapture}
                className="w-full py-4 bg-sky-600 hover:bg-sky-500 rounded-lg font-semibold text-white transition-colors active:bg-sky-700"
              >
                📸 Open Camera
              </button>

              <div className="relative">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="block w-full py-4 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold text-white text-center cursor-pointer transition-colors"
                >
                  🖼️ Upload Photo
                </label>
              </div>

              {imageError && (
                <p className="text-red-400 text-sm text-center">{imageError}</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Target preview"
                className="w-full rounded-lg border-2 border-slate-600"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 w-10 h-10 bg-red-600 hover:bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
              >
                ×
              </button>
              <p className="text-slate-400 text-sm mt-2 text-center">
                {selectedImage.name} ({(selectedImage.size / 1024).toFixed(0)} KB)
              </p>
            </div>
          )}
        </div>

        {/* Target Data Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            🎯 Target Data
          </h2>

          {gyroData && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
              <p className="text-green-400 text-sm text-center">
                ✓ Gyroscope active - Heading, Pitch, Roll auto-updating
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Heading (degrees) {gyroData && <span className="text-sky-400">● Auto</span>}
              </label>
              <input
                type="number"
                min="0"
                max="360"
                step="0.1"
                value={targetData.heading}
                onChange={(e) => handleInputChange('heading', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:border-sky-500 font-mono"
                readOnly={gyroData !== null}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Pitch (degrees) {gyroData && <span className="text-green-400">● Auto</span>}
              </label>
              <input
                type="number"
                min="-90"
                max="90"
                step="0.1"
                value={targetData.pitch}
                onChange={(e) => handleInputChange('pitch', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:border-sky-500 font-mono"
                readOnly={gyroData !== null}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Roll (degrees) {gyroData && <span className="text-purple-400">● Auto</span>}
              </label>
              <input
                type="number"
                min="-180"
                max="180"
                step="0.1"
                value={targetData.roll}
                onChange={(e) => handleInputChange('roll', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:border-sky-500 font-mono"
                readOnly={gyroData !== null}
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">
                Distance (meters)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={targetData.distance}
                onChange={(e) => handleInputChange('distance', e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-lg focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !gpsLocation || !selectedImage}
            className="w-full mt-6 py-4 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-lg font-bold text-white text-lg transition-colors shadow-lg active:bg-green-700"
          >
            {submitting ? '⏳ Uploading...' : '🚀 Send Target'}
          </button>

          {/* Status Message */}
          {submitStatus && (
            <div
              className={`mt-4 p-4 rounded-lg text-center font-semibold ${
                submitStatus.type === 'success'
                  ? 'bg-green-900/50 text-green-300 border border-green-700'
                  : 'bg-red-900/50 text-red-300 border border-red-700'
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </form>
          </>
        )}

        {/* Info Footer */}
        <div className="text-center text-slate-500 text-xs">
          <p>MQTT Broker: broker.hivemq.com</p>
          <p>Topic: aaron_nev/atak_targets</p>
        </div>
      </div>
    </div>
  )
}

export default App
