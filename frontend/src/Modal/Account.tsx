import { Input } from "@/components/ui/input";
import axios from "@/lib/axios";
import { authUserStore, type userUpdateLoad } from "@/Stores/authStore";
import { Label } from "@radix-ui/react-dropdown-menu";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type accountType = {
  isOpen: boolean;
  isClose: () => void;
  userData: userUpdateLoad | null;
};

export function Account({ isOpen, isClose, userData }: accountType) {
  if (!isOpen) return null;

  const [user, setUsers] = useState<userUpdateLoad>({
    username: "",
    email: "",
    image: "",
  });

  const { setUser } = authUserStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userData) {
      setUsers({
        username: userData.username ?? "",
        email: userData.email ?? "",
        image: userData.image ?? "",
        id: userData.id,
        staff_id: userData.staff_id,
        admin_id: userData.admin_id,
        role: userData.role,
      });
    }
  }, [userData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user.username || !user.email) {
      console.log("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        ...user,
        id: userData?.id,
        staff_id: userData?.staff_id,
        admin_id: userData?.admin_id,
        role: userData?.role,
      };

      const res = await axios.put("/auth/account", payload);
      const updateuser = res.data.account;

      setUser(updateuser);
      isClose();
    } catch (err: any) {
      console.error("Update failed:", err.response?.data || err.message);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUsers((prev) => ({
          ...prev,
          image: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center"
      onClick={isClose}
      role="dialog"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-black p-5 rounded shadow space-y-3 w-[27rem] mx-2"
      >
        <div className="flex justify-between items-center">
          <h1 className="text-lg font-medium">Edit profile</h1>
          <button onClick={isClose}>
            <X size={17} />
          </button>
        </div>

        <p className="text-sm text-black/70 dark:text-white/60">
          Make changes to your profile here. Click save when you're done.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Profile image upload + preview */}
          <div className="flex justify-center">
            <div
              className="relative group cursor-pointer"
              onClick={triggerFileInput}
            >
              <img
                src={user.image || "/placeholder.png"}
                alt="Profile"
                className="w-34 h-34 rounded-full object-cover border shadow"
              />
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
                Change
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* Name and Email inputs */}
          {[
            ["Name", "username"],
            ["Email", "email"],
          ].map(([label, name]) => (
            <div key={name}>
              <Label className="font-medium">{label}</Label>
              <Input
                name={name}
                type="text"
                value={user[name as keyof userUpdateLoad] as string}
                onChange={(e) =>
                  setUser({ ...user, [name]: e.target.value })
                }
                readOnly={name === "email"}
              />
            </div>
          ))}

          <button
            type="submit"
            className="mt-4 w-full bg-black hover:bg-black/50 text-white py-2 px-4 rounded dark:bg-white dark:text-black dark:hover:bg-white/60"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
