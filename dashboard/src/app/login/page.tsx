"use client";

import Link from "next/link";
import { PublicNavbar } from "@/app/_components/PublicNavbar";
import { LoginForm } from "../components/LoginForm";

export default function Login() {
  return (
    <div className="min-h-screen bg-[#e7efe5] flex flex-col">
      <PublicNavbar showLogin={false} />

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-md shadow-sm p-8">
          <h1 className="text-2xl font-bold text-center text-[var(--bb-dark,#332E2B)] mb-1">
            Entrar
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">
            Entre com seus dados para acessar sua conta.
          </p>

          <LoginForm />

          <p className="text-center text-sm text-gray-500 mt-6">
            Ainda não tem conta?{" "}
            <Link
              href="/cadastro"
              className="font-semibold text-[var(--bb-primary,#374C34)] hover:underline"
            >
              Criar conta
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
