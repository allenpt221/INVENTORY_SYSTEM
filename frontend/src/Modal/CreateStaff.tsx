import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { X } from "lucide-react";
import { useState } from "react";
import { authUserStore } from "@/Stores/authStore";
import type { signupStaff as SignupStaffPayload } from "@/Stores/authStore";

type StaffSignUpProps = {
  isOpen: boolean;
  isClose: () => void;
};

type Field = {
  label: string;
  name: keyof FormState;
  type: string;
  placeholder: string;
};

type FormState = SignupStaffPayload & {
  confirmPassword: string;
};

export function CreateStaff({ isOpen, isClose }: StaffSignUpProps) {
  if (!isOpen) return null;

  const signupStaff = authUserStore((state) => state.signupStaff);

  const [staffData, setStaffData] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fields: Field[] = [
    {
      label: "Username",
      name: "username",
      type: "text",
      placeholder: "JohnDoe123",
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "me@example.com",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      placeholder: "••••••••",
    },
    {
      label: "Confirm Password",
      name: "confirmPassword",
      type: "password",
      placeholder: "••••••••",
    },
  ];

  const handleValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStaffData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
        setError(null);
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const { username, email, password, confirmPassword } = staffData;

        if (!username || !email || !password || !confirmPassword) {
            setError("All fields are required.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await signupStaff({ username, email, password });
            isClose(); // ✅ Only close modal on success
        } catch (err: any) {
            setError(err.message); // ✅ This will show the backend error like "Staff creation limit reached"
        } finally {
            setLoading(false);
        }
    };


  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={isClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-[22rem] rounded-2xl bg-white p-6 shadow-lg mx-2 dark:border dark:bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Register Staff</h2>
          <button
            onClick={isClose}
            aria-label="Close modal"
            className="rounded p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {fields.map(({ label, name, type, placeholder }) => (
            <div className="grid gap-1" key={name}>
              <Label htmlFor={name}>{label}</Label>
              <Input
                id={name}
                name={name}
                type={type}
                placeholder={placeholder}
                value={staffData[name]}
                onChange={handleValue}
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded bg-black py-2 text-white hover:bg-gray-800 transition disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
