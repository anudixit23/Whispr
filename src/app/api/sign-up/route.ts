import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User"
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendverificationEmail";
import { success } from "zod";


export async function POST(request: Request) {
    await dbConnect();
    try{
        const {username, email, password} = await request.json();

        const exixtingVerifiedUserByUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

       if(exixtingVerifiedUserByUsername){
        return Response.json(
          //Response body: This is the data you want to send to the client.
            {
              success : false,
              message : "Username is already taken",
            },
          //
       { status: 400}
    );
    
  }

  const existingUserByEmail = await UserModel.findOne({email});
  //6 digit verification code  Math.random geberates a randon decimal from 0 to 1
  let verifyCode = Math.floor(10000 + Math.random() * 90000).toString();
  
  if(existingUserByEmail){
    if (existingUserByEmail.isVerified) {
    return Response.json(
        {
            success: false,
            message : 'User already exists with this email',

        },
        { status: 400 }
    );
  }else{
    const hashedPassword = await bcrypt.hash(password,10);
    existingUserByEmail.password = hashedPassword;
    existingUserByEmail.verifyCode = verifyCode;
    existingUserByEmail.verifyCode = verifyCode;
    existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
    await existingUserByEmail.save();
       }

}else{
  const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessages: true,
        messages: [],

});
   await newUser.save();

}   
     // Send verification email
     const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );
    if (!emailResponse.success) {
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 201 }
    );

    }catch (error) {
    console.error('Error registering user:', error);
    return Response.json(
      {
        success: false,
        message: 'Error registering user',
      },
      { status: 500 }
    );
  }
  }