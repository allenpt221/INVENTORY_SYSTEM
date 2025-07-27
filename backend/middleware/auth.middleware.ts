import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { supabase } from "../supabase/supa-client"; 


interface TokenPayload {
  id: string;
  admin_id?: string;
}


interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  admin_id?: string;
  image?: string;
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

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET!) as TokenPayload;

    // Try finding the user in authentication (admin)
    let { data: user, error } = await supabase
      .from('authentication')
      .select('*')
      .eq('id', decoded.id)
      .single();

    // If not found, try staffAuthentication
    if (error || !user) {
      const staffResult = await supabase
        .from('staffAuthentication')
        .select('*')
        .eq('admin_id', decoded.admin_id)
        .single();

      user = staffResult.data;

      if (staffResult.error || !user) {
        return res.status(401).json({ message: "User not found" });
      }
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Access token expired" });
    }

    console.log("Error in protectRoute middleware", error.message);
    return res.status(401).json({ message: "Unauthorized - Invalid access token" });
  }
};


export const adminRoute = (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "manager") {
        next();
    } else {
        return res.status(403).json({ message: "Access denied - manager only" });
    }
};