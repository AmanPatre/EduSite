const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

console.log('--- DEBUG ENV START ---');
console.log('Looking for .env at:', envPath);

try {
    if (!fs.existsSync(envPath)) {
        console.error('ERROR: .env file NOT FOUND at ' + envPath);
    } else {
        console.log('SUCCESS: .env file found.');
        const content = fs.readFileSync(envPath, 'utf8');
        console.log('File Content Length:', content.length);

        // Check for GITHUB_TOKEN raw presence
        if (content.includes('GITHUB_TOKEN')) {
            console.log('PASSED: "GITHUB_TOKEN" string found in file content.');

            // Parse line by line to check for syntax issues
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.trim().startsWith('GITHUB_TOKEN')) {
                    console.log(`Found on Line ${index + 1}: [${line.trim()}]`);

                    const parts = line.split('=');
                    if (parts.length < 2) {
                        console.log('WARNING: Line seems to miss "=" sign.');
                    } else {
                        const key = parts[0].trim();
                        const val = parts.slice(1).join('=').trim();
                        console.log(`  Key: "${key}"`);
                        console.log(`  Val: "${val}"`);
                        if (key !== 'GITHUB_TOKEN') console.log('  WARNING: Key has unexpected characters/spacing.');
                    }
                }
            });
        } else {
            console.error('FAILED: "GITHUB_TOKEN" string NOT found in file content.');
        }
    }
} catch (err) {
    console.error('Filesystem Error:', err);
}
console.log('--- DEBUG ENV END ---');
