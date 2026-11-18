const busboy = require('busboy');

exports.uploadRelay = async (req, res) => {
  // 1. Setup CORS so your Shopify frontend can talk to this function
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, x-access-code');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // 2. Configuration
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8cpTlNMo4EeDgs_0tqQYPhCm8VcIJVVmHQdkk3UDDFUAvragpLLtUEuE1WaY_DuOQZg/exec"; // The /exec URL
  const SECRET_KEY = "dsfsafs";
  const accessCode = req.headers['x-access-code']; // Code passed from frontend

  if (!accessCode) {
    return res.status(400).json({ error: "Missing x-access-code header" });
  }

  const MAX_SIZE = 25 * 1024 * 1024; // 25MB in bytes
  const bb = busboy({
    headers: req.headers,
    limits: {
      fileSize: MAX_SIZE, // Hard limit per file
      files: 10          // Optional: limit total number of files per request
    }
   });  
  const uploadPromises = [];

  // 3. Process the file stream
  bb.on('file', (name, file, info) => {
    const { filename, mimeType } = info;
    const chunks = [];

    file.on('data', (data) => {
      chunks.push(data);
    });

    // This event triggers if the file exceeds the fileSize limit
    file.on('limit', () => {
      res.status(413).json({ 
        error: `File "${filename}" is too large. Limit is 25MB.` 
    });
    // Optional: Destroy the stream to save bandwidth
      file.resume(); 
    });

    file.on('end', () => {
      // Convert chunks to a single Buffer (Binary Data)
      const fileBuffer = Buffer.concat(chunks);

      // Construct the URL with all metadata for Apps Script
      const targetUrl = new URL(APPS_SCRIPT_URL);
      targetUrl.searchParams.append('auth', SECRET_KEY);
      targetUrl.searchParams.append('code', accessCode);
      targetUrl.searchParams.append('filename', filename);
      targetUrl.searchParams.append('mimetype', mimeType);

      // 4. Relay to Apps Script
      // We return the fetch promise to track all uploads
      const uploadPromise = fetch(targetUrl.toString(), {
        method: 'POST',
        body: fileBuffer, // Pass raw bytes directly
        redirect: 'follow' // Crucial: Apps Script always redirects
      })
      .then(async (response) => {
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          return { success: false, error: "Invalid JSON from Script", raw: text };
        }
      });

      uploadPromises.push(uploadPromise);
    });
  });

  bb.on('finish', async () => {
    try {
      const settledResults = await Promise.allSettled(uploadPromises);

      // 1. If ANY promise was rejected (Network/DNS/Crashes), return 500 immediately.
      if (settledResults.some(r => r.status === 'rejected')) {
        return res.status(500).json({ error: "500: Server or Network Rejection." });
      }

      // 2. Extract errors from fulfilled response objects (where data.error is not null)
      const errorMessages = settledResults
        .map(r => r.value.data && r.value.data.error)
        .filter(Boolean); // Filters out null, undefined, or empty strings

      if (errorMessages.length > 0) {
        const errorText = errorMessages.join(" ");
        
        // If "403" is present anywhere in the error text, return 403
        if (errorText.includes("403")) {
          return res.status(403).json({ error: errorText });
        }
        
        // Otherwise, any other error triggers a 500
        return res.status(500).json({ error: errorText });
      }

      // 3. If no rejections and no error properties exist, return 200
      res.status(200).json({ message: "Uploads processed successfully." });

    } catch (err) {
      // Top-level catch for unexpected logic failures in the Cloud Function
      res.status(500).json({ error: "Cloud Function Error: " + err.message });
    }
  });



  // Start the busboy process using the raw request body
  bb.end(req.rawBody);
};
