"use client";

import {
  addToast,
  Button,
  ButtonGroup,
  Chip,
  InputOtp,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { RiLockPasswordLine } from "@remixicon/react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import {
  DEFAULT_PASSWORD_LENGTH,
  PasswordLength,
  PASSWORD_LENGTH_OPTIONS,
  isPasswordLength,
  isValidNumericPassword,
} from "@/utils/password";

export default function PasswordSettings() {
  const t = useTranslations("password");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [passwordLength, setPasswordLength] = useState<PasswordLength>(DEFAULT_PASSWORD_LENGTH);
  const [password, setPassword] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLoading(true);
    setError("");
    fetch("/api/settings/password")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load password settings");
        }

        return res.json();
      })
      .then((data) => {
        const nextLength = isPasswordLength(data.passwordLength) ? data.passwordLength : DEFAULT_PASSWORD_LENGTH;

        setPasswordLength(nextLength);
        setIsPasswordSet(Boolean(data.isSet));
        setPassword("");
      })
      .catch(() => {
        setError(t("loadFailed"));
      })
      .finally(() => setLoading(false));
  }, [isOpen, t]);

  const handleLengthChange = (nextLength: PasswordLength) => {
    setPasswordLength(nextLength);
    setPassword((current) => current.slice(0, nextLength));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValidNumericPassword(password, passwordLength)) {
      setError(t("invalidPassword", { length: passwordLength }));
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/settings/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password, passwordLength }),
      });

      if (res.status === 403) {
        addToast({ color: "warning", description: t("demoMode") });
        return;
      }

      if (!res.ok) {
        throw new Error(t("saveFailed"));
      }

      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePassword = async () => {
    setRemoving(true);
    setError("");

    try {
      const res = await fetch("/api/settings/password", {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error(t("removeFailed"));
      }

      setIsPasswordSet(false);
      setPassword("");
      setPasswordLength(DEFAULT_PASSWORD_LENGTH);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : t("removeFailed"));
    } finally {
      setRemoving(false);
    }
  };

  return (
    <>
      <RiLockPasswordLine className="cursor-pointer" onClick={onOpen} size={22} />
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalContent>
          <ModalHeader className="items-center gap-2">
            {t("title")}
            {!loading && (
              <Chip color={isPasswordSet ? "success" : "warning"} size="sm" variant="flat">
                {isPasswordSet ? t("enabled") : t("disabled")}
              </Chip>
            )}
          </ModalHeader>
          <form onSubmit={handleSubmit}>
            <ModalBody>
              {loading ? (
                <div className="flex min-h-32 items-center justify-center">
                  <Spinner size="lg" variant="gradient" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <ButtonGroup size="sm">
                    {PASSWORD_LENGTH_OPTIONS.map((length) => (
                      <Button
                        key={length}
                        color={passwordLength === length ? "primary" : "default"}
                        variant={"bordered"}
                        onPress={() => handleLengthChange(length)}
                      >
                        {t("lengthOption", { length })}
                      </Button>
                    ))}
                  </ButtonGroup>
                  <InputOtp
                    isRequired
                    allowedKeys="^[0-9]*$"
                    description={t("description")}
                    errorMessage={error}
                    isInvalid={Boolean(error)}
                    length={passwordLength}
                    type="password"
                    value={password}
                    onValueChange={(value) => {
                      setPassword(value.replace(/\D/g, "").slice(0, passwordLength));
                      setError("");
                    }}
                  />
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              {isPasswordSet && (
                <Button
                  color="danger"
                  variant="light"
                  onPress={handleRemovePassword}
                  isLoading={removing}
                  isDisabled={saving || loading}
                >
                  {t("remove")}
                </Button>
              )}
              <Button variant="bordered" onPress={onClose} isDisabled={saving || removing}>
                {t("cancel")}
              </Button>
              <Button
                color="primary"
                type="submit"
                isLoading={saving}
                isDisabled={loading || removing || password.length !== passwordLength}
              >
                {isPasswordSet ? t("update") : t("save")}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}
