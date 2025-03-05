import { SVGProps } from "react";

import { currencyMap } from "@/utils";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Finance {
  id: number;
  name: string;
  description?: string;
  type?: string;
  amount: number;
  currency: keyof typeof currencyMap;
  updated_at: string;
}

export interface FinanceModelProps {
  data?: Finance;
  hasDelete?: boolean;
  submitType?: "create" | "update";
}
