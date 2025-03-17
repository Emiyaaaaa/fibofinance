import { Button } from "@heroui/button";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import useAI from "@/utils/hook/useAI";
import useFinanceData from "@/utils/store/useFinanceData";
import { DEFAULT_EXCHANGE_RATE, getTotalFinance } from "@/utils/totalFinance";
import { mdToHtml } from "@/utils/mdToHtml";

export default function FinanceAI() {
  const t = useTranslations("home");
  const { content, pushMessage } = useAI();
  const [html, setHtml] = useState<string>("");
  const { data, updateAiData } = useFinanceData();

  useEffect(() => {
    if (!content) return;
    console.log(content);
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
        请根据以下信息以及2025年的全球经济形势，为我提供一个合理的资产配置建议，并解释你的理由。

        - 以下是我的资产情况：
        ${data.map((item) => `- id: ${item.id}，name: ${item.name}，amount: ${item.amount} ${item.currency}`).join("\n")}

        - 以下是我的总资产：
        ${getTotalFinance(data, t("defaultCurrency"))} ${t("defaultCurrency")}

        - 以下是汇率情况：
        ${JSON.stringify(DEFAULT_EXCHANGE_RATE)}

        - 需要注意以下几点：
          - 2025年全球经济形势：不乐观，需要较多低风险资产或投资
          
          - 需要考虑资产中的汇率因素，资产调整前后的总资产不变

          - 资产配置建议需要考虑资产的流动性、风险性、收益性等因素

          - 需要考虑一些资产的最小值限制，例如股票，定期存款等

          - 建议资产结果精确到小数点后两位

          - 建议金额需要和原有资产金额相等

          - 每项的建议金额的单位需要和原有资产金额的单位一致

          - 输出结果前，主动检查结果总资产和原有总资产是否相等

        - 输出格式：'json'
          {
            "assetAdvice": [
              { 
                "id": number,
                "name": string,
                "amount": number,
              },
            ],
            "reason": string
          }
        `,
      },
    ];

    console.log(prompt);

    pushMessage(prompt);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button color="primary" variant="ghost" onPress={handleSuggestion}>
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
