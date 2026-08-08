"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { validateLoginForm } from "../LoginModal/helpers";
import type { LoginFormData } from "../LoginModal/types";
import { Field } from "@/app/(logged)/_components/Field";
import { setSession } from "@/lib/session";
import http from "@/http";

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bb-primary,#374C34)] focus:border-transparent";

const errorCls = "text-[var(--bb-error,#D8353A)] text-xs";
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Formulário de login reutilizável. Autentica em /auth/token, grava a sessão
 * e redireciona para /home.
 */
export function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  const isFormValid = emailRegex.test(formData.email) && formData.password.length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateLoginForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    try {
      const tokenRes = await http.post("/auth/token", {
        email: formData.email,
        password: formData.password,
      });
      const accessToken = tokenRes.data.accessToken;
      sessionStorage.setItem("token", accessToken);
      const profile = (await http.get("/auth/profile")).data;
      setSession(accessToken, {
        userId: profile._id ?? profile.id ?? profile.userId ?? profile.sub,
        login: profile.email,
        fullName: profile.name,
        firstName: (profile.name ?? "").split(" ")[0],
      });
      router.push("/home");
    } catch {
      setSubmitError("E-mail ou senha inválidos. Verifique e tente novamente.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Email">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          className={inputCls}
        />
        {errors.email && <span className={errorCls}>{errors.email}</span>}
      </Field>

      <Field label="Senha">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Digite sua senha"
            className={inputCls}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 text-sm"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        {errors.password && <span className={errorCls}>{errors.password}</span>}
      </Field>

      {submitError && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !isFormValid}
        className="mt-2 w-full rounded-md py-2.5 font-bold transition bg-[var(--bb-warning,#f59e0b)] text-[var(--bb-dark,#332E2B)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
