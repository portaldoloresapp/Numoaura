const fs = require('fs');
const path = require('path');
const https = require('https');

// Manually read .env file
const envPath = path.resolve(__dirname, '.env');
let apiKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/EXPO_PUBLIC_OPENROUTER_API_KEY=(.*)/);
    if (match && match[1]) {
        apiKey = match[1].trim();
    }
} catch (e) {
    console.error("Error reading .env file:", e.message);
    process.exit(1);
}

console.log("--- API Key Diagnostics ---");
console.log("Key Length:", apiKey ? apiKey.length : "undefined");
console.log("Key Start:", apiKey ? apiKey.substring(0, 10) + "..." : "undefined");

if (!apiKey) {
    console.error("API Key not found in .env");
    process.exit(1);
}

const data = JSON.stringify({
    model: 'qwen/qwen-2.5-72b-instruct',
    messages: [{ role: 'user', content: 'Hello, are you working?' }]
});

const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'HTTP-Referer': 'https://numoapp.com'
    }
};

console.log("\n--- Sending Request to OpenRouter ---");
const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let responseBody = '';
    res.on('data', (chunk) => {
        responseBody += chunk;
    });

    res.on('end', () => {
        console.log("Response Body:");
        console.log(responseBody);

        try {
            const json = JSON.parse(responseBody);
            if (json.error) {
                console.error("\nAPI Error Detected:", json.error.message);
            } else {
                console.log("\nSuccess! API Key is valid.");
            }
        } catch (e) {
            console.log("Could not parse JSON response.");
        }
    });
});

req.on('error', (error) => {
    console.error("Request Error:", error);
});

req.write(data);
req.end();
