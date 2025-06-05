# 图标功能国际化实现

## 概述

已成功为图标选择器功能添加了完整的国际化（i18n）支持，支持中英文界面切换。

## 实现内容

### 1. 新增翻译键

在 `i18n/en.json` 和 `i18n/zh.json` 中添加了 `iconPicker` 部分：

#### 英文翻译
```json
"iconPicker": {
  "selectIcon": "Select Icon",
  "createNewIcon": "Create New Icon",
  "iconKey": "Icon Key",
  "iconKeyPlaceholder": "e.g., my-icon",
  "iconName": "Icon Name (Optional)",
  "iconNamePlaceholder": "e.g., My Icon",
  "svgContent": "SVG Content",
  "svgContentPlaceholder": "<svg viewBox=\"0 0 24 24\">...</svg>",
  "preview": "Preview:",
  "uniqueIdentifier": "Unique identifier for the icon",
  "pasteSvgCode": "Paste the SVG code here",
  "iconKeyRequired": "Icon key and SVG content are required",
  "failedToCreateIcon": "Failed to create icon",
  "iconKeyExists": "Icon key already exists",
  "invalidSvgContent": "Invalid SVG content",
  "select": "Select",
  "cancel": "Cancel",
  "createIcon": "Create Icon"
}
```

#### 中文翻译
```json
"iconPicker": {
  "selectIcon": "选择图标",
  "createNewIcon": "创建新图标",
  "iconKey": "图标键值",
  "iconKeyPlaceholder": "例如：my-icon",
  "iconName": "图标名称（可选）",
  "iconNamePlaceholder": "例如：我的图标",
  "svgContent": "SVG内容",
  "svgContentPlaceholder": "<svg viewBox=\"0 0 24 24\">...</svg>",
  "preview": "预览：",
  "uniqueIdentifier": "图标的唯一标识符",
  "pasteSvgCode": "在此粘贴SVG代码",
  "iconKeyRequired": "图标键值和SVG内容为必填项",
  "failedToCreateIcon": "创建图标失败",
  "iconKeyExists": "图标键值已存在",
  "invalidSvgContent": "无效的SVG内容",
  "select": "选择",
  "cancel": "取消",
  "createIcon": "创建图标"
}
```

### 2. 组件更新

更新了 `IconPicker` 组件：
- 使用 `useTranslations("iconPicker")` hook
- 将所有硬编码的文本替换为翻译键
- 错误消息根据API返回的错误类型选择相应的翻译

### 3. 错误处理国际化

根据API返回的错误信息，智能选择对应的翻译：
```typescript
if (data.error === "Icon key already exists") {
  setError(t("iconKeyExists"));
} else if (data.error === "Invalid SVG content") {
  setError(t("invalidSvgContent"));
} else {
  setError(t("failedToCreateIcon"));
}
```

## 用户体验

- 所有UI文本根据用户选择的语言自动切换
- 错误提示信息使用用户语言显示
- 占位符文本也进行了本地化处理
- 保持了原有的功能完整性

## 扩展建议

如果需要为预设图标添加多语言名称，可以：
1. 在翻译文件中添加图标名称映射
2. 在渲染图标名称时使用翻译键
3. 或在数据库中存储多语言名称

## 测试

切换语言后，图标选择器的所有文本都会相应更新：
- Modal标题
- 输入框标签和占位符
- 按钮文本
- 错误消息
- 描述文本