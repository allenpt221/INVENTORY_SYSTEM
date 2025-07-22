import { SignupForm } from "./signupPage/signup-form"

function SignUp() {
    return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-2 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
            <SignupForm />
        </div>
    </div>
    )
}

export default SignUp