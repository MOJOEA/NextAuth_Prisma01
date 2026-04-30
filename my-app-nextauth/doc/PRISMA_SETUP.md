# 💎 Prisma Setup Guide (Stable Version)

คู่มือการติดตั้งและตั้งค่า Prisma ให้ทำงานร่วมกับ PostgreSQL (Docker) และ NextAuth โดยเน้นเวอร์ชันที่เสถียรที่สุดเพื่อป้องกัน Error P1012 และปัญหา Module Not Found

---

## 1. การติดตั้ง Library (เวอร์ชันเสถียร)
เพื่อให้ระบบทำงานได้โดยไม่ต้องตั้งค่าไฟล์ Config ซับซ้อน ให้ใช้ **Prisma เวอร์ชัน 6**

```powershell
# ติดตั้ง Prisma CLI และ Client
npm install prisma@6 @prisma/client@6 --save-dev

# ติดตั้ง Adapter สำหรับ NextAuth และตัวเข้ารหัสรหัสผ่าน
npm install @auth/prisma-adapter bcrypt
```

---

## 2. การเริ่มต้นระบบ (Initialization)
สร้างโฟลเดอร์ prisma และไฟล์ตั้งค่าพื้นฐาน:
```powershell
npx prisma init
```

---

## 3. การตั้งค่าไฟล์ที่สำคัญ

### 📄 .env
ระบุที่อยู่ของฐานข้อมูล PostgreSQL ที่รันอยู่ใน Docker:
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb?schema=public"
```

### 📄 prisma/schema.prisma
ใช้โครงสร้าง Model ที่รองรับ NextAuth และฟิลด์ Role สำหรับจัดการสิทธิ์:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            Int       @id @default(autoincrement())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String?
  image         String?
  role          String    @default("member")
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                 String  @id @default(cuid())
  userId             Int
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

## 4. การสั่ง Sync ข้อมูล (ครั้งเดียวจบ)
รันคำสั่งเหล่านี้เพื่อสร้างตารางในฐานข้อมูลและเตรียมตัวเชื่อมต่อ (Client):

```powershell
# 1. สร้างตารางลงใน Docker ทันที
npx prisma db push

# 2. สร้าง Prisma Client สำหรับเรียกใช้ในโค้ด
npx prisma generate
```

---

## 🛠 วิธีแก้ปัญหาเมื่อเจอ Error (Troubleshooting)

### กรณีเจอ Error "Cannot find module '@prisma/client/runtime/library.js'"
ปัญหานี้เกิดจาก Cache ของ Next.js หรือไฟล์ Client เสียหาย ให้รัน:
```powershell
# ลบโฟลเดอร์ที่รวนและสร้างใหม่
Remove-Item -Recurse -Force .next, node_modules/.prisma
npx prisma generate
```

### กรณีเปลี่ยนโครงสร้าง Model
ทุกครั้งที่มีการเพิ่มฟิลด์ (เช่น เพิ่ม Role) ให้รัน:
```powershell
npx prisma db push
npx prisma generate
```

---

## 💡 การเรียกใช้งานใน Next.js
สร้างไฟล์เชื่อมต่อที่ `lib/prisma.js` (หรือเรียกใช้ตรงๆ ใน API)
```javascript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
export default prisma
```
