import { Modal, Button, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Chip } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export const useConfirm = (props: { message: string; color?: "danger" | "warning" }) => {
  const t = useTranslations("confirmModal");

  const { isOpen, onClose, onOpen } = useDisclosure();

  const resolver = useRef<{ resolve: (value: boolean) => void }>();

  const openConfirm = () => {
    onOpen();

    return new Promise<boolean>((resolve) => {
      resolver.current = { resolve };
    });
  };

  const ComfirmModal = () => {
    return (
      <Modal hideCloseButton isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>
            <Chip color={props.color} radius="md" size="lg" variant="flat">
              {t("warning")}
            </Chip>
          </ModalHeader>
          <ModalBody>{props.message}</ModalBody>
          <ModalFooter>
            <Button
              onPress={() => {
                resolver.current?.resolve(false);
                onClose();
              }}
            >
              {t("cancel")}
            </Button>
            <Button
              color={props.color}
              onPress={() => {
                resolver.current?.resolve(true);
                onClose();
              }}
            >
              {t("confirm")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  return { ComfirmModal, openConfirm };
};
