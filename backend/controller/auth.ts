import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { supabase } from '../supabase/supa-client';

interface TokenPayload {
  id: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  username: string;
  email: string;
  password: string;
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

  private generateToken(userId: string): AuthTokens {
    return {
      accessToken: jwt.sign({ id: userId }, this.jwtSecret, { expiresIn: this.ACCESS_TOKEN_EXPIRY }),
      refreshToken: jwt.sign({ id: userId }, this.jwtSecret, { expiresIn: this.REFRESH_TOKEN_EXPIRY })
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
          role: 'staff',
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

      // Get user from database
      const { data: user, error } = await supabase
        .from('authentication')
        .select('*')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (error || !user) {
        // Don't reveal whether user exists for security
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate tokens
      const tokens = this.generateToken(user.id);
      this.setCookies(res, tokens);

      // Return user data (excluding sensitive information)
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
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
      const newTokens = this.generateToken(decoded.id);
      this.setCookies(res, newTokens);

      res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error: any) {
      console.error('Token refresh error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  }
}

export const authService = new AuthService();