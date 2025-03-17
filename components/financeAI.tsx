import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Spinner } from "@heroui/spinner";

import { AIIcon } from "./icons";

import useAI from "@/utils/hook/useAI";
import useFinanceData from "@/utils/store/useFinanceData";
import { getTotalFinance } from "@/utils/totalFinance";
import { DEFAULT_EXCHANGE_RATE } from "@/utils/exchangeRate";
import { mdToHtml } from "@/utils/mdToHtml";

export default function FinanceAI() {
  const t = useTranslations("home");
  const { content, pushMessage, isLoading } = useAI();
  const [html, setHtml] = useState<string>("");
  const { data, updateAiData } = useFinanceData();

  useEffect(() => {
    if (!content) return;
    const { assetAdvice, reason } = JSON.parse(content);

    setHtml(mdToHtml(reason));

    updateAiData(assetAdvice);
  }, [content]);

  const handleSuggestion = () => {
    const prompt = [
      {
        role: "system",
        content:
          "你是一位经验丰富的金融顾问，擅长根据用户的资产情况和风险偏好提供合理的资产配置建议。你的建议应结合用户的各类资产，并确保合理分配资金以优化收益和风险。",
      },
      {
        role: "user",
        content: `
        请基于下信息，结合2025年的全球经济形势，提供一个合理的资产配置方案，并确保调整后的资产总额仍然等于 ${getTotalFinance(data, t("defaultCurrency"))} ${t("defaultCurrency")}，
        在调整后检查总资产是否等于 ${getTotalFinance(data, t("defaultCurrency"))} ${t("defaultCurrency")}，并将计算过程和检查结果输出到 "check" 中

        - 以下是我的资产情况：
        ${data.map((item) => `- id: ${item.id}，name: ${item.name}，amount: ${item.amount} ${item.currency}`).join("\n")}

        - 以下是汇率情况：
        ${JSON.stringify(DEFAULT_EXCHANGE_RATE)}

        - 需要注意以下几点：
          - 建议金额需要和原有资产金额相等
          - 2025年全球经济形势：不乐观，需要较多低风险资产或投资
          - 资产配置建议需要考虑资产的流动性、风险性、收益性等因素
          - 需要考虑一些资产的最小值限制，例如股票，定期存款等
          - 建议资产结果精确到小数点后两位
          - 每项的建议金额的单位需要和原有资产金额的单位一致
          - reason 使用 ${t("language")} 输出

        - 输出格式：
          以JSON格式输出，输出格式如下(请严格按照以下格式输出，不要输出其他内容)：
          {
            "assetAdvice": [
              { 
                "id": number,
                "name": string,
                "amount": number
              },
            ],
            "reason": string,
            "total": number, // 调整后的总资产
            "check": string // 检查结果
          }
        `,
      },
    ];

    pushMessage(prompt);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button
        color="primary"
        startContent={isLoading ? <Spinner size="sm" /> : <AIIcon size={18} />}
        variant="ghost"
        onPress={handleSuggestion}
      >
        {t("getAIAdvice")}
      </Button>
      {html && (
        <div
          dangerouslySetInnerHTML={{ __html: html }}
          className="w-full markdown-body p-4 rounded-lg"
        />
      )}
    </div>
  );
}
