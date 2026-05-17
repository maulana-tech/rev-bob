# Quick Fix - Dev Server Issue

## ✅ Status

Frontend sudah jalan, tapi **masih menggunakan Next.js old backup** bukan Vite CDE-APP!

## 🔍 Diagnosis

1. **Frontend**: Jalan di port 3000 (Next.js dari backup)
2. **Backend**: Belum jalan (port 3001 kosong)
3. **CDE-APP Client**: Ada di `/packages/web/` tapi belum digunakan

## 🛠️ Fix Steps

### 1. Verifikasi Package Web

```bash
# Check package structure
ls -la /Users/em/web/rev-bob/packages/web/

# Should have:
# - index.html (Vite)
# - vite.config.ts
# - src/ folder
```

### 2. Start Backend Manual

```bash
cd /Users/em/web/rev-bob/backend
pnpm install
pnpm dev
```

### 3. Start Frontend Manual

```bash
cd /Users/em/web/rev-bob/packages/web
pnpm install
pnpm dev
```

### 4. Or Use Individual Commands

```bash
# From root
pnpm web:dev      # Frontend only
pnpm backend:dev  # Backend only
```

## 🎯 Expected Result

- **Frontend**: Vite server at http://localhost:3000 (CDE-APP interface)
- **Backend**: Express server at http://localhost:3001 (TypeScript)

## 📝 Current Issue

`pnpm dev` command tries to use `concurrently` but something is not working correctly. Need to investigate why backend didn't start.

## ✅ Solution

Try manual start for now:

```bash
# Terminal 1: Backend
cd backend && pnpm dev

# Terminal 2: Frontend  
cd packages/web && pnpm dev
```

Or fix the concurrent command by ensuring both packages have proper start scripts.
