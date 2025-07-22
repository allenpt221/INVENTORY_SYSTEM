import { LoginForm } from "./loginPage/login-form"

function LogIn() {
    return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-3 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
            <LoginForm />
        </div>
    </div>
    )
}

export default LogIn