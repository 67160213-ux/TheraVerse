# 🚀 Gamified Therapeutics Project (Full-stack Monorepo)

ยินดีต้อนรับสู่โปรเจกต์ **Gamified Therapeutics** ซึ่งเป็นระบบแอปพลิเคชันเพื่อการบำบัดแบบกามิฟิเคชัน (Gamified Digital Therapeutics Platform) โครงสร้างโปรเจกต์นี้ถูกจัดให้อยู่ในรูปแบบ **Full-stack Monorepo** ที่รวมทั้งบริการ **Backend API** และ **Frontend Web App** ไว้ใน Repository เดียวกัน

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
prroject_webapp/
├── therapeutics-api/           # [Backend Service] Node.js, Express, Prisma, TypeScript
└── gamified-therapeutics/      # [Frontend App] React, Vite, Tailwind CSS, TypeScript
```

---

## 📋 สิ่งที่ต้องเตรียมก่อนเริ่มต้น (Prerequisites)

ก่อนเริ่มรันโปรเจกต์ โปรดตรวจสอบว่าเครื่องคอมพิวเตอร์ของคุณติดตั้งซอฟต์แวร์ต่อไปนี้เรียบร้อยแล้ว:

1. **Node.js**: เวอร์ชัน 18.0.0 ขึ้นไป ([ดาวน์โหลด Node.js](https://nodejs.org/))
2. **Git**: สำหรับใช้จัดการ Source Code ([ดาวน์โหลด Git](https://git-scm.com/))
3. **npm**: (จะถูกติดตั้งมาพร้อมกับ Node.js)

---

## 🛠️ ขั้นตอนการติดตั้ง (Installation)

### 1. ดึงโปรเจกต์ลงเครื่อง (Clone Repository)
```bash
git clone <URL_ของ_Repository_คุณ>
cd prroject_webapp
```

### 2. ติดตั้ง Dependencies ของทุกโปรเจกต์
รันคำสั่งนี้ที่โฟลเดอร์นอกสุด (`prroject_webapp`) ระบบจะทำการติดตั้ง Packages ทั้งหมดให้ทั้งโฟลเดอร์ Root, **Backend** (`therapeutics-api`) และ **Frontend** (`gamified-therapeutics`) โดยอัตโนมัติ:

```bash
npm run install:all
```

---

## ⚙️ การตั้งค่า Environment Variables

คัดลอกไฟล์ตั้งค่าตัวอย่าง `.env.example` ให้เป็น `.env` ในโฟลเดอร์ Backend:

**บน Windows (PowerShell):**
```powershell
cp therapeutics-api/.env.example therapeutics-api/.env
```

**บน Mac / Linux / Bash:**
```bash
cp therapeutics-api/.env.example therapeutics-api/.env
```

> **หมายเหตุ:** หากต้องการเชื่อมต่อ Database จริง ให้เข้าไปแก้ไขค่า `DATABASE_URL` ในไฟล์ `therapeutics-api/.env` ให้ตรงกับ PostgreSQL ในเครื่องของคุณ

---

## ⚡ วิธีรันโปรเจกต์ (Running the Application)

คุณสามารถสั่งรันทั้ง **Backend Server** และ **Frontend Web App** พร้อมกันในคำสั่งเดียวผ่านโฟลเดอร์ Root (`prroject_webapp`):

```bash
npm run dev
```

เมื่อระบบเริ่มทำงานเรียบร้อยแล้ว สามารถเปิดเบราว์เซอร์เข้าใช้งานได้ที่:

* 🎨 **Frontend Web App**: [http://localhost:5173](http://localhost:5173)
* ⚙️ **Backend API Server**: [http://localhost:4000](http://localhost:4000)
* 📖 **API Documentation (OpenAPI/Swagger)**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🛑 วิธีหยุดการทำงาน (Stop Server)

หากต้องการเลิกรัน ให้กดปุ่ม **`Ctrl + C`** ที่หน้าต่าง Terminal แล้วพิมพ์ **`y`** จากนั้นกด **Enter** เพื่อปิดบริการทั้งหมดพร้อมกัน

---

## 📜 Scripts ที่ใช้งานได้ (Available Scripts)

คำสั่งที่สามารถสั่งรันได้จากโฟลเดอร์ Root:

| คำสั่ง | คำอธิบาย |
| :--- | :--- |
| `npm run install:all` | ติดตั้ง `node_modules` ให้กับทั้ง Backend และ Frontend |
| `npm run dev` | รัน Backend และ Frontend ควบคู่กันในโหมด Development |
| `npm run dev --prefix therapeutics-api` | รันเฉพาะบริการ Backend |
| `npm run dev --prefix gamified-therapeutics` | รันเฉพาะหน้าเว็บ Frontend |
