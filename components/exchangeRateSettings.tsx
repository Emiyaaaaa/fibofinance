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
import { RiMore2Fill, RiMore2Line } from "@remixicon/react";

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
            <ModalBody>
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
                <Button onPress={handleAddCurrency} variant="flat" className="h-[56px]">
                  + {t("addCurrency")}
                </Button>
              </div>
            </ModalBody>
            <ModalFooter className="w-full">
              <div className="flex-1"></div>
              <Button variant="bordered" onPress={onClose} disabled={saving}>
                {t("cancel")}
              </Button>
              <Button color="primary" type="submit" isLoading={saving}>
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
      <svg
        className="cursor-pointer"
        onClick={onOpen}
        fill="currentColor"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="26"
        height="26"
      >
        <path d="M866.474667 482.474667A29.525333 29.525333 0 0 1 896 512a384 384 0 0 1-605.738667 313.6A384.128 384.128 0 0 1 149.888 640a29.568 29.568 0 0 1 24.32-39.168l3.498667-0.213333 98.005333-0.042667a29.525333 29.525333 0 0 1 3.413333 58.88l-3.413333 0.170667H222.464l0.170667 0.341333a325.034667 325.034667 0 0 0 280.533333 176.810667l8.832 0.085333A324.906667 324.906667 0 0 0 836.906667 512a29.525333 29.525333 0 0 1 29.568-29.525333zM512 128a383.914667 383.914667 0 0 1 362.24 256 29.568 29.568 0 0 1-24.32 39.168l-3.541333 0.213333h-98.090667a29.525333 29.525333 0 0 1-3.413333-58.88l3.413333-0.213333h53.333333l-0.128-0.256a324.906667 324.906667 0 0 0-280.618666-176.853333L512 187.093333A324.906667 324.906667 0 0 0 187.093333 512 29.525333 29.525333 0 0 1 128 512a384 384 0 0 1 384-384z"></path>
        <path d="M625.194667 515.882667l-0.085334-0.042667c-13.610667-14.293333-32.725333-24.448-56.832-30.250667l-89.045333-20.394666c-8.832-2.133333-15.530667-5.12-19.925333-8.874667l-0.085334-0.042667c-2.816-2.389333-6.570667-6.826667-6.570666-17.578666 0-15.914667 5.930667-26.538667 18.56-33.408 9.856-5.248 23.04-7.936 39.253333-7.936 18.048 0 33.066667 3.925333 44.672 11.648l0.085333 0.042666c13.056 8.533333 19.157333 20.736 19.157334 38.314667 0 7.381333 5.973333 13.354667 13.354666 13.354667h39.466667c7.338667 0 13.312-5.973333 13.312-13.354667 0-28.501333-7.68-52.352-22.912-70.869333-16.085333-19.797333-39.850667-32.64-70.912-38.4l-0.170667-27.690667A11.776 11.776 0 0 0 534.698667 298.666667l-47.616 0.128a11.776 11.776 0 0 0-11.733334 11.776l0.170667 26.666666c-24.96 4.522667-45.525333 15.061333-61.44 31.445334-19.2 19.882667-28.885333 45.354667-28.885333 75.733333 0 27.946667 10.325333 50.218667 30.72 66.133333 11.605333 8.96 27.008 15.786667 45.866666 20.266667l63.829334 14.634667c29.866667 6.997333 42.24 13.397333 47.36 17.578666 5.930667 4.736 8.746667 12.8 8.746666 24.533334a30.037333 30.037333 0 0 1-12.8 26.069333c-11.733333 8.661333-30.378667 13.056-55.424 13.056-21.162667 0-38.186667-4.352-50.56-12.842667-14.805333-10.197333-22.016-25.472-22.016-46.72a13.354667 13.354667 0 0 0-13.312-13.354666h-39.509333a13.354667 13.354667 0 0 0-13.312 13.354666c0 17.621333 2.517333 33.706667 7.466667 47.786667 5.205333 14.805333 14.805333 28.586667 28.544 41.002667 10.965333 10.026667 22.656 17.578667 34.816 22.485333 9.045333 3.626667 19.328 6.4 30.805333 8.234667l0.213333 26.965333c0 6.485333 5.290667 11.733333 11.776 11.733333l47.616-0.128a11.776 11.776 0 0 0 11.733334-11.776l-0.170667-26.581333a150.357333 150.357333 0 0 0 54.442667-18.944c31.317333-18.986667 47.189333-47.957333 47.189333-86.058667 0-26.794667-8.106667-48.981333-24.021333-65.962666z"></path>
      </svg>
    </>
  );
}
