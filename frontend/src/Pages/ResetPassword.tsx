import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "@/lib/axios";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
        setMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (success) return;

    setLoading(true);
    setMessage("");

    try {
      await axios.post("/auth/reset-password", {
        token,
        newPassword,
      });

      setSuccess(true);
      setMessage("Password has been reset successfully.");
    } catch (err: any) {
      setMessage(
        `${err.response?.data?.error || err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <div className={cn("flex flex-col gap-3", className)} {...props}>
          <Card className="p-0">
            <CardContent className="grid p-0 md:grid-cols-2">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-2">
                <div className="text-center space-y-1">
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-muted-foreground text-sm">
                    Enter a new password to reset your account access.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="********"
                    required
                    disabled={loading || success}
                  />
                </div>

                {message && (
                  <p
                    className={`text-sm ${
                      success ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {message}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || success}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>

              {/* Image section (hidden on small screens) */}
              <div className="relative hidden md:block bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1585313736187-2d481f3c3969?q=80&w=1171&auto=format&fit=crop"
                  alt="Reset illustration"
                  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale rounded-r-lg"
                />
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-center text-muted-foreground text-balance *:[a]:underline *:[a]:underline-offset-4 *:[a]:hover:text-primary">
            By continuing, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
