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

  const t = useTranslations("finance");

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
      setError("Icon key and SVG content are required");
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
        setError(data.error || "Failed to create icon");
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
      setError("Failed to create icon");
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

      <Modal 
        isOpen={isOpen} 
        onClose={handleClose}
        size="lg"
      >
        <ModalContent>
          <ModalHeader>
            {isCreating ? "Create New Icon" : "Select Icon"}
          </ModalHeader>
          <ModalBody className="overflow-x-hidden">
            {isCreating ? (
              <div className="space-y-4">
                <Input
                  label="Icon Key"
                  placeholder="e.g., my-icon"
                  value={newIconKey}
                  onChange={(e) => setNewIconKey(e.target.value)}
                  description="Unique identifier for the icon"
                  isInvalid={!!error && !newIconKey}
                />
                <Input
                  label="Icon Name (Optional)"
                  placeholder="e.g., My Icon"
                  value={newIconName}
                  onChange={(e) => setNewIconName(e.target.value)}
                />
                <Textarea
                  label="SVG Content"
                  placeholder='<svg viewBox="0 0 24 24">...</svg>'
                  value={newIconSvg}
                  onChange={(e) => setNewIconSvg(e.target.value)}
                  minRows={4}
                  description="Paste the SVG code here"
                  isInvalid={!!error && !newIconSvg}
                />
                {newIconSvg && (
                  <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
                    <div 
                      className="w-12 h-12 overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: newIconSvg }}
                    />
                  </div>
                )}
                {error && (
                  <p className="text-sm text-danger">{error}</p>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-6 gap-2 overflow-hidden">
                  {icons.map((icon) => (
                    <Tooltip key={icon.key} content={icon.name || icon.key}>
                      <Button
                        size="lg"
                        variant={tempSelectedIcon === icon.key ? "solid" : "light"}
                        onPress={() => setTempSelectedIcon(icon.key)}
                        className="p-3 overflow-hidden"
                      >
                        <div 
                          className="w-6 h-6 overflow-hidden"
                          dangerouslySetInnerHTML={{ __html: icon.svg }}
                        />
                      </Button>
                    </Tooltip>
                  ))}
                </div>
                <Button
                  variant="light"
                  onPress={() => setIsCreating(true)}
                  className="mt-4"
                  startContent={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Create New Icon
                </Button>
              </>
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
                  Cancel
                </Button>
                <Button color="primary" onPress={handleCreateIcon}>
                  Create Icon
                </Button>
              </>
            ) : (
              <>
                <Button color="danger" onPress={handleClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleConfirm}
                  isDisabled={!tempSelectedIcon}
                >
                  Select
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}