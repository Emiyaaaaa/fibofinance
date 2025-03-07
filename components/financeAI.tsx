import { Button } from "@heroui/button";

import useStreamToHtml from "@/utils/hook/useStreamToHtml";

export default function FinanceAI() {
  const { html, pushMessage } = useStreamToHtml();

  const handleSuggestion = async () => {
    await pushMessage([
      {
        role: "user",
        content: "请帮我写一篇关于AI的文章，100字左右，返回markdown格式",
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <Button color="primary" variant="ghost" onPress={handleSuggestion}>
        获取AI建议
      </Button>
      <div
        dangerouslySetInnerHTML={{ __html: html }}
        className="w-full markdown-body"
      />
    </div>
  );
}
