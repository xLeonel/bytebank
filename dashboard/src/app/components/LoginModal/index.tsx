// src/app/components/LoginModal/index.tsx
"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Modal, ModalHeader } from "@/app/(logged)/_components/Modal";
import { BTN_PRIMARY_CLS, Field, INPUT_CLS } from "@/app/(logged)/_components/Field";
import { validateLoginForm } from "./helpers";
import type { Props, LoginFormData } from "./types";

export function LoginModal({ open, onClose, onSubmit, errorMessage, onCadastroClick, onReset }: Props) {
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };
  const handleReset = () => {
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
   if (onReset) {
      onReset();  
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateLoginForm(formData);

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    if (onSubmit) {
      onSubmit(formData);
    }

  };

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} ariaLabel="Login">
      <ModalHeader
        icon={<LogIn size={64} />}
        title="Faça login para acessar sua conta!"
      />

    {errorMessage && (
      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
        <p className="text-red-700 text-sm">{errorMessage}</p>
      </div>
    )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <Field label="Email">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Digite seu email"  
            className={INPUT_CLS}
          />
          {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
        </Field>

        {/* Senha */}
        <Field label="Senha">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Digite sua senha"
              className={INPUT_CLS}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
        </Field>
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p className="text-red-700 text-sm font-semibold mb-2">{errorMessage}</p>
            <button
              type="button"
              onClick={onCadastroClick}
              className="text-red-600 hover:text-red-800 text-sm font-semibold underline cursor-pointer"
            >
              Não tem conta? Faça seu cadastro aqui
            </button>
          </div>
        )}
       <div className="flex gap-2 mt-4">
          <button type="submit" className={`${BTN_PRIMARY_CLS} flex-1`}>
            Entrar
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded cursor-pointer flex-1"
          >
            Limpar
          </button>
        </div>
      </form>
    </Modal>
  );
}