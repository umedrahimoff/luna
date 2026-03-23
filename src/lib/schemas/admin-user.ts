import { z } from "zod";
import { registerSchema } from "@/lib/schemas/auth";

/** Literals instead of `UserRole` from `@prisma/client` — enum may be undefined at module load (Turbopack). */
const USER_ROLES = ["USER", "MODERATOR", "ADMIN"] as const;

const userRoleSchema = z.enum(USER_ROLES, {
  message: "Invalid role",
});

/** Admin user creation — same rules as registration + role. */
export const adminUserCreateSchema = registerSchema.extend({
  role: userRoleSchema.default("USER"),
});

export const adminUserUpdateSchema = z
  .object({
    name: z.string().trim().min(1, "Enter name").max(120),
    email: z.string().trim().email("Invalid email").max(320),
    password: z.string().max(200),
    role: userRoleSchema,
  })
  .superRefine((data, ctx) => {
    const p = data.password.trim();
    if (p.length > 0 && p.length < 8) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 8 characters",
        path: ["password"],
      });
    }
  });

export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
