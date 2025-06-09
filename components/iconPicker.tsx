"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";
import { useTranslations } from "next-intl";

import { Icon } from "@/types";
import { fetchWithTime } from "@/utils/fetchWithTime";
import { uuid } from "@/utils/uuid";

interface IconPickerProps {
  value?: string;
  onChange: (iconKey: string) => void;
}

interface DeleteConfirmProps {
  isOpen: boolean;
  iconKey: string;
  onClose: () => void;
  onConfirm: () => void;
  isUsed?: boolean;
}

function DeleteConfirmModal({ isOpen, iconKey, onClose, onConfirm, isUsed }: DeleteConfirmProps) {
  const t = useTranslations("iconPicker");

  return (
    <Modal isOpen={isOpen} size="sm" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t("deleteIconTitle")}</ModalHeader>
        <ModalBody>
          <p>{t("deleteIconWarning")}</p>
          {isUsed !== undefined && (
            <p className={`mt-2 text-sm ${isUsed ? "text-warning" : "text-default-500"}`}>
              {isUsed ? t("deleteIconInUse") : t("deleteIconNotInUse")}
            </p>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="light" onPress={onClose}>
            {t("cancel")}
          </Button>
          <Button color="danger" onPress={onConfirm}>
            {t("confirmDelete")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(value);
  const [tempSelectedIcon, setTempSelectedIcon] = useState<string | undefined>(value);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newIconKey, setNewIconKey] = useState(uuid());
  const [newIconSvg, setNewIconSvg] = useState("");
  const [newIconName, setNewIconName] = useState("");
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ iconKey: string; isUsed?: boolean } | null>(null);
  const [iconsLoaded, setIconsLoaded] = useState(false);

  const t = useTranslations("iconPicker");

  useEffect(() => {
    setSelectedIcon(value);
    setTempSelectedIcon(value);
  }, [value]);

  // Load icons on component mount if we have a value
  useEffect(() => {
    if (value && !iconsLoaded) {
      fetchIcons();
    }
  }, [value, iconsLoaded]);

  useEffect(() => {
    if (isOpen) {
      fetchIcons();
      // Reset temp selection to current value when opening
      setTempSelectedIcon(selectedIcon);
    }
  }, [isOpen, selectedIcon]);

  const fetchIcons = async () => {
    try {
      const response = await fetchWithTime("/api/icons");
      const data = await response.json();

      setIcons(data);
      setIconsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch icons:", error);
    }
  };

  const handleCreateIcon = async () => {
    setError("");

    if (!newIconSvg) {
      setError(t("iconRequired"));

      return;
    }

    try {
      const response = await fetchWithTime("/api/icons", {
        method: "POST",
        body: JSON.stringify({
          key: newIconKey,
          svg: newIconSvg,
          name: newIconName || newIconKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        if (data.error === "Icon key already exists") {
          setError(t("iconKeyExists"));
        } else if (data.error === "Invalid SVG content") {
          setError(t("invalidSvgContent"));
        } else if (data.error === "Invalid icon key") {
          setError(t("invalidIconKey"));
        } else if (data.error === "Icon key can only contain letters, numbers, and hyphens") {
          setError(t("iconKeyFormat"));
        } else if (data.error === "Failed to sanitize SVG content") {
          setError(t("dangerousSvgContent"));
        } else {
          setError(t("failedToCreateIcon"));
        }

        return;
      }

      // Reset form and refresh icons
      setNewIconKey("");
      setNewIconSvg("");
      setNewIconName("");
      setIsCreating(false);
      setIsEditing(false);
      await fetchIcons();

      // Select the newly created icon
      setTempSelectedIcon(newIconKey);
    } catch (error) {
      setError(t("failedToCreateIcon"));
    }
  };

  const handleUpdateIcon = async () => {
    setError("");

    if (!newIconSvg) {
      setError(t("iconRequired"));

      return;
    }

    try {
      const response = await fetchWithTime("/api/icons", {
        method: "PUT",
        body: JSON.stringify({
          key: newIconKey,
          svg: newIconSvg,
          name: newIconName || newIconKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        if (data.error === "Icon key already exists") {
          setError(t("iconKeyExists"));
        } else if (data.error === "Invalid SVG content") {
          setError(t("invalidSvgContent"));
        } else if (data.error === "Invalid icon key") {
          setError(t("invalidIconKey"));
        } else if (data.error === "Icon key can only contain letters, numbers, and hyphens") {
          setError(t("iconKeyFormat"));
        } else if (data.error === "Failed to sanitize SVG content") {
          setError(t("dangerousSvgContent"));
        } else {
          setError(t("failedToUpdateIcon"));
        }

        return;
      }

      // Reset form and refresh icons
      setNewIconKey("");
      setNewIconSvg("");
      setNewIconName("");
      setIsCreating(false);
      setIsEditing(false);
      await fetchIcons();

      // Select the newly created icon
      setTempSelectedIcon(newIconKey);
    } catch (error) {
      setError(t("failedToCreateIcon"));
    }
  };

  const handleDeleteIcon = async (iconKey: string) => {
    try {
      const response = await fetchWithTime("/api/icons", {
        method: "DELETE",
        body: JSON.stringify({ key: iconKey }),
      });

      if (!response.ok) {
        console.error("Failed to delete icon");

        return;
      }

      const result = await response.json();

      // If the deleted icon was selected, clear selection
      if (tempSelectedIcon === iconKey) {
        setTempSelectedIcon(undefined);
      }
      if (selectedIcon === iconKey) {
        setSelectedIcon(undefined);
        onChange("");
      }

      // Refresh icon list
      await fetchIcons();

      // Show usage warning if icon was in use
      if (result.wasUsed) {
        // The warning was already shown in the confirmation dialog
      }
    } catch (error) {
      console.error("Failed to delete icon:", error);
    }
  };

  const checkIconUsage = async (iconKey: string) => {
    try {
      const response = await fetchWithTime(`/api/icons/${iconKey}/usage`);

      if (response.ok) {
        const result = await response.json();

        return result.isUsed;
      }
    } catch (error) {
      console.error("Failed to check icon usage:", error);
    }

    return undefined;
  };

  const renderIcon = (iconKey: string) => {
    const icon = icons.find((i) => i.key === iconKey);

    if (!icon) return null;

    return (
      <div
        dangerouslySetInnerHTML={{ __html: icon.svg }}
        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
      />
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsCreating(false);
    setIsEditing(false);
    setError("");
    setNewIconKey("");
    setNewIconSvg("");
    setNewIconName("");
    // Reset temp selection
    setTempSelectedIcon(selectedIcon);
  };

  const handleConfirm = () => {
    if (tempSelectedIcon) {
      setSelectedIcon(tempSelectedIcon);
      onChange(tempSelectedIcon);
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative inline-flex">
        <Button
          className="h-14 w-14 min-w-0 p-0 flex items-center justify-center"
          variant="flat"
          onPress={() => setIsOpen(true)}
        >
          {selectedIcon ? (
            <div className="w-7 h-7 flex items-center justify-center">{renderIcon(selectedIcon)}</div>
          ) : (
            <svg
              fill="currentColor"
              height={30}
              opacity={0.7}
              version="1.1"
              viewBox="0 0 1024 1024"
              width={30}
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M952.16 428.07c5.15 27.18 7.84 55.26 7.84 83.93 0 247.41-200.59 448-448 448S64 759.41 64 512 264.59 64 512 64c33.52 0 66.15 3.7 97.55 10.64l-12.13 54.69c-27.81-6.2-56.37-9.33-85.42-9.33-216.5 0-392 175.5-392 392 0 216.49 175.5 392 392 392 216.49 0 392-175.5 392-392 0-24.9-2.31-49.47-6.87-73.51l55.03-10.42zM344 474.66c-30.93 0-56-25.07-56-56s25.07-56 56-56 56 25.07 56 56c0 30.94-25.07 56-56 56z m336 0c-30.93 0-56-25.07-56-56s25.07-56 56-56 56 25.07 56 56c0 30.94-25.07 56-56 56z m102.67-289.33V92c0-15.46 12.54-28 28-28s28 12.54 28 28v93.33H932c15.46 0 28 12.53 28 28s-12.54 28-28 28h-93.34v93.33c0 15.46-12.54 28-28 28-15.47 0-28-12.54-28-28v-93.33h-93.33c-15.46 0-28-12.53-28-28s12.54-28 28-28h93.34zM344.75 613.92c-5.16-14.59 2.49-30.6 17.08-35.75 14.59-5.16 30.6 2.49 35.75 17.08 17.04 48.22 62.49 80.59 113.64 80.92 51.15 0.34 97.01-31.43 114.69-79.43 5.44-14.35 21.42-21.65 35.83-16.36 14.41 5.29 21.87 21.2 16.73 35.66-25.82 70.16-92.84 116.59-167.59 116.12-74.75-0.48-141.17-47.77-166.09-118.24h-0.04z m0 0" />
            </svg>
          )}
        </Button>
        {selectedIcon && (
          <Button
            isIconOnly
            className="absolute -top-2 -right-2 min-w-0 w-4 h-4 p-0"
            color="danger"
            radius="full"
            size="sm"
            variant="solid"
            onPress={() => {
              setSelectedIcon(undefined);
              setTempSelectedIcon(undefined);
              onChange("");
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </Button>
        )}
      </div>

      <Modal isOpen={isOpen} size="xl" onClose={handleClose}>
        <ModalContent>
          <ModalHeader>{isCreating ? t("createNewIcon") : isEditing ? t("editIcon") : t("selectIcon")}</ModalHeader>
          <ModalBody>
            {isCreating || isEditing ? (
              <div className="space-y-4">
                <Input
                  description={t("uniqueIdentifier")}
                  isInvalid={!!error && !newIconKey}
                  label={t("iconKey")}
                  placeholder={t("iconKeyPlaceholder")}
                  value={newIconKey}
                  onChange={(e) => setNewIconKey(e.target.value)}
                />
                <Input
                  label={t("iconName")}
                  placeholder={t("iconNamePlaceholder")}
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                />
                <Textarea
                  description={t("pasteSvgCode")}
                  isInvalid={!!error && !newIconSvg}
                  label={t("svgContent")}
                  minRows={4}
                  placeholder={t("svgContentPlaceholder")}
                  value={newIconSvg}
                  onChange={(e) => setNewIconSvg(e.target.value)}
                />
                {newIconSvg && (
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t("preview")}</p>
                    <div dangerouslySetInnerHTML={{ __html: newIconSvg }} className="w-12 h-12" />
                  </div>
                )}
                {error && <p className="text-sm text-danger">{error}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {icons.map((icon) => (
                    <div key={icon.key} className="relative">
                      <Tooltip content={icon.name}>
                        <Button
                          className="h-14 w-full p-2 flex items-center justify-center"
                          size="md"
                          variant={tempSelectedIcon === icon.key ? "solid" : "light"}
                          onPress={() => setTempSelectedIcon(icon.key)}
                        >
                          <div dangerouslySetInnerHTML={{ __html: icon.svg }} className="w-6 h-6 flex-shrink-0" />
                        </Button>
                      </Tooltip>
                    </div>
                  ))}
                </div>
                <Button
                  className="w-full"
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
                    </svg>
                  }
                  variant="light"
                  onPress={() => {
                    setIsCreating(true);
                    setNewIconKey(uuid());
                  }}
                >
                  {t("createNewIcon")}
                </Button>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {isCreating || isEditing ? (
              <>
                {isEditing && (
                  <Button
                    color="danger"
                    variant="light"
                    onPress={async () => {
                      const isUsed = await checkIconUsage(newIconKey);

                      setDeleteConfirm({ iconKey: newIconKey, isUsed });

                      setIsEditing(false);
                    }}
                  >
                    {t("deleteIcon")}
                  </Button>
                )}
                <Button
                  color="primary"
                  variant="bordered"
                  onPress={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setError("");
                    setNewIconKey("");
                    setNewIconSvg("");
                    setNewIconName("");
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button color="primary" onPress={isCreating ? handleCreateIcon : handleUpdateIcon}>
                  {isCreating ? t("createIcon") : t("updateIcon")}
                </Button>
              </>
            ) : (
              <>
                {tempSelectedIcon && (
                  <Button
                    color="primary"
                    variant="light"
                    onPress={() => {
                      setIsEditing(true);
                      setNewIconKey(tempSelectedIcon);
                      setNewIconSvg(icons.find((i) => i.key === tempSelectedIcon)?.svg || "");
                      setNewIconName(icons.find((i) => i.key === tempSelectedIcon)?.name || "");
                    }}
                  >
                    {t("editIcon")}
                  </Button>
                )}
                <Button color="primary" variant="bordered" onPress={handleClose}>
                  {t("cancel")}
                </Button>
                <Button color="primary" isDisabled={!tempSelectedIcon} onPress={handleConfirm}>
                  {t("select")}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DeleteConfirmModal
        iconKey={deleteConfirm?.iconKey || ""}
        isOpen={!!deleteConfirm}
        isUsed={deleteConfirm?.isUsed}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            handleDeleteIcon(deleteConfirm.iconKey);
            setDeleteConfirm(null);
          }
        }}
      />
    </>
  );
}
