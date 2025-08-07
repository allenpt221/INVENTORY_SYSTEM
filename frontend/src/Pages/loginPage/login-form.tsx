import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useEffect, useState } from "react"
import { authUserStore } from "@/Stores/authStore"

import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const login = authUserStore((state) => state.login);
  const loading = authUserStore((state) => state.loading);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const success = await login(email, password);

  if(!success){
    setError(true);
  }
};

useEffect(() => {
  if (!error) return;

  const timeout = setTimeout(() => {
    setError(false);
  }, 2000);

  return () => clearTimeout(timeout);
}, [error]); 



  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSubmit}
          className="p-6 md:p-8">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Acme Inc account
                </p>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m@example.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                placeholder="********"
                id="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                 required />
              </div>
              <Button type="submit" className={`w-full ${loading ? 'opacity-70' : ''}`}>
                {loading ? 'Logging in' : 'Login'}
              </Button>
              <a
                  href="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
              </a>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1585313736187-2d481f3c3969?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>

      {error && (
        <Alert variant="destructive" className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 sm:w-full w-[18rem] max-w-md md:max-w-xl px-4">
        <AlertCircleIcon />
        <AlertTitle>Invalid credentials.</AlertTitle>
        <AlertDescription>
          <p>Please verify your account information and try again.</p>
        </AlertDescription>
      </Alert>
      )}
    </div>
  )
}
