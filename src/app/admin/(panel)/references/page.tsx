import { permanentRedirect } from "next/navigation";

/** Hub without overview: land on Categories. */
export default function AdminReferencesRedirect() {
  permanentRedirect("/admin/references/categories");
}
