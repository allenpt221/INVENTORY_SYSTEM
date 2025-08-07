import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { supabase } from '../supabase/supa-client';
import cloudinary from '../lib/cloudinary';
import { sendResetPasswordEmail } from 'middleware/resetaccount';

interface TokenPayload {
  id: string;
  admin_id?: string;
  staff_id?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  role?: string
  image?:string;
}


interface AccountCredentials {
  id: number;
  username: string;
  email: string;
  image:string;
  staff_id: number;
  role: string;
}

interface SignUpData {
  username: string;
  email: string;
  password: string;
  image: string;
}

class AuthService {
  private readonly jwtSecret: string;
  private readonly SALT_ROUNDS = 10;
  private readonly ACCESS_TOKEN_EXPIRY = '15m';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    this.jwtSecret = process.env.JWT_SECRET;
  }

  private generateToken(id: string, staff_id?: string): AuthTokens {
    return {
      accessToken: jwt.sign({ id, staff_id }, this.jwtSecret, { expiresIn: this.ACCESS_TOKEN_EXPIRY }),
      refreshToken: jwt.sign({ id, staff_id}, this.jwtSecret, { expiresIn: this.REFRESH_TOKEN_EXPIRY })
    };
  }

  private setCookies(res: Response, tokens: AuthTokens): void {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'lax' as const,
    };

    res.cookie("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  public async createStaff(req: Request, res: Response): Promise<void> {
      try {
          const adminId = (req as any).user?.id;
          const { username, email, password, image }: SignUpData = req.body;

          if (!adminId) {
              res.status(401).json({ error: "Unauthorized" });
              return
          }

          const normalizedEmail = email.trim().toLowerCase();


          const { count, error: countError } = await supabase
              .from('staffAuthentication')
              .select('staff_id', { count: 'exact'})
              .eq('admin_id', adminId);

            if (countError) {
              console.error('Error counting staff:', countError);
              res.status(500).json({ error: 'Failed to check staff count' });
              return;
            }

            if ((count ?? 0) >= 3) {
              res.status(403).json({ error: 'Staff creation limit reached (max 3)' });
              return;
            }


          // Check if email already exists
          const { data: existUser } = await supabase
              .from('staffAuthentication')
              .select('email')
              .eq('email', normalizedEmail)
              .single();

          if (existUser) {
              res.status(409).json({ error: 'User with this email already exists' });
              return
          }

          // Hash password
          const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

          const defaultProfile = 'https://cdn-icons-png.flaticon.com/512/12225/12225935.png';

          // Insert staff
          const { error } = await supabase
              .from('staffAuthentication')
              .insert([{
                  username,
                  email: normalizedEmail,
                  password: hashedPassword,
                  role: 'staff',
                  admin_id: adminId,
                  image: defaultProfile,
              }]);

          if (error) {
              console.error('Supabase error:', error);
              res.status(500).json({ error: 'Failed to create user' });
              return
          }

          res.status(201).json({
              message: 'User created successfully',
              staff: {
                  username,
                  email: normalizedEmail,
                  image: defaultProfile
              }
          });

      } catch (error: any) {
          console.error('Server error:', error);
          res.status(500).json({ error: 'Internal server error'})
          return
      }
  }


  public async getAllUsers(req: Request, res: Response): Promise<void> {
    try {

        const {data: users, error} = await supabase
        .from('authentication')
        .select('*')


        if (error) {
          console.error('Supabase error:', error);
          res.status(500).json({ success: false, error: 'Failed to fetch users' });
          return;
        }

        res.status(200).json({success:true, user: users})

    } catch (error: any) {
      console.log('get all user', error)
      res.status(400).json({error: 'Internal Server Error'})
    }
  }

  public async signUp(req: Request, res: Response): Promise<void> {
    try {
      const { username, email, password }: SignUpData = req.body;

      // Validate input
      if (!username || !email || !password) {
        res.status(400).json({ error: 'Username, email and password are required' });
        return;
      }

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('authentication')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (existingUser) {
        res.status(409).json({ error: 'User with this email already exists' });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Create user
      const { data: newUser, error } = await supabase
        .from('authentication')
        .insert([{
          username,
          email: email.trim().toLowerCase(),
          password: hashedPassword,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error || !newUser) {
        console.error('Supabase error:', error);
        res.status(500).json({ error: 'Failed to create user' });
        return;
      }

      // Generate tokens without logging in automatically
      res.status(201).json({
        message: 'User created successfully',
        data: { 
          username: newUser.username, 
          email: newUser.email 
        },
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  public async logIn(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginCredentials = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      // First, try to find user in admin table
      let { data: user, error } = await supabase
        .from('authentication')
        .select('*')
        .eq('email', normalizedEmail)
        .single();


      // If not found in admin, try staff
      if (error || !user) {
        const staffResult = await supabase
          .from('staffAuthentication')
          .select('*')
          .eq('email', normalizedEmail)
          .single();

        user = staffResult.data;

        if (staffResult.error || !user) {
          res.status(401).json({ error: 'Invalid credentials' });
          return;
        }
      }

      // Validate password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate token & set cookies
      const tokens = this.generateToken(user.id, user.staff_id)
      this.setCookies(res, tokens);

      // Return response
      res.status(200).json({
        message: 'Login successful',
        user: {
        staff_id: user.staff_id,
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        image: user.image,
        admin_id: user.admin_id || null
        },
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }


  // Add these additional methods for a complete auth service
  public async logOut(req: Request,res: Response): Promise<void> {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logout successful' });
  }

  public async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ error: 'Refresh token required' });
        return;
      }

      const decoded = jwt.verify(refreshToken, this.jwtSecret) as TokenPayload;

      if (!decoded?.id) {
        res.status(401).json({ error: 'Invalid token payload' });
        return;
      }

      const newTokens = this.generateToken(decoded.id, decoded.staff_id);
      this.setCookies(res, newTokens);

      res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error: any) {
      console.error('Token refresh error:', error.message || error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }


  public async getProfile (req: Request, res: Response): Promise<void> {
    try {
      res.json(req.user);
    } catch (error: any) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }


  public async updateAccount(req: Request, res: Response): Promise<void> {
    try {
      const {
        id, staff_id, username, image, role,}: AccountCredentials = req.body;

      if (!username || (role === "staff" ? !staff_id : !id)) {
        res.status(400).json({ error: "Missing required fields" });
        return;
      }

      const updateFields: Partial<AccountCredentials> = { username };

      // Optional image upload
      if (image && image.startsWith("data:image")) {
        const cloudinaryResponse = await cloudinary.uploader.upload(image, {
          folder: "products",
        });
        updateFields.image = cloudinaryResponse.secure_url;
      }

      // Choose table and key
      const tableToUpdate = role === "staff" ? "staffAuthentication" : "authentication";
      const keyColumn = role === "staff" ? "staff_id" : "id";
      const keyValue = role === "staff" ? staff_id : id;

      const { data, error } = await supabase
        .from(tableToUpdate)
        .update(updateFields)
        .eq(keyColumn, keyValue)
        .select("username, email, image, role");

      if (error) {
        console.error(`Supabase ${tableToUpdate} update error:`, error);
        res.status(500).json({ error: "Failed to update account" });
        return;
      }

      res.status(200).json({
        message: "Update successfully",
        account: data?.[0],
      });

    } catch (error) {
      console.error("Unexpected error:", error);
      res.status(500).json({ error: "Server error" });
    }
  }

  public async ObtainAuthStaff(req: Request, res: Response): Promise<void> {
    try {

      const {data, error} = await supabase 
      .from("staffAuthentication")
      .select("*")

      if(error){
        console.error("Supabase update error:", error);
        res.status(500).json({ error: "Failed to update account" });
      }


      res.status(200).json({sucess:true, staff: data});
    } catch (error: any) {
        console.error("Unexpected Error in OnbtainAuthStaff");
        res.status(400).json({error: "Server Error"})
    }
  }

  public async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const normalizedEmail = email.trim().toLowerCase();

      // Search in both tables
      const { data: user, error } = await supabase
        .from("authentication")
        .select("id, email")
        .eq("email", normalizedEmail)
        .single();

      let staffUser = null;

      if (error || !user) {
        const staffResult = await supabase
          .from("staffAuthentication")
          .select("staff_id, email")
          .eq("email", normalizedEmail)
          .single();

        if (staffResult.error || !staffResult.data) {
          res.status(404).json({ message: "We couldn't find an account with that email." }); 
          return 
        }

        staffUser = staffResult.data;
      }

      // Token with either id or staff_id
      const tokenPayload = staffUser
        ? { staff_id: staffUser.staff_id }
        : { id: user?.id };

      const token = jwt.sign(tokenPayload, this.jwtSecret, {
        expiresIn: "15m",
      });

      const resetLink = `http://localhost:5173/reset-password?token=${token}`;

      await sendResetPasswordEmail(normalizedEmail, resetLink);

      res.status(200).json({ message: "Password reset email sent.", token, resetLink });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  public async resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ error: "Token and new password are required." });
      return;
    }

    let decoded: TokenPayload;

    try {
      decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch (err) {
      res.status(400).json({ error: "Invalid or expired token." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    if (decoded.staff_id) {
      const { error } = await supabase
        .from("staffAuthentication")
        .update({ password: hashedPassword })
        .eq("staff_id", decoded.staff_id);

      if (error) {
        console.error("Staff password update error:", error);
        res.status(500).json({ error: "Failed to update staff password." });
        return;
      }
    } else if (decoded.id) {
      const { error } = await supabase
        .from("authentication")
        .update({ password: hashedPassword })
        .eq("id", decoded.id);

      if (error) {
        console.error("Admin password update error:", error);
        res.status(500).json({ error: "Failed to update admin password." });
        return;
      }
    } else {
      res.status(400).json({ error: "Invalid token payload." });
      return;
    }

    res.status(200).json({ message: "Password has been reset successfully." });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Server error." });
  }
  }


}

export const authService = new AuthService();