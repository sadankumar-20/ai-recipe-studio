import { ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { APP_NAME } from "../../constants";

export default function Logo() {
  return (
    <Link to="/" className="focus-ring flex items-center gap-2 rounded-md">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-black">
        <ChefHat size={18} strokeWidth={2.5} />
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-white">
        {APP_NAME}
      </span>
    </Link>
  );
}
