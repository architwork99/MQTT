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
