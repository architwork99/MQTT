import mqtt from 'mqtt';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonPayload = req.body;

    // Validate that we have a payload
    if (!jsonPayload) {
      return res.status(400).json({ error: 'No JSON payload provided' });
    }

    // Validate required structure (should have targets array)
    if (!jsonPayload.targets || !Array.isArray(jsonPayload.targets)) {
      return res.status(400).json({
        error: 'Invalid JSON structure. Must include "targets" array.'
      });
    }

    // Validate each target has required fields
    for (let i = 0; i < jsonPayload.targets.length; i++) {
      const target = jsonPayload.targets[i];
      const requiredFields = ['lat', 'lon', 'heading', 'pitch', 'roll', 'distance_m'];

      for (const field of requiredFields) {
        if (target[field] === undefined || target[field] === null) {
          return res.status(400).json({
            error: `Target ${i} missing required field: ${field}`
          });
        }
      }
    }

    // Add timestamp if not provided
    if (!jsonPayload.ts) {
      jsonPayload.ts = Date.now() / 1000;
    }

    // Add count if not provided
    if (!jsonPayload.count) {
      jsonPayload.count = jsonPayload.targets.length;
    }

    // Add timestamp to each target if not provided
    jsonPayload.targets = jsonPayload.targets.map(target => {
      if (!target.ts) {
        target.ts = Date.now() / 1000;
      }
      // Ensure src_lat and src_lon are set
      if (!target.src_lat) target.src_lat = target.lat;
      if (!target.src_lon) target.src_lon = target.lon;
      return target;
    });

    // Publish to MQTT
    const mqttClient = mqtt.connect('mqtt://broker.hivemq.com:1883', {
      clientId: `atak_raw_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      connectTimeout: 10000,
    });

    return new Promise((resolve) => {
      mqttClient.on('connect', () => {
        const topic = 'aaron_nev/atak_targets';
        const message = JSON.stringify(jsonPayload);

        mqttClient.publish(topic, message, { qos: 1 }, (error) => {
          mqttClient.end();

          if (error) {
            console.error('[MQTT] Publish error:', error);
            res.status(500).json({
              error: 'Failed to publish to MQTT',
              details: error.message
            });
          } else {
            console.log('[MQTT] Published raw JSON:', {
              topic,
              count: jsonPayload.count,
              targets: jsonPayload.targets.length,
            });
            res.status(200).json({
              success: true,
              message: `Published ${jsonPayload.targets.length} target(s) to MQTT`,
              topic,
              count: jsonPayload.count,
            });
          }
          resolve();
        });
      });

      mqttClient.on('error', (error) => {
        console.error('[MQTT] Connection error:', error);
        mqttClient.end();
        res.status(500).json({
          error: 'Failed to connect to MQTT broker',
          details: error.message
        });
        resolve();
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        if (mqttClient.connected) {
          mqttClient.end();
        }
        res.status(504).json({ error: 'MQTT connection timeout' });
        resolve();
      }, 10000);
    });
  } catch (error) {
    console.error('[API] Error processing request:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message
    });
  }
}
