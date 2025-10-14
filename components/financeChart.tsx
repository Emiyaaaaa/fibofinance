"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Card, CardHeader, CardBody, Divider, Switch, DateRangePicker } from "@heroui/react";

import AmountOffset from "./amountOffset";

import { LineChart, TooltipProps } from "@/components/tremor/lineChart";
import { convertCurrency, subAmount, toFixed2 } from "@/utils/exchangeRate";
import useFinanceChangeData, { FinanceChangeData } from "@/utils/store/useFinanceChangeData";
import { getBetweenDateLength } from "@/utils/dateRange";
import { Finance } from "@/types";
import useFinanceData from "@/utils/store/useFinanceData";
import { getTotalFinance } from "@/utils/totalFinance";
import useFinanceGroupData from "@/utils/store/useFinanceGroupData";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { useLocale } from "@/utils/hook/useLocale";
import { FinanceString } from "@/components/financeString";

type FinanceChangeChartData = FinanceChangeData & {
  total: number;
};

interface FinanceChartData {
  date: string;
  total?: number;
  item?: FinanceChangeChartData;
  lastItem?: FinanceChangeChartData;
}

function CustomTooltip(props: TooltipProps) {
  const t = useTranslations("chart");

  const { date, total, item, lastItem: _lastItem } = (props.payload?.[0]?.payload ?? {}) as FinanceChartData;

  if (!item) {
    return null;
  }

  if (!item?.financeData?.length) {
    return null;
  }

  const activePayload = props.activePayload as FinanceChartData | undefined;

  const lastItem = activePayload?.item ?? _lastItem;

  const hasActiveItem = !!activePayload;

  const lastFinanceData = lastItem?.financeData;
  const currentFinanceData = item.financeData;

  const financeList: (Finance & { offset?: number; offset_cny?: number })[] = [];

  currentFinanceData.forEach((item) => {
    if (!lastFinanceData) {
      financeList.push(item);

      return;
    }

    const lastFinance = lastFinanceData?.find((f) => f.id === item.id);

    if (lastFinance) {
      const offset = subAmount(item, lastFinance, item.currency);

      financeList.push({
        ...item,
        offset,
        offset_cny:
          lastFinance.amount_cny && item.amount_cny
            ? item.amount_cny - lastFinance.amount_cny
            : convertCurrency(offset, item.currency, "CNY"),
      });
    } else {
      financeList.push({
        ...item,
        offset: item.amount,
      });
    }
  });

  lastFinanceData?.forEach((item) => {
    if (!financeList.find((f) => f.id === item.id)) {
      financeList.push({
        ...item,
        amount: 0,
        offset: -item.amount,
      });
    }
  });

  financeList.sort((a, b) => Math.abs(b.offset ?? 0) - Math.abs(a.offset ?? 0));

  const totalOffset = lastItem ? item.total - lastItem.total : 0;

  return (
    <Card className="border-primary/80 border border-solid" shadow="lg">
      {hasActiveItem && (
        <div className="bg-primary text-black">
          <div className="flex items-center justify-center p-[6px]">
            <div className="text-xs font-bold">{t("diffWith") + " " + lastItem?.date}</div>
          </div>
        </div>
      )}
      <CardHeader className="flex items-start justify-between">
        <div>
          <FinanceString
            tag="div"
            amount={total ?? 0}
            currency={t("defaultCurrency")}
            className="text-primary font-bold text-base"
          />
          <AmountOffset className="text-xs" currency={t("defaultCurrency")} offset={totalOffset} />
        </div>
        <div className="ml-3 bg-white/10 text-xs py-1 px-[6px] rounded">{date}</div>
      </CardHeader>
      <Divider />
      <CardBody className="flex flex-col gap-2 text-xs">
        {financeList.map((item) => (
          <div key={item.id} className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              {item.name}
            </div>
            <div className="pl-2 flex flex-col items-end">
              <FinanceString tag="div" amount={item.amount} currency={item.currency} className="text-primary" />
              <AmountOffset currency={item.currency} offset={item.offset} offset_cny={item.offset_cny} />
            </div>
          </div>
        ))}
      </CardBody>
    </Card>
  );
}

export default function FinanceChart() {
  const t = useTranslations("chart");

  const { locale } = useLocale();
  const { data: changeData, setDateRange, dateRange } = useFinanceChangeData();
  const { data: financeData } = useFinanceData();
  const [showUnCount, setShowUnCount] = useState(false);
  const [groupByGroup, setGroupByGroup] = useState(true);

  const { data: groupData, loading } = useFinanceGroupData();

  const chartdata = useMemo(() => {
    if (loading) {
      return [];
    }

    const data: FinanceChartData[] = [];

    const ignoreInTotalFinanceId = showUnCount
      ? []
      : financeData.filter((item) => item.not_count).map((item) => item.id);

    // 数据整理：按组分组/unCount
    const checkedChangeData = changeData.map((item) => {
      let changeFinanceData = item.financeData.filter((item) => !ignoreInTotalFinanceId.includes(item.id));

      if (groupByGroup) {
        const tempObj: Record<string | number, Finance | Finance[]> = {};

        changeFinanceData.forEach((item) => {
          const finance_group_id = financeData.find((f) => f.id === item.id)?.finance_group_id;

          item["finance_group_id"] = finance_group_id;

          if (finance_group_id) {
            tempObj[`g_${finance_group_id}`] = ((tempObj[`g_${finance_group_id}`] as Finance[]) || []).concat(item);
          } else {
            tempObj[item.id] = item;
          }
        });

        const tempFinanceData: Finance[] = [];
        Object.values(tempObj).forEach((item) => {
          if (Array.isArray(item)) {
            const currency = [...new Set(item.map((item) => item.currency))].length === 1 ? item[0].currency : "CNY";

            const amount = toFixed2(getTotalFinance(item, currency));
            const amount_cny = toFixed2(getTotalFinance(item, "CNY"));

            tempFinanceData.push({
              ...item[0],
              amount,
              amount_cny,
              currency,
              name: groupData.find((group: { id: number }) => group.id === item[0].finance_group_id)?.name!,
              id: item[0].finance_group_id! * 1000,
            });
          } else {
            tempFinanceData.push(item);
          }
        });

        changeFinanceData = tempFinanceData;
      }

      return {
        ...item,
        financeData: changeFinanceData,
      };
    });

    // 数据去重
    const uniqueChangeData: FinanceChangeChartData[] = [];
    checkedChangeData.forEach((item, index) => {
      const financeData = item.financeData;
      const lastFinanceData = checkedChangeData[index - 1]?.financeData;

      const total = getTotalFinance(financeData, t("defaultCurrency"));
      const lastTotal = lastFinanceData ? getTotalFinance(lastFinanceData, t("defaultCurrency")) : 0;

      if (total === lastTotal) {
        return;
      }

      uniqueChangeData.push({ ...item, total });
    });

    uniqueChangeData.forEach((item, index) => {
      const lastItem = uniqueChangeData[index - 1];

      const lastDate = lastItem?.date;

      if (lastDate) {
        const lastDateLength = getBetweenDateLength(new Date(lastDate), new Date(item.date));

        // 插入空数据保证数据间隔合理
        for (let i = 0; i < lastDateLength; i++) {
          const date = new Date(lastDate);

          date.setDate(date.getDate() + i);

          data.push({
            date: date.toLocaleDateString(),
          });
        }
      }

      data.push({
        date: item.date,
        total: item.total,
        item: {
          ...item,
          financeData: item.financeData,
        },
        lastItem: lastItem
          ? {
              ...lastItem,
              financeData: lastItem.financeData,
            }
          : undefined,
      });
    });

    return data;
  }, [changeData, financeData, groupData, showUnCount, t, loading, groupByGroup]);

  const minValue = useMemo(() => {
    const totalList = chartdata
      .filter((chartItem) => chartItem.item?.total !== undefined)
      .map((chartItem) => chartItem.item!.total!);

    const maxValue = Math.max(...totalList);
    const minValue = Math.min(...totalList);

    if (!maxValue || !minValue) {
      return 0;
    }

    return Math.max(minValue - (maxValue - minValue), 0);
  }, [chartdata]);

  const minDate = new CalendarDate(2025, 4, 1);
  const maxDate = today(getLocalTimeZone());

  if (!chartdata.length) {
    return null;
  }

  return (
    <div className="relative w-full px-4">
      <div className="flex flex-wrap items-center gap-4 my-4">
        <Switch color="primary" isSelected={showUnCount} size="sm" onValueChange={setShowUnCount}>
          <div className="text-sm opacity-80">{t("showUnCount")}</div>
        </Switch>
        <Switch color="primary" isSelected={groupByGroup} size="sm" onValueChange={setGroupByGroup}>
          <div className="text-sm opacity-80">{t("groupByGroup")}</div>
        </Switch>
        <div className="flex-1 hidden md:block" />
        <I18nProvider locale={locale}>
          <DateRangePicker
            className="w-full md:w-65"
            showMonthAndYearPickers
            pageBehavior="single"
            label={null}
            minValue={minDate}
            maxValue={maxDate}
            onError={(error) => setDateRange(dateRange.start, dateRange.end)}
            defaultValue={dateRange}
            value={dateRange}
            onChange={(range) => {
              if (range) {
                setDateRange(range.start, range.end);
              } else {
                setDateRange(minDate, maxDate);
              }
            }}
          ></DateRangePicker>
        </I18nProvider>
      </div>
      <LineChart
        clickable
        connectNulls
        showDots
        startEndOnly
        categories={["total"]}
        className="h-80"
        colors={["primary"]}
        customTooltip={CustomTooltip}
        data={chartdata}
        index="date"
        minValue={minValue}
        showLegend={false}
        type="linear"
      />
    </div>
  );
}
