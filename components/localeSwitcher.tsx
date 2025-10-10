import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { useEffect, useState } from "react";
import { RiTranslate2 } from "@remixicon/react";

import { Locale, localeList } from "@/utils/i18n/config";
import { getUserLocale, setUserLocale } from "@/utils/i18n/locale";
import { useLocale } from "@/utils/hook/useLocale";

function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  useEffect(() => {
    const fetchLocale = async () => {
      const locale = await getUserLocale();

      setLocale(locale);
    };

    fetchLocale();
  }, []);

  return (
    <Dropdown
      classNames={{
        content: "w-20 min-w-20 max-w-20",
      }}
    >
      <DropdownTrigger>
        <RiTranslate2 className="cursor-pointer" size={22} />
      </DropdownTrigger>
      <DropdownMenu aria-label="Locale">
        {localeList.map(({ key, label }) => (
          <DropdownItem
            key={key}
            className={key === locale ? "text-primary" : ""}
            onPress={() => {
              setUserLocale(key);
              setLocale(key);
            }}
          >
            {label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}

export default LocaleSwitcher;
