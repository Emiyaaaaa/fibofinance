# SVG图标选择功能实现总结

## 功能概述

在资产管理系统中，我已经成功实现了SVG图标选择功能，允许用户：
1. 在添加/修改资产时选择预设的SVG图标
2. 创建自定义SVG图标并保存到图标库
3. 在资产列表中显示选中的图标

## 技术实现

### 1. 数据库修改

#### 图标表（icons）
```sql
CREATE TABLE icons (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  svg TEXT NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
)
```

#### 资产表修改（finance_data）
- 添加了 `icon VARCHAR(255)` 字段用于存储图标key

### 2. API接口

#### `/api/icons`
- **GET**: 获取所有图标列表
- **POST**: 创建新图标
  - 参数：`key`（唯一标识）、`svg`（SVG内容）、`name`（显示名称）
  - 验证SVG内容有效性
  - 处理重复key的错误

### 3. 组件实现

#### IconPicker组件 (`components/iconPicker.tsx`)
- 图标选择器UI组件
- 支持查看预设图标库
- 支持创建新图标功能
- 实时预览SVG内容
- 错误处理和验证

#### IconRenderer组件 (`components/iconRenderer.tsx`)
- 统一的图标渲染组件
- 实现图标缓存机制，避免重复请求
- 支持自定义大小和样式

### 4. UI集成

#### FinanceModal修改
- 在名称输入框左侧添加了图标选择按钮
- 保存时将图标key与其他数据一起提交

#### FinanceTable修改
- 在资产名称前显示对应的图标
- 使用IconRenderer组件统一渲染

## 预设图标库

系统预置了12个常用的财务相关图标：
- cash（现金）
- bank（银行）
- house（房产）
- wallet（钱包）
- chart（图表）
- coin（硬币）
- stock（股票）
- piggy-bank（存钱罐）
- trending-up（增长）
- shield（保险）
- building（房地产）
- briefcase（商业）

## 使用说明

1. **选择图标**：
   - 在添加/编辑资产时，点击名称左侧的图标按钮
   - 从预设图标库中选择合适的图标
   - 点击"Select"确认选择

2. **创建自定义图标**：
   - 在图标选择器中点击"Create New Icon"
   - 输入唯一的图标key（如：my-custom-icon）
   - 输入图标名称（可选）
   - 粘贴SVG代码
   - 预览效果后点击"Create Icon"保存

3. **SVG格式要求**：
   - 必须包含有效的SVG标签
   - 建议使用 `viewBox` 属性确保缩放正确
   - 使用 `currentColor` 作为颜色值以支持主题切换

## 特点

1. **性能优化**：
   - 图标数据缓存，减少API请求
   - 使用 `dangerouslySetInnerHTML` 直接渲染SVG，性能更好

2. **用户体验**：
   - 直观的图标选择界面
   - 实时SVG预览
   - 完善的错误提示

3. **扩展性**：
   - 易于添加新的预设图标
   - 支持任意SVG内容
   - 可以轻松集成到其他需要图标的地方