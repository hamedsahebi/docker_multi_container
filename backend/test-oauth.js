require('dotenv').config();

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

console.log('=== OAuth Client Verification ===\n');
console.log('Client ID:', clientId);
console.log('Client ID Format:', clientId?.endsWith('.apps.googleusercontent.com') ? '✅ Valid' : '❌ Invalid');
console.log('Client Secret:', clientSecret);
console.log('Client Secret Format:', clientSecret?.startsWith('GOCSPX-') ? '✅ Valid' : '❌ Invalid');

console.log('\n=== Manual Test URL ===');
const testUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=profile email`;
console.log('Open this URL in your browser to test:\n');
console.log(testUrl);
console.log('\n=== Expected Behavior ===');
console.log('✅ Google login page appears → Client is valid');
console.log('❌ "OAuth client not found" → Client ID is wrong or deleted');
console.log('❌ "redirect_uri_mismatch" → Redirect URI not configured in Google Console');
