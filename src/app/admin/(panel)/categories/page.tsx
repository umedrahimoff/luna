import { redirect } from "next/navigation";

/** Legacy URL: categories moved under References. */
export default function AdminCategoriesLegacyRedirect() {
  redirect("/admin/references/categories");
}
