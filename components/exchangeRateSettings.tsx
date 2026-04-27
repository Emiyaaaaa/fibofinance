"use client";

import {
  Button,
  Form,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Spinner,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { useEffect, useMemo, useState } from "react";

import { DEFAULT_EXCHANGE_RATE } from "@/utils";
import { fetchWithTime } from "@/utils/fetchWithTime";
import { useTranslations } from "next-intl";
import { useCurrencyData } from "@/utils/store/useCurrencyData";
import { Currency } from "@/types";
import { useConfirm } from "@/utils/hook/useComfirm";
import { RiExchangeCnyLine, RiExchangeDollarLine, RiMore2Line } from "@remixicon/react";
import { useFinanceExchangeRateDataStore } from "@/utils/store/useFinanceExchangeRateData";

const toFixed4 = (amount: number) => {
  return Math.round(amount * 10000) / 10000;
};

function EditCurrencyModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currency?: Currency | null;
}) {
  const { isOpen, onClose, onSuccess, currency } = props;
  const t = useTranslations("exchangeRateSettings");
  const { addCurrency, updateCurrency } = useCurrencyData();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ code: "", symbol: "", unit: "" });

  const isEditMode = !!currency;

  useEffect(() => {
    if (isOpen && currency) {
      setFormData({
        code: currency.code,
        symbol: currency.symbol,
        unit: currency.unit || "",
      });
    } else if (isOpen && !currency) {
      setFormData({ code: "", symbol: "", unit: "" });
    }
  }, [isOpen, currency]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.code || !formData.symbol) {
      return;
    }

    setLoading(true);
    try {
      if (isEditMode && currency) {
        await updateCurrency(currency.id, formData.code, formData.symbol, formData.unit || undefined);
      } else {
        await addCurrency(formData.code, formData.symbol, formData.unit || undefined);
      }
      setFormData({ code: "", symbol: "", unit: "" });
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Failed to ${isEditMode ? "update" : "add"} currency:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xs">
      <ModalContent>
        <ModalHeader>{isEditMode ? t("editCurrency") : t("addCurrency")}</ModalHeader>
        <Form onSubmit={onSubmit}>
          <ModalBody className="w-full">
            <Input
              isRequired
              label={t("currencyCode")}
              placeholder="USD"
              value={formData.code}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, code: val }))}
              maxLength={10}
              isDisabled={isEditMode}
            />
            <Input
              isRequired
              label={t("currencySymbol")}
              placeholder="$"
              value={formData.symbol}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, symbol: val }))}
              maxLength={10}
            />
            <Input
              label={t("currencyUnit")}
              placeholder="g"
              value={formData.unit}
              onValueChange={(val) => setFormData((prev) => ({ ...prev, unit: val }))}
              maxLength={10}
              description={t("currencyUnitDescription")}
            />
          </ModalBody>
          <ModalFooter className="w-full">
            <div className="flex-1"></div>
            <Button variant="bordered" onPress={onClose} disabled={loading}>
              {t("cancel")}
            </Button>
            <Button color="primary" type="submit" isLoading={loading}>
              {t("confirm")}
            </Button>
          </ModalFooter>
        </Form>
      </ModalContent>
    </Modal>
  );
}

function ExchangeRateSettingsModal(props: { isOpen: boolean; onClose: () => void }) {
  const financeT = useTranslations("finance");
  const t = useTranslations("exchangeRateSettings");

  const { isOpen, onClose } = props;
  const { data: currencies, currencyMap, updateData: updateCurrencies, deleteCurrency } = useCurrencyData();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const { isOpen: isEditCurrencyOpen, onOpen: onEditCurrencyOpen, onClose: onEditCurrencyClose } = useDisclosure();
  const { ComfirmModal, openConfirm } = useConfirm({
    message: t("deleteCurrencyWarning"),
    color: "danger",
  });

  const currencyCodes = useMemo(() => currencies.map((c) => c.code), [currencies]);
  const todayStr = useMemo(() => new Date().toLocaleDateString(), []);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch(`/api/finance/exchangeRate/latest`)
      .then((res) => res.json())
      .then((data) => {
        try {
          const parsedRates: Record<string, number> =
            typeof data?.rates_json === "string"
              ? (JSON.parse(data.rates_json)?.rates ?? JSON.parse(data.rates_json) ?? {})
              : (data?.rates ?? {});

          const merged: Record<string, number> = {};
          currencyCodes.forEach((code) => {
            const key = String(code);
            const fromParsed = typeof parsedRates[key] === "number" ? parsedRates[key] : undefined;
            const fallback = DEFAULT_EXCHANGE_RATE.rates[key] as number | undefined;
            const baseRate = fromParsed ?? fallback ?? 1;
            merged[key] = toFixed4(1 / baseRate);
          });
          setRates(merged);
        } catch {
          const defaults: Record<string, number> = {};
          currencyCodes.forEach((code) => {
            const key = String(code);
            const fallback = (DEFAULT_EXCHANGE_RATE.rates[key] as number | undefined) ?? 1;
            defaults[key] = fallback > 0 ? toFixed4(1 / fallback) : fallback;
          });
          setRates(defaults);
        }
      })
      .finally(() => setLoading(false));
  }, [isOpen, currencyCodes, todayStr]);

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    onEditCurrencyOpen();
  };

  const handleAddCurrency = () => {
    setEditingCurrency(null);
    onEditCurrencyOpen();
  };

  const handleDeleteCurrency = async (currency: Currency) => {
    const confirmed = await openConfirm();

    if (confirmed) {
      try {
        await deleteCurrency(currency.id);
        updateCurrencies();
      } catch (error) {
        console.error("Failed to delete currency:", error);
      }
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextRates: Record<string, number> = {};
    for (const code of currencyCodes) {
      const key = String(code);
      const uiVal = Number(rates[key]);
      const safeVal = Number.isFinite(uiVal) && uiVal > 0 ? uiVal : 1;
      nextRates[key] = 1 / safeVal;
    }

    setSaving(true);
    fetchWithTime("/api/finance/exchangeRate", {
      method: "POST",
      body: JSON.stringify({
        rates_json: JSON.stringify({ base: DEFAULT_EXCHANGE_RATE.base, rates: nextRates }),
        date: todayStr,
      }),
    })
      .then(() => {
        useFinanceExchangeRateDataStore.setState({ latestRates: nextRates });
      })
      .catch(() => {})
      .finally(() => {
        setSaving(false);
        onClose();
      });
  };

  return (
    <>
      <ComfirmModal />
      <EditCurrencyModal
        isOpen={isEditCurrencyOpen}
        onClose={onEditCurrencyClose}
        onSuccess={updateCurrencies}
        currency={editingCurrency}
      />
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalContent>
          <ModalHeader>{t("title")}</ModalHeader>
          <Form onSubmit={onSubmit}>
            <ModalBody className="relative">
              <div className="grid grid-cols-2 gap-4">
                {currencies.map((currency) => (
                  <div key={currency.code} className="flex items-end gap-2">
                    <NumberInput
                      hideStepper
                      isRequired
                      isDisabled={loading}
                      className="flex-1"
                      label={financeT(String(currency.code))}
                      name={String(currency.code)}
                      value={rates[String(currency.code)] ?? 0}
                      onValueChange={(val) => {
                        const num = Number(val);
                        setRates((prev) => ({
                          ...prev,
                          [String(currency.code)]:
                            Number.isFinite(num) && num >= 0 ? num : (prev[String(currency.code)] ?? 0),
                        }));
                      }}
                      startContent={<div className="text-sm">{currencyMap[currency.code]?.symbol}</div>}
                      endContent={
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly variant="light" size="sm">
                              <RiMore2Line size={16} />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Currency actions">
                            <DropdownItem key="edit" onPress={() => handleEditCurrency(currency)}>
                              {t("editCurrency")}
                            </DropdownItem>
                            <DropdownItem
                              key="delete"
                              className="text-danger"
                              color="danger"
                              onPress={() => handleDeleteCurrency(currency)}
                            >
                              {t("deleteCurrency")}
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      }
                    />
                  </div>
                ))}
                <Button onPress={handleAddCurrency} variant="flat" className="h-[56px]" isDisabled={loading}>
                  + {t("addCurrency")}
                </Button>
              </div>
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-medium">
                  <Spinner size="lg" variant="gradient" />
                </div>
              )}
            </ModalBody>
            <ModalFooter className="w-full">
              <div className="flex-1"></div>
              <Button variant="bordered" onPress={onClose} disabled={saving}>
                {t("cancel")}
              </Button>
              <Button color="primary" type="submit" isLoading={saving} isDisabled={loading}>
                {t("confirm")}
              </Button>
            </ModalFooter>
          </Form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default function ExchangeRateSettings() {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <ExchangeRateSettingsModal isOpen={isOpen} onClose={onClose} />
      <RiExchangeCnyLine onClick={onOpen} className="cursor-pointer" />
    </>
  );
}
