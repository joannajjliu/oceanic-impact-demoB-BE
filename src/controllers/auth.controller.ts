import { NextFunction, Request, Response } from "express";
import AuthService from "@services/auth.service";
import EmailService from "@/services/email.service";

export default class AuthController {
  public authService = new AuthService();
  public emailService = new EmailService();

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    const { email: email_, password } = req.body;
    console.log("req.body", email_, password )

    try {
      if (!email_ || !password) {
        return res.status(400).json({
          message: "Fields email and password are required",
        });
      }
      const email = email_.toLowerCase();
      const user = await this.authService.signup(email, password);
      console.log("user", user)

      // send verification email
      // const sentVerificationEmail = await this.authService.requestNewEmailToken(email, this.emailService);
      // console.log("sentVerificationEmail", sentVerificationEmail)
      // if (!sentVerificationEmail) {
      //   return res.status(500).json({
      //     message: "Error sending verification email for new user",
      //     user: {
      //       _id: user._id,
      //       email: user.email
      //     }
      //   });
      // }

      return res.status(201).json({
        user: {
          _id: user._id,
          email: user.email,
        },
        message: "Signup successful; Please verify your email.",
      });
    } catch (error: any) {
      console.log("signup error", error)
      if (error.name === "MongoServerError" && error.code === 11000) {
        // duplicate key in index error.
        // See https://www.mongodb.com/docs/manual/core/index-unique/#unique-index-and-missing-field
        return res.status(409).json({
          message: `A user with the email: "${email_}" already exists`,
        });
      }
      // a;; other errors are assumed to be server errors
      console.error(error);
      res.status(500).json({
        message: "Error creating new user",
      });
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    const { email: email_, password } = req.body;
    console.log("login req.body", req.body)
    if (!email_ || !password) {
      return res.status(400).json({
        message: "Fields email and password are required",
      });
    }
    const email = email_.toLowerCase();
    try {
      const loginResponse = await this.authService.login(email, password);
      console.log("controller loginResponse", loginResponse)
      if (loginResponse.token) {
        return res.status(200)
          .set("Authorization", `JWT ${loginResponse.token}`) // set the JWT in the header
          .json({
          token: loginResponse.token,
          message: "Login successful",
        });
      } else {
        // login failed
        return res.status(401).json({
          message: loginResponse.message,
        });
      }
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Error logging in",
      });
    }
  };

  public verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    const { email, token } = req.query;
    if (!email || !token) {
      return res.status(400).json({
        message: "Missing email or token query parameters",
      });
    }
    try {
      const result = await this.emailService.verifyEmail(email as string, token as string);
      if (!result) {
        return res.status(400).json({
          message: "Invalid verification token",
        });
      }

      return res.status(204).json(); // no content
    } catch (error: any) {
      console.error(error);
      res.status(500).json({
        message: "Error verifying email",
      });
    }
  }
}
