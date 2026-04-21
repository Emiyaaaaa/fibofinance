import { Button, Modal, ModalBody, ModalContent, ModalFooter, ScrollShadow, Spinner, Textarea } from "@heroui/react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import NodeRenderer from "markstream-react";

import { AIIcon } from "./icons";

import useAI from "@/utils/hook/useAI";
import useFinanceData from "@/utils/store/useFinanceData";
import { DEFAULT_EXCHANGE_RATE } from "@/utils/exchangeRate";
import { useGroup } from "@/utils/store/useGroup";

const SYSTEM_PROMPT =
  "你是一位经验丰富的金融顾问，擅长根据用户的资产情况和风险偏好提供分析与建议。回答要简短、口语化，像聊天给建议，不要写成论文或报告体；不要复述用户已有数据；给出清晰、可执行的建议即可，不要替用户修改具体账户金额。";

export default function FinanceAI() {
  const t = useTranslations("home");
  const { items, sendMessage, isLoading, clearContent } = useAI();
  const [hasAI, setHasAI] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const { data } = useFinanceData();
  const { groupId } = useGroup();

  /** 一旦有对话（含首次提问已发出）或正在请求中，主按钮即显示「查看」 */
  const showViewAdvice = items.length > 0 || isLoading;

  useEffect(() => {
    clearContent();
  }, [groupId, clearContent]);

  useEffect(() => {
    const checkAI = async () => {
      const res = await fetch("/api/suggestion/check");
      const { hasAI } = await res.json();

      setHasAI(hasAI);
    };

    checkAI();
  }, []);

  const buildInitialUserContent = useCallback(() => {
    return `
        请基于以下信息，结合当前经济形势，给出资产配置与风险方面的简短建议。

        背景数据（仅供你内部参考，不要在回答里介绍或复述「你目前有……」这类现状总结）：
        ${data.map((item) => `- name: ${item.name}，amount: ${item.amount} ${item.currency}`).join("\n")}

        汇率（供理解多币种）：
        ${JSON.stringify(DEFAULT_EXCHANGE_RATE)}

        输出要求：使用 ${t("language")}；用 Markdown 普通段落即可，空行分段；不要主标题、副标题、编号小节、列表条目堆砌；如需区分话题，最多用 **加粗** 作一两句段落小标题；不要输出 JSON、不要代码块；不要套话前言后记。
        `;
  }, [data, t]);

  const handleInitialSuggestion = useCallback(() => {
    sendMessage(SYSTEM_PROMPT, buildInitialUserContent());
  }, [buildInitialUserContent, sendMessage]);

  const handleAdviceButtonPress = () => {
    setIsModalOpen(true);
    if (!isLoading && items.length === 0) {
      handleInitialSuggestion();
    }
  };

  const handleSendFollowUp = () => {
    const text = chatInput.trim();
    if (!text || isLoading) return;
    sendMessage(SYSTEM_PROMPT, text);
    setChatInput("");
  };

  if (!hasAI) return null;

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button
        color="primary"
        startContent={isLoading ? <Spinner size="sm" variant="gradient" /> : <AIIcon size={18} />}
        variant="ghost"
        onPress={handleAdviceButtonPress}
      >
        {showViewAdvice ? t("viewAIAdvice") : t("getAIAdvice")}
      </Button>

      <Modal isOpen={isModalOpen} scrollBehavior="inside" size="3xl" onClose={() => setIsModalOpen(false)}>
        <ModalContent className="h-[620px] max-h-[85vh] flex flex-col gap-0 p-0">
          <ScrollShadow className="flex-1 min-h-0 w-full px-6 py-4" orientation="vertical" size={32}>
            <div className="flex flex-col gap-4">
              {items.map((item, index) => {
                if (index === 0 && item.role === "user") {
                  return null;
                }

                const isLast = index === items.length - 1;
                const streamingAssistant = item.role === "assistant" && isLast && isLoading;

                if (item.role === "user") {
                  return (
                    <div key={index} className="flex justify-end">
                      <div className="max-w-[90%] rounded-2xl bg-default-100 px-4 py-3 text-sm whitespace-pre-wrap">
                        {item.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={index} className="min-w-0 w-full">
                    {item.content.trim() ? (
                      <div className="markstream-react text-left">
                        <NodeRenderer
                          content={item.content}
                          deferNodesUntilVisible
                          final={!streamingAssistant}
                          viewportPriority
                        />
                      </div>
                    ) : streamingAssistant ? (
                      <div className="flex justify-center py-8">
                        <Spinner size="lg" variant="gradient" />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </ScrollShadow>
          <ModalFooter className="shrink-0 gap-2 py-3 px-4">
            <Textarea
              minRows={1}
              placeholder={t("aiChatPlaceholder")}
              value={chatInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendFollowUp();
                }
              }}
              onValueChange={setChatInput}
            />
            <Button color="primary" isDisabled={!chatInput.trim() || isLoading} size="md" onPress={handleSendFollowUp}>
              {t("aiChatSend")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
