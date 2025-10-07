# 🚀 การ Deploy Dashboard ขึ้น Production

## ขั้นตอนการ Deploy

### 1. เตรียม GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/line-dashboard.git
git push -u origin main
```

### 2. Deploy Backend (Server)
1. ไปที่ [Vercel](https://vercel.com)
2. เชื่อม GitHub account
3. กด "New Project" 
4. เลือก repository นี้
5. เลือก "Other" framework
6. ตั้งค่า:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Output Directory**: (ปล่อยว่าง)
   - **Install Command**: `npm install`

7. **Environment Variables** (สำคัญมาก!):
   ```
   LINE_CHANNEL_SECRET=2fe58222e2814ba3eac13eecd06faacc
   LINE_CHANNEL_ACCESS_TOKEN=JtEcA0bWDhkEiRFLr1JY6bjKSLpIzf8CGl47P46OVmcJS9nF87U3xueId+3vgY3TKc3wCD9o4jOHV9dkaaSyrJLov+Fb9v3VJmj9y+VmUrEjOkDubRLOZKQ9+xHeuXMtt4LqKHy75p2amNi+Z93VFAdB04t89/1O/w1cDnyilFU
   GEMINI_API_KEY=AIzaSyA_Uhl9xfJxOu9BGPkFeiQH4t0ghbj8Tbc
   NODE_ENV=production
   ```

8. Deploy แล้วจะได้ URL เช่น: `https://your-backend.vercel.app`

### 3. Deploy Frontend (Dashboard)
1. สร้าง project ใหม่ใน Vercel อีกครั้ง
2. เลือก repository เดียวกัน
3. เลือก "Vite" framework
4. ตั้งค่า:
   - **Root Directory**: (ปล่อยว่าง - ใช้ root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Environment Variables**:
   ```
   VITE_SOCKET_URL=https://your-backend.vercel.app
   ```
   (ใส่ URL ของ backend ที่ได้จากข้อ 2.8)

6. Deploy แล้วจะได้ URL เช่น: `https://your-dashboard.vercel.app`

### 4. อัปเดต LINE Webhook URL
1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel ของคุณ
3. ไปที่ **Messaging API**
4. ใน **Webhook URL** ใส่:
   ```
   https://your-backend.vercel.app/api/webhook
   ```
5. กด **Verify** และ **Save**

### 5. ทดสอบระบบ
1. เปิด `https://your-dashboard.vercel.app`
2. ส่งข้อความใน LINE OA ของคุณ
3. ข้อความควรจะปรากฏบน Dashboard ทันที!

## 🎯 สรุป URLs ที่สำคัญ
- **Dashboard**: `https://your-dashboard.vercel.app`
- **Backend API**: `https://your-backend.vercel.app`
- **LINE Webhook**: `https://your-backend.vercel.app/api/webhook`

## 🔧 Troubleshooting
- ถ้า Socket.IO ไม่เชื่อมต่อ: ตรวจสอบ `VITE_SOCKET_URL` ใน frontend
- ถ้า LINE webhook ไม่ทำงาน: ตรวจสอบ Environment Variables ใน backend
- ถ้ามี CORS error: ตรวจสอบ `origin: "*"` ใน `server/index.js`