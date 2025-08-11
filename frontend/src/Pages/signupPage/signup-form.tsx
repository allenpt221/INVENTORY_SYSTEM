import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon, CheckCircleIcon } from "lucide-react"
import { useState } from "react"
import { authUserStore } from "@/Stores/authStore"
import { Link } from "react-router-dom"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const signup = authUserStore((state) => state.signup)

  const [signupForm, setSignupForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSignupForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (signupForm.password !== signupForm.confirmPassword) {
      setError("Passwords do not match.")
      return
    }
    if (signupForm.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)
    try {


      await signup(signupForm)
      setSuccess("Account created successfully!")
      setSignupForm({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      

      // Hide success message after 3s
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
     const errorMessage = err?.response?.data?.error?.toLowerCase?.() || err?.message?.toLowerCase?.() || ""

      if (errorMessage.includes("email") && errorMessage.includes("username")) {
        setError("Email or username is already in use.")
      } else if (errorMessage.includes("email")) {
        setError("Email is already in use.")
      } else if (errorMessage.includes("username")) {
        setError("Username is already taken.")
      } else {
        setError("Something went wrong. Please try again.")
      }

      // Hide error after 3s
      setTimeout(() => setError(null), 3000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* ✅ Success Alert */}
      {success && (
        <Alert className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 sm:w-full w-[18rem] max-w-md md:max-w-xl px-4">
          <CheckCircleIcon className="text-green-500" />
          <AlertTitle className="text-green-700">Success</AlertTitle>
          <AlertDescription className="text-green-600">
            <p>{success}</p>
          </AlertDescription>
        </Alert>
      )}

      {/* ❌ Error Alert */}
      {error && (
        <Alert variant="destructive" className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 sm:w-full w-[18rem] max-w-md md:max-w-xl px-4">
          <AlertCircleIcon />
          <AlertTitle>Oops! Something went wrong</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      )}

      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form onSubmit={handleSignup} className="p-6 md:p-8">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome</h1>
                <p className="text-muted-foreground text-balance">
                  Create your StockHub account
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  name="username"
                  maxLength={18}
                  value={signupForm.username}
                  onChange={handleChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={signupForm.email}
                  onChange={handleChange}
                  placeholder="m@example.com"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  value={signupForm.password}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={signupForm.confirmPassword}
                  onChange={handleChange}
                  placeholder="********"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing up..." : "Sign Up"}
              </Button>

              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link to="/" className="underline underline-offset-4">
                  Log In
                </Link>
              </div>
            </div>
          </form>

          <div className="bg-muted relative hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1585313736187-2d481f3c3969?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8"
              alt="Signup"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
