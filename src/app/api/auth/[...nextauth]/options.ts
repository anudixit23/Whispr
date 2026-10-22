import { NextAuthOptions} from 'next-auth';
import { CredentialsProvider } from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export const authOptions: NextAuthOptions = {  //an object
    //providers: [] is an array listing the available login providers.
    //The provider tells NextAuth that users will log in using credentials rather than Google or GitHub OAuth.
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {    //Describes the fields expected by the sign-in form.
                email : {label: 'Email' , type :'text'},
                password: { label: 'Password', type: 'password' },

            },
            //This function contains your actual login verification logic.
             async authorize(credentials: any): Promise<any> {
        await dbConnect();
        try {
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error('No user found with this email');
          }
          if (!user.isVerified) {
            throw new Error('Please verify your account before logging in');
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('Incorrect password');
          }
        } catch (err: any) {
          throw new Error(err);
        }
       },

        }),
        //Callbacks are asynchronous functions you can use to control what happens when an action is performed.

    ],
    callbacks: {
        async jwt({token,user}) {
            if(user){
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;

            }
            return token;

        },
        async session({session,token}) {
            if(token){
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isVerified = token.isVerified;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            }
            return session;
             
        },

    },
    session: {
    strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/sign-in',
    },
}
