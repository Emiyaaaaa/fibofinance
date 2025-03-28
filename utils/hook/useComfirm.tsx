import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { useTranslations } from "next-intl";
import { useRef } from "react";

export const useConfirm = (props: {
  message: string;
  color?: "danger" | "warning";
}) => {
  const t = useTranslations("confirmModel");

  const { isOpen, onClose, onOpen } = useDisclosure();

  const resolver = useRef<{ resolve: (value: boolean) => void }>();

  const openConfirm = () => {
    onOpen();

    return new Promise<boolean>((resolve) => {
      resolver.current = { resolve };
    });
  };

  const ComfirmModel = () => {
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

  return { ComfirmModel, openConfirm };
};
