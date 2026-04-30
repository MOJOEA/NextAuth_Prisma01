"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- ส่วนการเรียก API ---
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form), // ส่งข้อมูล name, email, password
    });

    if (res.ok) {
      alert("สมัครสมาชิกสำเร็จ!");
      router.push("/"); // สมัครเสร็จให้เด้งไปหน้า Login
    } else {
      const data = await res.json();
      alert(data.error || "เกิดข้อผิดพลาด");
    }
    // -----------------------
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white shadow-lg rounded-xl border w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">สร้างบัญชีใหม่</h1>
        <input
          type="text"
          placeholder="ชื่อของคุณ"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="อีเมล"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          className="w-full p-2 mb-4 border rounded"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 font-bold">
          Register
        </button>
      </form>
    </div>
  );
}
