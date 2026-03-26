# Port 3001 Guide

## Start a Server on Port 3001

Use the appropriate command for your project:

- **Node.js / npm**: `npm run dev -- --port 3001` or `PORT=3001 npm start`
- **Vite**: `vite --port 3001`
- **Next.js**: `next dev -p 3001`
- **Python**: `python -m http.server 3001`

## Allow Port 3001 Through macOS Firewall

macOS doesn't block outbound connections by default. To allow inbound connections:

1. Go to **System Settings** > **Network** > **Firewall**
2. Click **Options** and add your app to the allowed list

Or use `pfctl` via terminal if you have custom firewall rules.

## Check if Port 3001 is Already in Use

```bash
lsof -i :3001
```

## Kill a Process Using Port 3001

```bash
kill -9 $(lsof -t -i:3001)
```
