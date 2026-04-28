"use client";

import { Button, InputOtp } from "@heroui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Logo } from "@/components/icons";
import { DEFAULT_PASSWORD_LENGTH, isValidNumericPassword, normalizePasswordLength } from "@/utils/password";

export default function LoginPage() {
  const t = useTranslations("password");
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordLength = normalizePasswordLength(searchParams.get("length") ?? DEFAULT_PASSWORD_LENGTH);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidNumericPassword(password, passwordLength)) {
      setError(t("invalidPassword", { length: passwordLength }));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const nextLength = normalizePasswordLength(data.passwordLength);

        router.replace(`/login?length=${nextLength}`);
        setPassword("");
        setError(t("loginFailed"));
        return;
      }

      router.replace("/");
    } catch {
      setError(t("loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 rounded-large border border-default-200 bg-content1 p-8 shadow-small">
        <Logo />
        <div className="text-center">
          <h1 className="text-xl font-semibold">{t("loginTitle")}</h1>
          <p className="mt-2 text-sm text-default-500">{t("loginDescription", { length: passwordLength })}</p>
        </div>
        <form className="flex w-full flex-col items-center gap-4" onSubmit={handleSubmit}>
          <InputOtp
            isRequired
            allowedKeys="^[0-9]*$"
            errorMessage={error}
            isInvalid={Boolean(error)}
            length={passwordLength}
            type="password"
            value={password}
            onComplete={() => setError("")}
            onValueChange={(value) => {
              setPassword(value.replace(/\D/g, "").slice(0, passwordLength));
              setError("");
            }}
          />
          <Button color="primary" fullWidth type="submit" isLoading={loading}>
            {t("login")}
          </Button>
        </form>
      </div>
    </main>
  );
}
