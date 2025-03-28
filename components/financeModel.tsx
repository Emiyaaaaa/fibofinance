"use client";

import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Form } from "@heroui/form";
import { Input, Textarea } from "@heroui/input";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useTranslations } from "next-intl";
import { useState } from "react";

import useFinanceModel from "@/utils/store/useFinanceModel";
import useFinanceData from "@/utils/store/useFinanceData";
import { currencyMap } from "@/utils";

export default function FinanceModel() {
  const { isOpen, onClose, modelProps: props } = useFinanceModel();
  const t = useTranslations();

  const [currency, setCurrency] = useState<keyof typeof currencyMap>();

  const { data, updateData } = useFinanceData();
  const submitType = props?.submitType ?? "create";

  const ownerList = [
    ...new Set(data.map((item) => item.owner).filter(Boolean)),
  ];

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    if (submitType === "create") {
      fetch("/api/finance", {
        method: "POST",
        body: JSON.stringify({ ...data, group_id: 1 }),
      }).finally(() => {
        updateData();
      });
    } else if (submitType === "update" && props?.data?.id !== undefined) {
      fetch("/api/finance", {
        method: "PATCH",
        body: JSON.stringify({ ...data, id: props!.data!.id, group_id: 1 }),
      }).finally(() => {
        updateData();
      });
    }
  };

  const onDelete = () => {
    fetch("/api/finance", {
      method: "DELETE",
      body: JSON.stringify({ id: props!.data!.id }),
    }).finally(() => {
      updateData();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t("addFinance.title")}
        </ModalHeader>
        <Form
          onSubmit={(e) => {
            onSubmit(e);
            onClose();
          }}
        >
          <ModalBody>
            <div className="flex gap-4 w-full">
              <Input
                isRequired
                autoComplete="off"
                className="w-3/5"
                defaultValue={props?.data?.name}
                label={t("finance.name")}
                name="name"
              />
              <Autocomplete
                className="w-2/5"
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
            </div>
            <div className="flex gap-4 w-full">
              <NumberInput
                isRequired
                className="w-5/12"
                defaultValue={props?.data?.amount}
                label={t("finance.amount")}
                name="amount"
                startContent={
                  <div className="text-sm">
                    {
                      currencyMap[
                        currency ??
                          props?.data?.currency ??
                          (t(
                            "addFinance.defaultCurrency"
                          ) as keyof typeof currencyMap)
                      ]
                    }
                  </div>
                }
              />
              <Select
                className="w-3/12"
                defaultSelectedKeys={[
                  props?.data?.currency ?? t("addFinance.defaultCurrency"),
                ]}
                label={t("finance.currency")}
                name="currency"
                onSelectionChange={(e) => {
                  setCurrency(e.currentKey as keyof typeof currencyMap);
                }}
              >
                <SelectItem key={"CNY"}>{t("finance.CNY")}</SelectItem>
                <SelectItem key={"USD"}>{t("finance.USD")}</SelectItem>
                <SelectItem key={"EUR"}>{t("finance.EUR")}</SelectItem>
                <SelectItem key={"GBP"}>{t("finance.GBP")}</SelectItem>
                <SelectItem key={"JPY"}>{t("finance.JPY")}</SelectItem>
              </Select>
              {ownerList.length > 0 ? (
                <Autocomplete
                  className="w-4/12"
                  defaultInputValue={props?.data?.owner}
                  defaultSelectedKey={props?.data?.owner}
                  label={t("finance.owner")}
                  name="owner"
                >
                  {ownerList.map((item) => (
                    <AutocompleteItem key={item}>{item}</AutocompleteItem>
                  ))}
                </Autocomplete>
              ) : (
                <Input
                  className="w-4/12"
                  defaultValue={props?.data?.owner}
                  label={t("finance.owner")}
                  name="owner"
                />
              )}
            </div>
            <Textarea
              defaultValue={props?.data?.description}
              label={t("finance.description")}
              minRows={2}
              name="description"
            />
          </ModalBody>
          <ModalFooter className="w-full">
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
              {submitType === "create"
                ? t("addFinance.confirmButton")
                : t("addFinance.updateButton")}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}
