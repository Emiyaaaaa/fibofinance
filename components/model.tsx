"use client";

import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useTranslations } from "next-intl";

import useFinanceModel from "@/utils/store/useFinanceModel";

export default function FinanceModel() {
  const { isOpen, onClose, modelProps: props } = useFinanceModel();
  const t = useTranslations();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    const submitType = props?.submitType ?? "create";

    if (submitType === "create") {
      fetch("/api/finance", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } else {
      fetch("/api/finance", {
        method: "PUT",
        body: JSON.stringify(data),
      });
    }
  };

  const onDelete = () => {
    fetch("/api/finance", {
      method: "DELETE",
      body: JSON.stringify({ id: props!.data!.id }),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("addFinance.title")}
            </ModalHeader>
            <ModalBody className="pb-4">
              <Form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  onSubmit(e);
                  onClose();
                }}
              >
                <Input
                  isRequired
                  autoComplete="off"
                  defaultValue={props?.data?.name}
                  label={t("finance.name")}
                  name="name"
                />
                <Autocomplete
                  className="max-w-xs"
                  defaultInputValue={props?.data?.type ?? t("finance.current")}
                  defaultSelectedKey={props?.data?.type}
                  label={t("finance.type")}
                  name="type"
                >
                  {[
                    t("finance.cash"),
                    t("finance.current"),
                    t("finance.fixed"),
                    t("finance.high"),
                    t("finance.medium"),
                    t("finance.low"),
                    t("finance.realEstate"),
                    t("finance.other"),
                  ].map((item) => (
                    <AutocompleteItem key={item}>{item}</AutocompleteItem>
                  ))}
                </Autocomplete>
                <div className="flex gap-4">
                  <NumberInput
                    isRequired
                    defaultValue={props?.data?.amount}
                    label={t("finance.amount")}
                    name="amount"
                  />
                  <Select
                    className="max-w-xs"
                    defaultSelectedKeys={[
                      props?.data?.currency ?? t("addFinance.defaultCurrency"),
                    ]}
                    label={t("finance.currency")}
                    name="currency"
                  >
                    <SelectItem key={"CNY"}>{t("finance.CNY")}</SelectItem>
                    <SelectItem key={"USD"}>{t("finance.USD")}</SelectItem>
                    <SelectItem key={"EUR"}>{t("finance.EUR")}</SelectItem>
                    <SelectItem key={"GBP"}>{t("finance.GBP")}</SelectItem>
                    <SelectItem key={"JPY"}>{t("finance.JPY")}</SelectItem>
                  </Select>
                </div>
                <div className="flex gap-4">
                  {props?.hasDelete && props.data?.id !== undefined && (
                    <Button
                      color="danger"
                      onPress={() => {
                        onDelete();
                        onClose();
                      }}
                    >
                      {t("addFinance.delete")}
                    </Button>
                  )}
                  <Button color="primary" type="submit">
                    {t("addFinance.confirmButton")}
                  </Button>
                </div>
              </Form>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
