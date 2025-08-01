import { NuxtAuthHandler } from "#auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { compare } from "bcrypt";

export default NuxtAuthHandler({
	adapter: PrismaAdapter(prisma),
	secret: process.env.AUTH_SECRET || "your-secret-key",
	providers: [
		// @ts-expect-error Use .default here for it to work during SSR
		CredentialsProvider.default({
			name: "credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials: any) {
				if (!credentials.email || !credentials.password) return null;

				const usuario = await prisma.user.findUnique({
				where: { email: credentials.email },
			});

				if (!usuario || !(await compare(credentials.password, usuario.password))) {
				return null;
			}

			return {
				id: usuario.id.toString(),
				email: usuario.email,
				name: usuario.firstName,
				firstName: usuario.firstName,
				lastName: usuario.lastName,
				isAdmin: usuario.isAdmin,
			};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.firstName = (user as any).firstName;
				token.lastName = (user as any).lastName;
				token.isAdmin = (user as any).isAdmin;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				(session.user as any).id = token.id as string;
				(session.user as any).firstName = token.firstName as string;
				(session.user as any).lastName = token.lastName as string;
				(session.user as any).isAdmin = token.isAdmin as boolean;
			}
			return session;
		},
	},
	pages: {
		signIn: "/login",
	},
	session: {
		strategy: "jwt",
	},
});
