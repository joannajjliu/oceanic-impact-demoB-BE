import { NextFunction, Request, Response } from "express";
import AuthService from "@services/auth.service";
import EmailService from "@/services/email.service";

export default class AuthController {
  public authService = new AuthService();
  public emailService = new EmailService();

  public logout = async (req: Request, res: Response, next: NextFunction) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect(process.env.AUTH_FAILURE_REDIRECT || "/login");
    });
  };

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    try {
      if (!email || !password) {
        return res.status(400).json({
          message: "Fields email and password are required",
        });
      }
      const user = await this.authService.signup(email, password);

      // send verification email
      const sentVerificationEmail = await this.authService.requestNewEmailToken(email, this.emailService);
      if (!sentVerificationEmail) {
        return res.status(500).json({
          message: "Error sending verification email for new user",
          user: {
            _id: user._id,
            email: user.email
          }
        });
      }

      return res.status(201).json({
        user: {
          _id: user._id,
          email: user.email,
        },
        message: "Signup successful; Please verify your email.",
      });
    } catch (error: any) {
      if (error.name === "MongoServerError" && error.code === 11000) {
        // duplicate key in index error.
        // See https://www.mongodb.com/docs/manual/core/index-unique/#unique-index-and-missing-field
        return res.status(409).json({
          message: `A user with the email: "${email}" already exists`,
        });
      }
      // a;; other errors are assumed to be server errors
      console.error(error);
      res.status(500).json({
        message: "Error creating new user",
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
