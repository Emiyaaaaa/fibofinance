"use client";

import { useState, useEffect } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";
import { useTranslations } from "next-intl";

import { Icon } from "@/types";
import { fetchWithTime } from "@/utils/fetchWithTime";

interface IconPickerProps {
  value?: string;
  onChange: (iconKey: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [icons, setIcons] = useState<Icon[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(value);
  const [tempSelectedIcon, setTempSelectedIcon] = useState<string | undefined>(value);
  const [isCreating, setIsCreating] = useState(false);
  const [newIconKey, setNewIconKey] = useState("");
  const [newIconSvg, setNewIconSvg] = useState("");
  const [newIconName, setNewIconName] = useState("");
  const [error, setError] = useState("");

  const t = useTranslations("iconPicker");

  useEffect(() => {
    setSelectedIcon(value);
    setTempSelectedIcon(value);
  }, [value]);

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
    } catch (error) {
      console.error("Failed to fetch icons:", error);
    }
  };

  const handleCreateIcon = async () => {
    setError("");
    
    if (!newIconKey || !newIconSvg) {
      setError(t("iconKeyRequired"));
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
      await fetchIcons();
      
      // Select the newly created icon
      setTempSelectedIcon(newIconKey);
    } catch (error) {
      setError(t("failedToCreateIcon"));
    }
  };

  const renderIcon = (iconKey: string) => {
    const icon = icons.find(i => i.key === iconKey);
    if (!icon) return null;
    
    return (
      <div 
        className="w-6 h-6 flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsCreating(false);
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
          size="sm"
          variant="light"
          onPress={() => setIsOpen(true)}
          className="min-w-0 p-2"
        >
          {selectedIcon ? (
            renderIcon(selectedIcon)
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </Button>
        {selectedIcon && (
          <Button
            isIconOnly
            size="sm"
            radius="full"
            variant="solid"
            color="danger"
            className="absolute -top-1 -right-1 min-w-0 w-4 h-4 p-0"
            onPress={(e) => {
              e.stopPropagation();
              setSelectedIcon(undefined);
              setTempSelectedIcon(undefined);
              onChange("");
            }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        size="xl"
      >
        <ModalContent>
          <ModalHeader>
            {isCreating ? t("createNewIcon") : t("selectIcon")}
          </ModalHeader>
          <ModalBody>
            {isCreating ? (
              <div className="space-y-4">
                <Input
                  label={t("iconKey")}
                  placeholder={t("iconKeyPlaceholder")}
                  value={newIconKey}
                  onChange={(e) => setNewIconKey(e.target.value)}
                  description={t("uniqueIdentifier")}
                  isInvalid={!!error && !newIconKey}
                />
                <Input
                  label={t("iconName")}
                  placeholder={t("iconNamePlaceholder")}
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                />
                <Textarea
                  label={t("svgContent")}
                  placeholder={t("svgContentPlaceholder")}
                  value={newIconSvg}
                  onChange={(e) => setNewIconSvg(e.target.value)}
                  minRows={4}
                  description={t("pasteSvgCode")}
                  isInvalid={!!error && !newIconSvg}
                />
                {newIconSvg && (
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t("preview")}</p>
                    <div 
                      className="w-12 h-12"
                      dangerouslySetInnerHTML={{ __html: newIconSvg }}
                    />
                  </div>
                )}
                {error && (
                  <p className="text-sm text-danger">{error}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                  {icons.map((icon) => (
                    <Tooltip key={icon.key} content={icon.name || icon.key}>
                      <Button
                        size="md"
                        variant={tempSelectedIcon === icon.key ? "solid" : "light"}
                        onPress={() => setTempSelectedIcon(icon.key)}
                        className="h-14 w-full p-2 flex items-center justify-center"
                      >
                        <div 
                          className="w-6 h-6 flex-shrink-0"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                      </Button>
                    </Tooltip>
                  ))}
                </div>
                <Button
                  variant="light"
                  onPress={() => setIsCreating(true)}
                  className="w-full"
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  {t("createNewIcon")}
                </Button>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {isCreating ? (
              <>
                <Button 
                  color="danger" 
                  variant="light" 
                  onPress={() => {
                    setIsCreating(false);
                    setError("");
                    setNewIconKey("");
                    setNewIconSvg("");
                    setNewIconName("");
                  }}
                >
                  {t("cancel")}
                </Button>
                <Button color="primary" onPress={handleCreateIcon}>
                  {t("createIcon")}
                </Button>
              </>
            ) : (
              <>
                <Button color="danger" onPress={handleClose}>
                  {t("cancel")}
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleConfirm}
                  isDisabled={!tempSelectedIcon}
                >
                  {t("select")}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}