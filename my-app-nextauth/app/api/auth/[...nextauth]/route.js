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
    // 1. ระบบ Login ด้วย Email/Password
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (user && (await bcrypt.compare(credentials.password, user.password))) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        }
        throw new Error('Invalid email or password')
      },
    }),
    // 2. ระบบ Login ด้วย Google
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.sub,
          name: `${profile.given_name} ${profile.family_name}`,
          email: profile.email,
          image: profile.picture,
          role: profile.role ?? "member", // กำหนดค่าเริ่มต้นถ้าไม่มี role
        }
      },
    })
  ],
  session: {
    strategy: 'jwt', // สำคัญ: ต้องใช้ jwt เพื่อให้ทำงานกับ Credentials ได้
  },
  callbacks: {
    // จังหวะสร้าง Token (ทำงานหลังล็อกอินสำเร็จ)
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.picture = user.image
      }
      return token
    },
    // จังหวะส่งข้อมูลให้หน้าบ้าน (Client Side)
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.image = token.picture
      }
      return session
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/profile`
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
