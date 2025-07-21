import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase/supa-client"; 


interface TokenPayload {
  id: string;
}


interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}


export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - No access token provided" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as TokenPayload;

            console.log("Decoded token:", decoded);

            
            // Supabase query to get user
            const { data: user, error } = await supabase
                .from('authentication')
                .select('*')
                .eq('id', decoded.id)
                .single();

            if (error || !user) {
                return res.status(401).json({ message: "User not found" });
            }

            req.user = user;
            next();
        } catch (error: any) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Unauthorized - Access token expired" });
            }
            throw error;
        }
    } catch (error: any) {
        console.log("Error in protectRoute middleware", error.message);
        return res.status(401).json({ message: "Unauthorized - Invalid access token" });
    }
};

export const adminRoute = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "superAdmin") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied - Admin only" });
    }
};