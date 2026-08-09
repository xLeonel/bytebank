"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TriangleAlert } from "lucide-react";
import { validateForm } from "../RegisterModal/helpers";
import type { RegisterFormData } from "../RegisterModal/types";
import { Field } from "@/app/(logged)/_components/Field";
import { setSession } from "@/lib/session";
import http from "@/http";

const inputCls =
  "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--bb-primary,#374C34)] focus:border-transparent";

const errorCls = "text-[var(--bb-error,#D8353A)] text-xs";

const emptyForm: RegisterFormData = {
  name: "",
  email: "",
  password: "",
  terms: false,
  agency: "",
  bankAccount: "",
};

/**
 * Formulário de cadastro reutilizável (página /cadastro e modal do /login).
 * Envia para POST /users; chama onSuccess ao concluir.
 */
export function RegisterForm({ onSuccess }: { onSuccess?: () => void }) {
  const [formData, setFormData] = useState<RegisterFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Agência: apenas dígitos (até 5).
  const handleAgencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 5);
    setFormData((prev) => ({ ...prev, agency: digits }));
    if (errors.agency) setErrors((prev) => ({ ...prev, agency: "" }));
  };

  // Conta: apenas dígitos, formatada como 00000-0 (dígito verificador após o hífen).
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
    const formatted = digits.length > 1 ? `${digits.slice(0, -1)}-${digits.slice(-1)}` : digits;
    setFormData((prev) => ({ ...prev, bankAccount: formatted }));
    if (errors.bankAccount) setErrors((prev) => ({ ...prev, bankAccount: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setSubmitError("");
    setSubmitting(true);
    const { email, password } = formData;
    try {
      const response = await http.post("/users", {
        name: formData.name,
        email,
        password,
        agency: formData.agency,
        bankAccount: formData.bankAccount,
      });
      if (response.status !== 201) {
        throw new Error("Falha ao cadastrar usuário");
      }
      setFormData(emptyForm);
      onSuccess?.();

      // Auto-login: entra direto na área logada após cadastrar.
      try {
        const tokenRes = await http.post("/auth/token", { email, password });
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
        // Cadastro OK, mas login automático falhou → login manual.
        router.push("/login");
      }
      return;
    } catch (error: unknown) {
      const apiMessage =
        (error as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message;
      let message = "Não foi possível criar a conta. Tente novamente.";
      if (Array.isArray(apiMessage)) {
        message = apiMessage.some((m) => /duplicat/i.test(m))
          ? "Já existe um usuário cadastrado com este e-mail."
          : apiMessage.join(", ");
      } else if (typeof apiMessage === "string") {
        message = /duplicat/i.test(apiMessage)
          ? "Já existe um usuário cadastrado com este e-mail."
          : apiMessage;
      }
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Nome completo">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Seu nome"
          className={inputCls}
        />
        {errors.name && <span className={errorCls}>{errors.name}</span>}
      </Field>

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
            placeholder="Mínimo 6 caracteres"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Agência">
          <input
            type="text"
            inputMode="numeric"
            name="agency"
            value={formData.agency}
            onChange={handleAgencyChange}
            placeholder="0001"
            className={inputCls}
          />
          {errors.agency && <span className={errorCls}>{errors.agency}</span>}
        </Field>

        <Field label="Conta bancária">
          <input
            type="text"
            inputMode="numeric"
            name="bankAccount"
            value={formData.bankAccount}
            onChange={handleAccountChange}
            placeholder="12345-6"
            className={inputCls}
          />
          {errors.bankAccount && <span className={errorCls}>{errors.bankAccount}</span>}
        </Field>
      </div>

      <label className="flex items-start gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          name="terms"
          checked={formData.terms}
          onChange={handleChange}
          className="mt-1 h-4 w-4 accent-[var(--bb-primary,#374C34)]"
        />
        <span>
          Li e estou ciente quanto às condições de tratamento dos meus dados conforme descrito na
          Política de Privacidade do banco.
        </span>
      </label>
      {errors.terms && <span className={errorCls}>{errors.terms}</span>}

      {submitError && (
        <div role="alert" className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
          <TriangleAlert size={18} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 w-full rounded-md py-2.5 font-bold transition bg-[var(--bb-warning,#f59e0b)] text-[var(--bb-dark,#332E2B)] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {submitting ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
