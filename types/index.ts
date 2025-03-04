import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface Finance {
  id: number;
  name: string;
  description?: string;
  type?: string;
  amount: number;
  currency: string;
}

export interface FinanceModelProps {
  data?: Finance;
  hasDelete?: boolean;
  submitType?: "create" | "update";
}
