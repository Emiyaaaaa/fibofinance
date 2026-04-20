import { Button, Spinner } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

import { AIIcon } from "./icons";

import useAI from "@/utils/hook/useAI";
import useFinanceData from "@/utils/store/useFinanceData";
import { DEFAULT_EXCHANGE_RATE } from "@/utils/exchangeRate";
import { mdToHtml } from "@/utils/mdToHtml";
import { useGroup } from "@/utils/store/useGroup";

export default function FinanceAI() {
  const t = useTranslations("home");
  const { content, pushMessage, isLoading } = useAI();
  const [hasAI, setHasAI] = useState<boolean>(false);
  const [html, setHtml] = useState<string>("");
  const { data } = useFinanceData();
  const { groupId } = useGroup();

  useEffect(() => {
    setHtml("");
  }, [groupId]);

  useEffect(() => {
    const checkAI = async () => {
      const res = await fetch("/api/suggestion/check");
      const { hasAI } = await res.json();

      setHasAI(hasAI);
    };

    checkAI();
  }, []);

  useEffect(() => {
    if (!content) return;
    const { reason } = JSON.parse(content);

    setHtml(mdToHtml(reason));
  }, [content]);

  const handleSuggestion = () => {
    const prompt = [
      {
        role: "system",
        content:
          "你是一位经验丰富的金融顾问，擅长根据用户的资产情况和风险偏好提供分析与建议。请给出清晰、可执行的文字建议，不要替用户修改具体账户金额。",
      },
      {
        role: "user",
        content: `
        请基于以下信息，结合当前经济形势，用文字给出资产配置与风险方面的建议（可使用 Markdown 小节与列表）。

        - 以下是我的资产情况：
        ${data.map((item) => `- name: ${item.name}，amount: ${item.amount} ${item.currency}`).join("\n")}

        - 以下是汇率情况（供你理解多币种资产）：
        ${JSON.stringify(DEFAULT_EXCHANGE_RATE)}

        - 注意：reason 使用 ${t("language")} 输出，内容为 Markdown 字符串。

        - 输出格式：
          以 JSON 输出，且仅包含以下字段（不要输出其他内容）：
          {
            "reason": string
          }
        `,
      },
    ];

    pushMessage(prompt);
  };

  if (!hasAI) return null;

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button
        color="primary"
        startContent={isLoading ? <Spinner size="sm" variant="gradient" /> : <AIIcon size={18} />}
        variant="ghost"
        onPress={handleSuggestion}
      >
        {t("getAIAdvice")}
      </Button>
      {html && <div dangerouslySetInnerHTML={{ __html: html }} className="w-full markdown-body p-4 rounded-lg" />}
    </div>
  );
}
