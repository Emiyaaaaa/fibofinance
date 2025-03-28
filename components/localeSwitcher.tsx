import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useEffect, useState } from "react";
import { RiTranslate2 } from "@remixicon/react";

import { Locale, localeList } from "@/utils/i18n/config";
import { getUserLocale, setUserLocale } from "@/utils/i18n/locale";

function LocaleSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>();

  useEffect(() => {
    const fetchLocale = async () => {
      const locale = await getUserLocale();

      setCurrentLocale(locale);
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
            className={key === currentLocale ? "text-primary" : ""}
            onPress={() => {
              setUserLocale(key);
              setCurrentLocale(key);
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
