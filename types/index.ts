import { SVGProps } from "react";

import { currencyMap } from "@/utils";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Finance {
  id: number;
  owner?: string;
  name: string;
  description?: string;
  type?: string;
  amount: number;
  currency: keyof typeof currencyMap;
  updated_at: string;
}

export interface FinanceChange {
  id: number;
  total_usd: number;
  total_cny: number;
  created_at: string;
}

export interface AssetAdvice {
  id: number;
  name: string;
  amount: number;
}

export interface FinanceModelProps {
  data?: Finance;
  hasDelete?: boolean;
  submitType?: "create" | "update";
}
