# NextAuth_Prisma01
NextAuth + Prisma

# Next.js Authentication Project (NextAuth + Prisma + Docker)

คู่มือการติดตั้งและใช้งานระบบสมัครสมาชิกและยืนยันตัวตนแบบครบวงจร รองรับทั้ง Email/Password และ Google OAuth

---

## 🛠 1. การเตรียมระบบ Windows (System Setup)
เปิด PowerShell (Administrator) เพื่อเปิดใช้งานฟีเจอร์จำลองระบบ:
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
*หมายเหตุ: ต้อง Restart เครื่อง 1 ครั้งเพื่อให้มีผลถาวร*

---

## 🐳 2. การจัดการฐานข้อมูล (Docker & Postgres)
ใช้ไฟล์ `docker-compose.yml` เพื่อรัน PostgreSQL และ pgAdmin:

```powershell
# กรณีเกิดปัญหาชื่อซ้ำ (Conflict) ให้ล้าง Container เก่าก่อน
docker rm -f my_db_server my_pgadmin

# เริ่มต้นระบบฐานข้อมูล (ให้สถานะเป็นสีเขียวใน Docker Desktop)
docker-compose up -d
```

---

## 💎 3. การตั้งค่า Prisma (Database ORM)
**สำคัญ:** แนะนำให้ใช้ Prisma 6 เพื่อความเสถียรสูงสุดบน App Router

```powershell
# ติดตั้ง Library ที่จำเป็น
npm install prisma@6 @prisma/client@6 --save-dev
npm install @auth/prisma-adapter bcrypt

# เริ่มต้นระบบ Prisma
npx prisma init
```

### โครงสร้าง Schema (`prisma/schema.prisma`):
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String?
  email     String   @unique
  password  String
  image     String?
  role      String   @default("member")
  createdAt DateTime @default(now())
}
```

---

## 🔐 4. การตั้งค่า NextAuth & Google OAuth
### ไฟล์ `.env`
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### การตั้งค่า Google Console:
- **Authorized JavaScript origins:** `http://localhost:3000`
- **Authorized redirect URIs:** `http://localhost:3000/api/auth/callback/google`

---

## 🚀 5. คำสั่งที่ใช้บ่อยเมื่อมีการแก้ไข
หากมีการแก้ไฟล์ Schema หรือเจอปัญหา Module not found:

```powershell
# อัปเดตโครงสร้างฐานข้อมูล
npx prisma db push

# สร้าง Client ใหม่เมื่อมีการเปลี่ยนเวอร์ชันหรือแก้ไข Schema
npx prisma generate

# ล้าง Cache เมื่อ Next.js ค้างหรือรวน
rm -r -fo .next
```

---

## 📂 Project Structure (App Router)
- `app/api/auth/[...nextauth]/route.js` : ศูนย์กลางการตั้งค่า Auth
- `app/api/auth/signup/route.js` : API สำหรับสมัครสมาชิกใหม่
- `app/signup/page.jsx` : หน้าจอสมัครสมาชิก
- `app/profile/page.jsx` : หน้าจอแสดงผลหลัง Login (ใช้ `useSession`)
