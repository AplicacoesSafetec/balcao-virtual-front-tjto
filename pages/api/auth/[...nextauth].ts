import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';

export default NextAuth({
  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      scope: 'profile email',
    }),
  ],
  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
  },
});
