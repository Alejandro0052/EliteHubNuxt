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

				const user = await prisma.usuario.findUnique({
					where: { correo: credentials.email },
				});

				if (!user || !(await compare(credentials.password, user.password))) {
					return null;
				}

				return {
					id: user.id.toString(),
					email: user.correo,
					name: user.nombre,
					firstName: user.nombre,
					lastName: user.apellido,
					isAdmin: user.isAdmin,
				};
			},
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				token.firstName = user.firstName;
				token.lastName = user.lastName;
				token.isAdmin = user.isAdmin;
			}
			return token;
		},
		async session({ session, token }) {
			if (token && session.user) {
				session.user.id = token.id as string;
				session.user.firstName = token.firstName as string;
				session.user.lastName = token.lastName as string;
				session.user.isAdmin = token.isAdmin as boolean;
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
