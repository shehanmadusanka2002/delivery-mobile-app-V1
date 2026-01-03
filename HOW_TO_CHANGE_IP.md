# API Configuration Guide / API සැකසුම් මාර්ගෝපදේශය

## How to Change IP Address / IP Address එක වෙනස් කරන ආකාරය

### Web Dashboard (React)

**File:** `delivery-frontend/src/config/api.config.js`

```javascript
// ⚠️ Change only this line when your IP changes / IP එක වෙනස් වුනාම මේ line එක විතරක් වෙනස් කරන්න
const SERVER_IP = '192.168.8.100';  // <-- Change this / මෙන්න මේකෙන් වෙනස් කරන්න
```

### Mobile App (React Native)

**File:** `delivery-mobile/config/api.config.js`

```javascript
// ⚠️ Change only this line when your IP changes / IP එක වෙනස් වුනාම මේ line එක විතරක් වෙනස් කරන්න
const SERVER_IP = '192.168.8.101';  // <-- Change this / මෙන්න මේකෙන් වෙනස් කරන්න
```

---

## How to Find Your IP Address / IP Address එක හොයාගන්නේ කොහොමද

### On Windows:

1. Open PowerShell or Command Prompt
2. Type: `ipconfig`
3. Look for "IPv4 Address" under your active network adapter
4. Example: `192.168.8.100`

### Sinhala:
1. PowerShell හෝ Command Prompt එක open කරන්න
2. Type කරන්න: `ipconfig`
3. "IPv4 Address" එක බලන්න (active network adapter එක යටතේ)
4. Example: `192.168.8.100`

---

## After Changing IP / IP එක වෙනස් කරපු පසුව

### For Web Dashboard:
```bash
# Restart the development server
npm start
```

### For Mobile App:
```bash
# Restart Expo
npx expo start -c
```

### For Backend (if needed):
```bash
# Backend IP doesn't need to change, but if needed to restart:
./mvnw spring-boot:run
```

---

## Important Notes / වැදගත් සටහන්

✅ **ONE PLACE TO CHANGE** - You only need to change the IP in the config file (api.config.js)
   - එක තැනක විතරයි වෙනස් කරන්න ඕන (api.config.js file එක)

✅ **ALL API CALLS UPDATE AUTOMATICALLY** - All axios calls use the centralized config
   - ඔක්කොම API calls automatic එකේ update වෙනවා

✅ **WEBSOCKET ALSO UPDATES** - WebSocket URLs also use the same config
   - WebSocket URLs වත් same config එක use කරනවා

❌ **DON'T CHANGE** - Don't change individual API calls in component files
   - Component files වල තනි තනිව API calls වෙනස් කරන්න එපා

---

## Current Configuration / දැනට තියෙන Configuration

- **Web Dashboard:** `192.168.8.100:8080`
- **Mobile App:** `192.168.8.101:8080`
- **Backend Server:** Running on port `8080`

---

## Example / උදාහරණය

If your new IP is `192.168.1.50`:
- Open `delivery-frontend/src/config/api.config.js`
- Change line 2: `const SERVER_IP = '192.168.1.50';`
- Restart the web app

ඔයාගේ නව IP එක `192.168.1.50` නම්:
- `delivery-frontend/src/config/api.config.js` open කරන්න
- Line 2 වෙනස් කරන්න: `const SERVER_IP = '192.168.1.50';`
- Web app එක restart කරන්න

---

## Need Help? / උදව්වක් ඕනද?

If you have any issues:
1. Check if backend is running on port 8080
2. Verify IP address with `ipconfig`
3. Make sure firewall allows connections
4. Restart both frontend and backend

ප්‍රශ්න තියෙනවනම්:
1. Backend එක port 8080 එකේ run වෙනවද කියලා check කරන්න
2. `ipconfig` command එකෙන් IP එක verify කරන්න
3. Firewall එක connections වලට allow කරනවද බලන්න
4. Frontend සහ backend දෙකම restart කරන්න
