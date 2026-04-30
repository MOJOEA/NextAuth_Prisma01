# 🚀 Next.js Full Stack Setup (NextAuth + Prisma + Docker)
คู่มือการติดตั้งระบบฐานข้อมูลและยืนยันตัวตนฉบับสมบูรณ์ (Stable Version)

---

## 💻 1. การเตรียมเครื่อง Windows (System Prep)
เปิด PowerShell (Administrator) เพื่อเปิดใช้งานฟีเจอร์จำลองระบบ (รันครั้งเดียว):
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
*หมายเหตุ: ต้องรีสตาร์ทคอมพิวเตอร์หลังจากรันเสร็จ*

---

## 🐳 2. การจัดการฐานข้อมูล (Docker Compose)
สร้างไฟล์ `docker-compose.yml` เพื่อรัน PostgreSQL และ pgAdmin (เวอร์ชันแก้บัค CSRF):

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: my_db_server
    environment:
      POSTGRES_USER: myuser
      POSTGRES_PASSWORD: mypassword
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - app-network

  pgadmin:
    image: dpage/pgadmin4
    container_name: my_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@admin.com
      PGADMIN_DEFAULT_PASSWORD: root
      PGADMIN_CONFIG_MASTER_PASSWORD_REQUIRED: "False"
      PGADMIN_CONFIG_ENHANCED_COOKIE_PROTECTION: "False"
    ports:
      - "5050:80"
    depends_on:
      - postgres
    networks:
      - app-network

volumes:
  postgres-data:

networks:
  app-network:
    driver: bridge
```
**คำสั่งรัน:** `docker-compose up -d` (ถ้าชื่อซ้ำให้รัน `docker rm -f my_db_server my_pgadmin` ก่อน)

---

## 💎 3. การติดตั้ง Library (npm & npx)
**สำคัญ:** ใช้ Prisma 6 เพื่อความเสถียรสูงสุด (ป้องกัน Error P1012 ของ v7)

```powershell
# 1. ติดตั้ง Packages
npm install prisma@6 @prisma/client@6 --save-dev
npm install next-auth @auth/prisma-adapter bcrypt

# 2. เริ่มต้นและเชื่อมต่อฐานข้อมูล
npx prisma init
npx prisma db push    # สร้างตารางใน Docker ทันที
npx prisma generate   # สร้างตัวเชื่อมต่อ Client
```

---

## 📝 4. การตั้งค่า Schema & Environment
### ไฟล์ `.env`
```env
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydb?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-id"
GOOGLE_CLIENT_SECRET="your-secret"
```

### ไฟล์ `prisma/schema.prisma`
```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String?
  email     String   @unique
  password  String
  role      String   @default("member")
  image     String?
  createdAt DateTime @default(now())
}
```

---

## 🔐 5. ไฟล์ NextAuth API (Stable Route)
ตำแหน่ง: `app/api/auth/[...nextauth]/route.js`

```javascript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'
import { PrismaAdapter } from '@auth/prisma-adapter'

const prisma = new PrismaClient()

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials.email } })
        if (user && bcrypt.compareSync(credentials.password, user.password)) {
          return { id: user.id, name: user.name, email: user.email, role: user.role }
        }
        throw new Error('Invalid email or password')
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) { token.id = user.id; token.role = user.role; }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) { session.user.id = token.id; session.user.role = token.role; }
      return session
    }
  }
}
const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

---

## 🛠 6. วิธีแก้ปัญหา (Troubleshooting)
หากเจอ Error **Cannot find module** หรือระบบรวน ให้รันคำสั่ง "ล้างไพ่" นี้:
```powershell
rm -r -fo .next, node_modules/.prisma
npm install
npx prisma generate
npm run dev
```
