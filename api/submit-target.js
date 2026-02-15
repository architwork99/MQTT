import formidable from 'formidable';
import cloudinary from 'cloudinary';
import mqtt from 'mqtt';

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MQTT Configuration
const MQTT_BROKER = 'mqtt://broker.hivemq.com:1883';
const MQTT_TOPIC = 'aaron_nev/atak_targets';
const MQTT_TIMEOUT = 10000; // 10 seconds

/**
 * Parse multipart form data
 */
const parseForm = (req) => {
  return new Promise((resolve, reject) => {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

/**
 * Upload image to Cloudinary
 */
const uploadToCloudinary = (filePath) => {
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      filePath,
      {
        folder: 'atak_targets',
        resource_type: 'image',
        format: 'jpg',
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: 'limit',
            quality: 'auto:good',
          },
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
};

/**
 * Publish message to MQTT broker
 */
const publishToMQTT = (message) => {
  return new Promise((resolve, reject) => {
    const client = mqtt.connect(MQTT_BROKER);

    const timeout = setTimeout(() => {
      client.end(true);
      reject(new Error('MQTT publish timeout'));
    }, MQTT_TIMEOUT);

    client.on('connect', () => {
      client.publish(
        MQTT_TOPIC,
        JSON.stringify(message),
        { qos: 1 },
        (err) => {
          clearTimeout(timeout);
          client.end();

          if (err) reject(err);
          else resolve();
        }
      );
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      client.end(true);
      reject(err);
    });
  });
};

/**
 * Main serverless function handler
 */
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[ATAK API] Processing target submission...');

    // Parse form data
    const { fields, files } = await parseForm(req);

    // Extract fields (formidable returns arrays for each field)
    const lat = parseFloat(fields.lat?.[0] || fields.lat);
    const lon = parseFloat(fields.lon?.[0] || fields.lon);
    const heading = parseFloat(fields.heading?.[0] || fields.heading);
    const pitch = parseFloat(fields.pitch?.[0] || fields.pitch);
    const roll = parseFloat(fields.roll?.[0] || fields.roll);
    const distance_m = parseFloat(fields.distance_m?.[0] || fields.distance_m);

    // Validate required fields
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: 'Missing or invalid lat/lon' });
    }

    // Get image file
    const imageFile = files.image?.[0] || files.image;
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({
        error: `Invalid image type. Allowed: ${allowedTypes.join(', ')}`,
      });
    }

    console.log('[ATAK API] Uploading image to Cloudinary...');

    // Upload image to Cloudinary
    let imageUrl;
    try {
      imageUrl = await uploadToCloudinary(imageFile.filepath);
      console.log('[ATAK API] Image uploaded:', imageUrl);
    } catch (err) {
      console.error('[ATAK API] Cloudinary upload failed:', err);
      return res.status(500).json({ error: 'Image upload failed' });
    }

    // Construct MQTT message (exact format required)
    const currentTimestamp = Date.now() / 1000; // Unix timestamp with decimals

    const mqttMessage = {
      ts: currentTimestamp,
      count: 1,
      targets: [
        {
          lat: parseFloat(lat.toFixed(6)),
          lon: parseFloat(lon.toFixed(6)),
          src_lat: parseFloat(lat.toFixed(6)),
          src_lon: parseFloat(lon.toFixed(6)),
          heading: heading || 0,
          pitch: pitch || 0,
          roll: roll || 0,
          distance_m: distance_m || 0,
          ts: currentTimestamp,
          image: imageUrl, // Field name is "image" not "image_url"
        },
      ],
    };

    console.log('[ATAK API] Publishing to MQTT...');
    console.log('[ATAK API] Message:', JSON.stringify(mqttMessage, null, 2));

    // Publish to MQTT
    try {
      await publishToMQTT(mqttMessage);
      console.log('[ATAK API] MQTT publish successful');
    } catch (err) {
      console.error('[ATAK API] MQTT publish failed:', err);
      return res.status(500).json({ error: 'MQTT publish failed' });
    }

    // Success response
    return res.status(200).json({
      success: true,
      message: 'Target submitted successfully',
      image_url: imageUrl,
      mqtt_topic: MQTT_TOPIC,
    });
  } catch (error) {
    console.error('[ATAK API] Error:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error',
    });
  }
}
