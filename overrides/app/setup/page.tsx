import { redirect } from "next/navigation";

export default function SetupPage(): never {
  redirect("/admin/login");
}
