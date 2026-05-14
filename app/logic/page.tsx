import { redirect } from "next/navigation";

export default function LogicRedirectPage() {
  redirect("/auth/login");
}
