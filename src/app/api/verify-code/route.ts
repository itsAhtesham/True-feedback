import dbConnect from "@/lib/dbConnect";
import { UserModel } from "@/model/User";
import { verifySchema } from "@/schemas/verifySchema";
import { z } from "zod";

const VerifyCodeSchema = z.object({
  verifyCode: verifySchema,
});

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { username, code } = await req.json();

    const verificationCoderesult = VerifyCodeSchema.safeParse(code);
    if (!verificationCoderesult.success) {
      return Response.json(
        {
          success: false,
          message: verificationCoderesult.error.message,
        },
        { status: 400 }
      );
    }

    const decodedUsername = decodeURIComponent(username);

    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        {
          status: 400,
        }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "User verified successfully...",
        },
        {
          status: 200,
        }
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification code has expired, Please signup again to get new code",
        },
        {
          status: 400,
        }
      );
    } else {
      return Response.json(
        {
          success: false,
          message: "Incorrect Verification code",
        },
        {
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error("Error verifying code", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying code",
      },
      {
        status: 500,
      }
    );
  }
}
