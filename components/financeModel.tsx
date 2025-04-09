"use client";

import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Form } from "@heroui/form";
import { Input, Textarea } from "@heroui/input";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import useFinanceModel from "@/utils/store/useFinanceModel";
import useFinanceData from "@/utils/store/useFinanceData";
import { currencyMap, financeType } from "@/utils";
import { useGroup } from "@/utils/store/useGroup";
import { fetchWithTime } from "@/utils/fetchWithTime";

export default function FinanceModel() {
  const { isOpen, onClose, modelProps: props } = useFinanceModel();
  const { groupId } = useGroup();
  const addFinanceT = useTranslations("addFinance");
  const financeT = useTranslations("finance");
  const [type, setType] = useState(props?.data?.type ?? "current");

  const [currency, setCurrency] = useState<keyof typeof currencyMap>();

  const { data, updateData } = useFinanceData();
  const submitType = props?.submitType ?? "create";

  const ownerList = [...new Set(data.map((item) => item.owner).filter(Boolean))];

  useEffect(() => {
    if (props?.data?.type) {
      setType(props.data.type);
    }
  }, [props?.data?.type]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));

    if (submitType === "create") {
      fetchWithTime("/api/finance", {
        method: "POST",
        body: JSON.stringify({ ...data, type, group_id: groupId }),
      }).finally(() => {
        updateData();
      });
    } else if (submitType === "update" && props?.data?.id !== undefined) {
      fetchWithTime("/api/finance", {
        method: "PATCH",
        body: JSON.stringify({
          ...data,
          id: props!.data!.id,
          type,
          group_id: groupId,
        }),
      }).finally(() => {
        updateData();
      });
    }
  };

  const onDelete = () => {
    fetchWithTime("/api/finance", {
      method: "DELETE",
      body: JSON.stringify({ id: props!.data!.id }),
    }).finally(() => {
      updateData();
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{addFinanceT("title")}</ModalHeader>
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
                label={financeT("name")}
                name="name"
              />
              <Autocomplete
                allowsCustomValue
                className="w-2/5"
                defaultInputValue={props?.data?.type ?? financeT("current")}
                defaultSelectedKey={props?.data?.type}
                inputValue={financeT(type)}
                label={financeT("type")}
                name="type"
                onInputChange={(value) => {
                  setType(value);
                }}
              >
                {financeType.map((item) => (
                  <AutocompleteItem key={item} textValue={item}>
                    {financeT(item)}
                  </AutocompleteItem>
                ))}
              </Autocomplete>
            </div>
            <div className="flex gap-4 w-full">
              <NumberInput
                isRequired
                className="w-5/12"
                defaultValue={props?.data?.amount}
                label={financeT("amount")}
                name="amount"
                startContent={
                  <div className="text-sm">
                    {
                      currencyMap[
                        currency ??
                          props?.data?.currency ??
                          (addFinanceT("defaultCurrency") as keyof typeof currencyMap)
                      ]
                    }
                  </div>
                }
              />
              <Select
                className="w-3/12"
                defaultSelectedKeys={[props?.data?.currency ?? addFinanceT("defaultCurrency")]}
                label={financeT("currency")}
                name="currency"
                onSelectionChange={(e) => {
                  setCurrency(e.currentKey as keyof typeof currencyMap);
                }}
              >
                <SelectItem key={"CNY"}>{financeT("CNY")}</SelectItem>
                <SelectItem key={"USD"}>{financeT("USD")}</SelectItem>
                <SelectItem key={"EUR"}>{financeT("EUR")}</SelectItem>
                <SelectItem key={"GBP"}>{financeT("GBP")}</SelectItem>
                <SelectItem key={"JPY"}>{financeT("JPY")}</SelectItem>
              </Select>
              {ownerList.length > 0 ? (
                <Autocomplete
                  allowsCustomValue
                  className="w-4/12"
                  defaultInputValue={props?.data?.owner}
                  defaultSelectedKey={props?.data?.owner}
                  label={financeT("owner")}
                  name="owner"
                >
                  {ownerList.map((item) => (
                    <AutocompleteItem key={item}>{item}</AutocompleteItem>
                  ))}
                </Autocomplete>
              ) : (
                <Input className="w-4/12" defaultValue={props?.data?.owner} label={financeT("owner")} name="owner" />
              )}
            </div>
            <Textarea
              defaultValue={props?.data?.description}
              label={financeT("description")}
              minRows={2}
              name="description"
            />
          </ModalBody>
          <ModalFooter className="w-full">
            {props?.hasDelete && props.data?.id !== undefined && (
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  onDelete();
                  onClose();
                }}
              >
                {addFinanceT("delete")}
              </Button>
            )}
            <Button color="danger" onPress={() => onClose()}>
              {addFinanceT("close")}
            </Button>
            <Button color="primary" type="submit">
              {submitType === "create" ? addFinanceT("confirmButton") : addFinanceT("updateButton")}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}
