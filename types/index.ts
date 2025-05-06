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
  group_id: number;
  updated_at: string;
  created_at: string;
}

export interface FinanceChange {
  id: number;
  group_id: number;
  date: string;
  finance_json: string;
}

export interface FinanceGroup {
  id: number;
  name: string;
  is_default: boolean;
}

export interface AssetAdvice {
  id: number;
  name: string;
  amount: number;
}

export interface FinanceModalProps {
  data?: Finance;
  hasDelete?: boolean;
  submitType?: "create" | "update";
}
