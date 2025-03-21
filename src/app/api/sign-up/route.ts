import dbConnect from "@/lib/dbConnect";
import  { UserModel }  from "@/model/User";
import bcrypt from "bcryptjs"

import { sendVerificationEmail } from "@/helpers/sendEmailVerification";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest){
    try {
        await dbConnect();
        const {username, email, password} = await req.json();
        
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
        });

        if(existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username is already taken."
            }, {
                status: 400
            });
        }

        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        const existingUserByEmail = await UserModel.findOne({email});
        if(existingUserByEmail) {
            if (existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already exists with this email"
                }, {
                    status: 400
                });
            } else {
                const hashedPassword = await bcrypt.hash(password, 10);
                existingUserByEmail.password = hashedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = expiryDate;
                await existingUserByEmail.save();
            }
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            });
            await user.save();
        }

        const emailResponse = await sendVerificationEmail(email, username, verifyCode);
        if(!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
        } else {
            return Response.json({
                success: true,
                message: "Email registered successfully, please verify your email."
            }, {status: 201})
        }

    } catch (e) {
        console.error("Error registering user.", e);
        return Response.json({
            success: false,
            message: "Error registering user."
        }, {
            status: 500
        })
    }
}