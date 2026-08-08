"use client";

import Link from "next/link";
import { PublicNavbar } from "@/app/_components/PublicNavbar";
import { RegisterForm } from "../components/RegisterForm";

export default function Cadastro() {
  return (
    <div className="min-h-screen bg-[#e7efe5] flex flex-col">
      <PublicNavbar showRegister={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-md shadow-sm p-8">
          <h1 className="text-2xl font-bold text-center text-[var(--bb-dark,#332E2B)] mb-1">
            Criar conta
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Preencha os campos abaixo para abrir sua conta.
          </p>

          {/* Ao concluir, o RegisterForm faz auto-login e redireciona para /home */}
          <RegisterForm />

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-[var(--bb-primary,#374C34)] hover:underline"
            >
              Entrar
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
