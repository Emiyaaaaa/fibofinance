"use client";

import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Form } from "@heroui/form";
import { Input, Textarea } from "@heroui/input";
import { NumberInput } from "@heroui/number-input";
import { Select, SelectItem } from "@heroui/select";
import { Switch } from "@heroui/switch";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import IconPicker from "./iconPicker";

import useFinanceModal from "@/utils/store/useFinanceModal";
import useFinanceData from "@/utils/store/useFinanceData";
import { currencyMap, financeType } from "@/utils";
import { useGroup } from "@/utils/store/useGroup";
import { fetchWithTime } from "@/utils/fetchWithTime";
import { Finance } from "@/types";

export default function FinanceModal() {
  const { isOpen, onClose, modalProps: props } = useFinanceModal();
  const { groupId } = useGroup();
  const addFinanceT = useTranslations("addFinance");
  const financeT = useTranslations("finance");
  const [type, setType] = useState("current");
  const [icon, setIcon] = useState<string | undefined>();
  const [currency, setCurrency] = useState<keyof typeof currencyMap>();
  const [notCount, setIgnoreInTotal] = useState(false);

  const { data, updateData } = useFinanceData();
  const submitType = props?.submitType ?? "create";

  const ownerList = [...new Set(data.map((item) => item.owner).filter(Boolean))];

  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      if (submitType === "create") {
        setType("current");
        setIcon(undefined);
      } else {
        // For update mode, use the existing data
        setType(props?.data?.type ?? "current");
        setIcon(props?.data?.icon || undefined);
        setIgnoreInTotal(props?.data?.not_count ?? false);
      }
    }
  }, [isOpen, submitType, props?.data?.type, props?.data?.icon, props?.data?.not_count]);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Partial<Finance>;

    const oldData = props?.data;
    const newData = { ...data, type, group_id: groupId, icon: icon || null, not_count: notCount };
    const needUpdateTime = Number(oldData?.amount) !== Number(newData.amount) || oldData?.currency !== newData.currency;

    if (needUpdateTime) {
      newData.updated_at = new Date().toISOString();
    }

    if (submitType === "create") {
      fetchWithTime("/api/finance", {
        method: "POST",
        body: JSON.stringify(newData),
      }).finally(() => {
        updateData();
      });
    } else if (submitType === "update" && props?.data?.id !== undefined) {
      fetchWithTime("/api/finance", {
        method: "PATCH",
        body: JSON.stringify({ ...newData, id: props!.data!.id }),
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
              <div className="flex gap-3 w-3/5 items-end">
                <div className="flex flex-col gap-1">
                  <IconPicker value={icon} onChange={(iconKey) => setIcon(iconKey || undefined)} />
                </div>
                <Input
                  isRequired
                  autoComplete="off"
                  className="flex-1"
                  defaultValue={props?.data?.name}
                  label={financeT("name")}
                  name="name"
                />
              </div>
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
                hideStepper
                isRequired
                className="w-3/5"
                defaultValue={props?.data?.amount}
                endContent={
                  <Select
                    className="w-[80px]"
                    classNames={{
                      popoverContent: "w-[110px]",
                    }}
                    defaultSelectedKeys={[props?.data?.currency ?? addFinanceT("defaultCurrency")]}
                    name="currency"
                    renderValue={() => {
                      return (
                        <div className="text-sm">
                          {
                            currencyMap[
                              currency ??
                                props?.data?.currency ??
                                (addFinanceT("defaultCurrency") as keyof typeof currencyMap)
                            ]
                          }
                        </div>
                      );
                    }}
                    size="sm"
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
                }
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
              {ownerList.length > 0 ? (
                <Autocomplete
                  allowsCustomValue
                  className="w-2/5"
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
            <div className="flex mr-auto">
              <Switch
                aria-label={addFinanceT("notCount")}
                color="primary"
                defaultSelected={notCount}
                isSelected={notCount}
                name="not_count"
                size="sm"
                onValueChange={(value) => {
                  setIgnoreInTotal(value);
                }}
              >
                <div className="text-sm opacity-70">{addFinanceT("notCount")}</div>
              </Switch>
            </div>
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
            <Button color="primary" variant="bordered" onPress={() => onClose()}>
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
