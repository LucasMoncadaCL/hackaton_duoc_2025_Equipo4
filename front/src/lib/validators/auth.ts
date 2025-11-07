import { z } from "zod";

const emailSchema = z
  .string({ required_error: "El correo es obligatorio" })
  .trim()
  .min(1, "El correo es obligatorio")
  .email("Correo inválido")
  .transform((value) => value.toLowerCase());

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z
      .string({ required_error: "Debes confirmar la contraseña" })
      .min(6, "La confirmación debe tener al menos 6 caracteres"),
    firstName: z
      .string({ required_error: "El nombre es obligatorio" })
      .trim()
      .min(1, "El nombre es obligatorio")
      .max(120, "El nombre es demasiado largo"),
    lastName: z
      .string({ required_error: "El apellido es obligatorio" })
      .trim()
      .min(1, "El apellido es obligatorio")
      .max(120, "El apellido es demasiado largo"),
    age: z
      .string({ required_error: "La edad es obligatoria" })
      .trim()
      .transform((value) => Number.parseInt(value, 10))
      .refine((value) => Number.isInteger(value), {
        message: "La edad debe ser un número entero",
      })
      .refine((value) => value >= 18 && value <= 120, {
        message: "Edad debe estar entre 18 y 120 años",
      }),
    sex: z.enum(["M", "F"], {
      required_error: "Debes seleccionar el sexo",
      invalid_type_error: "Selecciona un sexo válido",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Las contraseñas no coinciden",
      });
    }
  })
  .transform(({ confirmPassword, ...rest }) => {
    void confirmPassword;
    return rest;
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

