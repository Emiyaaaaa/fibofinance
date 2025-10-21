// Tremor DonutChart [v1.0.0]
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React from "react";
import { Pie, PieChart as ReChartsDonutChart, ResponsiveContainer, Sector, Tooltip } from "recharts";

import {
  AvailableChartColors,
  constructCategoryColors,
  getColorClassName,
  type AvailableChartColorsKeys,
} from "./utils/chartUtils";
import cx from "classnames";

const sumNumericArray = (arr: number[]): number => arr.reduce((sum, num) => sum + num, 0);

const parseData = (
  data: Record<string, any>[],
  categoryColors: Map<string, AvailableChartColorsKeys>,
  category: string
) =>
  data.map((dataPoint) => ({
    ...dataPoint,
    color: categoryColors.get(dataPoint[category]) || AvailableChartColors[0],
    className: getColorClassName(categoryColors.get(dataPoint[category]) || AvailableChartColors[0], "fill"),
  }));

const calculateDefaultLabel = (data: any[], valueKey: string): number =>
  sumNumericArray(data.map((dataPoint) => dataPoint[valueKey]));

const parseLabelInput = (
  valueFormatter: (value: number, ...args: any[]) => string,
  data: any[],
  valueKey: string
): string => valueFormatter(calculateDefaultLabel(data, valueKey));

//#region Tooltip

type TooltipProps = Pick<ChartTooltipProps, "active" | "payload">;

type PayloadItem = {
  category: string;
  value: number;
  color: AvailableChartColorsKeys;
  raw: Record<string, any>;
};

interface ChartTooltipProps {
  active: boolean | undefined;
  payload: PayloadItem[];
  valueFormatter: (value: number, data: Record<string, any>) => string;
  showPercentage?: boolean;
  total?: number;
}

const ChartTooltip = ({ active, payload, valueFormatter, showPercentage, total }: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cx(
          // base
          "rounded-md border text-sm shadow-md",
          // border color
          "border-gray-200 dark:border-gray-800",
          // background color
          "bg-white dark:bg-gray-950"
        )}
      >
        <div className={cx("space-y-1 px-4 py-2")}>
          {payload.map(({ value, category, color }, index) => {
            const data = payload[index].raw as Record<string, any>;
            const percentage = showPercentage && total ? `${((value / total) * 100).toFixed(2)}%` : "";
            const valueText =
              showPercentage && total ? `${valueFormatter(value, data)} (${percentage})` : valueFormatter(value, data);
            return (
              <div key={`id-${index}`} className="flex items-center justify-between space-x-8">
                <div className="flex items-center space-x-2">
                  <span
                    aria-hidden="true"
                    className={cx("size-2 shrink-0 rounded-full", getColorClassName(color, "bg"))}
                  />
                  <p
                    className={cx(
                      // base
                      "text-right whitespace-nowrap",
                      // text color
                      "text-gray-700 dark:text-gray-300"
                    )}
                  >
                    {category}
                  </p>
                </div>
                <p
                  className={cx(
                    // base
                    "text-right font-medium whitespace-nowrap tabular-nums",
                    // text color
                    "text-gray-900 dark:text-gray-50"
                  )}
                >
                  {valueText}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const renderInactiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, className } = props;

  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      className={className}
      fill=""
      opacity={0.3}
      style={{ outline: "none" }}
    />
  );
};

type DonutChartVariant = "donut" | "pie";

type BaseEventProps = {
  eventType: "sector";
  categoryClicked: string;
  [key: string]: number | string;
};

type DonutChartEventProps = BaseEventProps | null | undefined;

interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[];
  category: string;
  value: string;
  colors?: AvailableChartColorsKeys[];
  categoryColors?: Record<string, AvailableChartColorsKeys>;
  variant?: DonutChartVariant;
  valueFormatter?: (value: number, data: Record<string, any>) => string;
  label?: string | ((value: number) => string);
  showPercentage?: boolean;
  showLabel?: boolean;
  showTooltip?: boolean;
  onValueChange?: (value: DonutChartEventProps) => void;
  tooltipCallback?: (tooltipCallbackContent: TooltipProps) => void;
  customTooltip?: React.ComponentType<TooltipProps>;
}

const DonutChart = React.forwardRef<HTMLDivElement, DonutChartProps>(
  (
    {
      data = [],
      value,
      category,
      colors = AvailableChartColors,
      variant = "donut",
      valueFormatter = (value: number) => value.toString(),
      label,
      showPercentage = true,
      showLabel = true,
      showTooltip = true,
      onValueChange,
      tooltipCallback,
      customTooltip,
      className,
      ...other
    },
    forwardedRef
  ) => {
    const CustomTooltip = customTooltip;
    const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);
    const isDonut = variant === "donut";
    const parsedLabelInput =
      typeof label === "function"
        ? label(calculateDefaultLabel(data, value))
        : typeof label === "string"
          ? label
          : parseLabelInput(valueFormatter, data, value);

    const categories = Array.from(new Set(data.map((item) => item[category])));
    const categoryColors = other.categoryColors
      ? new Map(Object.entries(other.categoryColors))
      : constructCategoryColors(categories, colors);

    const prevActiveRef = React.useRef<boolean | undefined>(undefined);
    const prevCategoryRef = React.useRef<string | undefined>(undefined);

    const total = data.reduce((acc, item) => acc + item[value], 0);

    const handleShapeClick = (data: any, index: number, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!onValueChange) return;

      if (activeIndex === index) {
        setActiveIndex(undefined);
        onValueChange(null);
      } else {
        setActiveIndex(index);
        onValueChange({
          eventType: "sector",
          categoryClicked: data.payload[category],
          ...data.payload,
        });
      }
    };

    return (
      <div ref={forwardedRef} className={cx("h-40 w-40", className)} tremor-id="tremor-raw" {...other}>
        <ResponsiveContainer className="size-full">
          <ReChartsDonutChart
            onClick={
              onValueChange && activeIndex !== undefined
                ? () => {
                    setActiveIndex(undefined);
                    onValueChange(null);
                  }
                : undefined
            }
            margin={{ top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {showLabel && isDonut && (
              <text
                className="fill-gray-700 dark:fill-gray-300"
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {parsedLabelInput}
              </text>
            )}
            <Pie
              className={cx(
                "stroke-white dark:stroke-gray-950 [&_.recharts-pie-sector]:outline-hidden",
                onValueChange ? "cursor-pointer" : "cursor-default"
              )}
              data={parseData(data, categoryColors, category)}
              cx="50%"
              cy="50%"
              startAngle={90}
              endAngle={-270}
              innerRadius={isDonut ? "75%" : "0%"}
              outerRadius="100%"
              stroke=""
              strokeLinejoin="round"
              dataKey={value}
              nameKey={category}
              isAnimationActive={false}
              onClick={handleShapeClick}
              activeIndex={activeIndex}
              inactiveShape={renderInactiveShape}
              style={{ outline: "none" }}
            />
            {showTooltip && (
              <Tooltip
                wrapperStyle={{ outline: "none", zIndex: 100 }}
                isAnimationActive={false}
                content={({ active, payload }) => {
                  const cleanPayload = payload
                    ? payload.map((item: any) => ({
                        category: item.payload[category],
                        value: item.value,
                        color: categoryColors.get(item.payload[category]) as AvailableChartColorsKeys,
                        raw: item.payload,
                      }))
                    : [];

                  const payloadCategory: string = cleanPayload[0]?.category;

                  if (
                    tooltipCallback &&
                    (active !== prevActiveRef.current || payloadCategory !== prevCategoryRef.current)
                  ) {
                    tooltipCallback({
                      active,
                      payload: cleanPayload,
                    });
                    prevActiveRef.current = active;
                    prevCategoryRef.current = payloadCategory;
                  }

                  return showTooltip && active ? (
                    CustomTooltip ? (
                      <CustomTooltip active={active} payload={cleanPayload} />
                    ) : (
                      <ChartTooltip
                        active={active}
                        payload={cleanPayload}
                        total={total}
                        showPercentage={showPercentage}
                        valueFormatter={valueFormatter}
                      />
                    )
                  ) : null;
                }}
              />
            )}
          </ReChartsDonutChart>
        </ResponsiveContainer>
      </div>
    );
  }
);

DonutChart.displayName = "DonutChart";

export { DonutChart, type DonutChartEventProps, type TooltipProps };
