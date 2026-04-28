# คู่มือการติดตั้งและใช้งาน Docker สำหรับ PostgreSQL & pgAdmin

เอกสารนี้รวบรวมคำสั่งที่ถูกต้องสำหรับการเตรียมระบบ Windows และการจัดการ Container เพื่อป้องกันปัญหาการเชื่อมต่อและข้อผิดพลาดจากการตั้งชื่อซ้ำ (Conflict)

---

## 1. การเตรียมระบบ Windows (System Requirement)
**เงื่อนไข:** ต้องเปิด **PowerShell ในฐานะ Administrator** เท่านั้น

### 1.1 เปิดใช้งานฟีเจอร์ WSL และ Virtualization
รันคำสั่งด้านล่างนี้เพื่อติดตั้งฟีเจอร์พื้นฐานของ Windows:

```powershell
# เปิดใช้งาน Windows Subsystem for Linux
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# เปิดใช้งาน Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```
*หลังจากรันเสร็จแล้ว **ต้อง Restart คอมพิวเตอร์** เพื่อให้การตั้งค่ามีผลถาวร*

---

## 2. การล้างข้อมูลและแก้ปัญหาการรัน (Clean Up)
ในกรณีที่รันแล้วไม่เป็นสีเขียว หรือพบข้อผิดพลาด "Conflict" เนื่องจากมี Container ชื่อเดิมค้างอยู่ในระบบ ให้ใช้คำสั่งล้างข้อมูลดังนี้:

```powershell
# ลบ Container ที่ค้างระบบ (my_db_server และ my_pgadmin)
docker rm -f my_db_server my_pgadmin

# ล้าง Network และ Volume ที่อาจทำงานผิดพลาดในโฟลเดอร์โปรเจกต์
docker-compose down -v
```

---

## 3. การรันระบบ (Deployment)
เมื่อล้างระบบเก่าแล้ว ให้สั่งรันโปรเจกต์ขึ้นมาใหม่เพื่อให้สถานะใน Docker Desktop เป็น **สีเขียว (Running)**:

```powershell
# สั่งรัน Container แบบเบื้องหลัง (Background)
docker-compose up -d
```

---

## 4. การตั้งค่าการเชื่อมต่อ (Database Connection)
เมื่อ Docker Desktop แสดงสถานะเป็น **สีเขียว** ให้เข้าใช้งาน pgAdmin ผ่าน `http://localhost:5050` และตั้งค่าการเชื่อมต่อดังนี้:


| Field | Value |
| :--- | :--- |
| **Host name/address** | `postgres` |
| **Port** | `5432` |
| **Maintenance database** | `mydb` |
| **Username** | `myuser` |
| **Password** | `mypassword` |

> **หมายเหตุ:** ต้องใช้ Host เป็น `postgres` เท่านั้น (ตามชื่อ Service ในไฟล์ docker-compose) เพื่อให้ Container สื่อสารกันเองภายใน Network ของ Docker ได้สำเร็จ

---
