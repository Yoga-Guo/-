# 你就学霸：Netlify 部署说明

## 先看结论

本项目不能使用 Netlify 的“拖入网页文件夹”方式发布。那种方式只发布静态页面，不会部署千问接口、兑换码验证和兑换记录。

正确方式是：将“Netlify 源码包”解压后放入 GitHub 仓库，再让 Netlify 导入该仓库。Netlify 会依据包内的 `netlify.toml` 自动完成网页构建、Functions 和 Blob 存储接入。

## 第一步：上传源码到 GitHub

1. 解压 `你就学霸-Netlify源码包.zip`。
2. 在 GitHub 新建一个私有仓库，例如 `ni-jiu-xueba`。
3. 把解压后的全部文件上传到仓库根目录。不要再多套一层文件夹。
4. 确认仓库根目录能直接看到 `package.json`、`netlify.toml` 和 `index.html`。

## 第二步：让 Netlify 导入

1. 登录 Netlify。
2. 选择 `Add new project` → `Import an existing project`。
3. 选择 GitHub，并选择刚才的私有仓库。
4. 构建设置保持项目自动识别的结果：
   - Build command：`npm run build`
   - Publish directory：`dist`
   - Functions directory：`netlify/functions`
5. 先不要点正式发布，继续配置环境变量。

## 第三步：配置环境变量

在 Netlify 项目的 `Project configuration` → `Environment variables` 中添加：

- `DASHSCOPE_API_KEY`：你的阿里云百炼 API Key；
- `QWEN_BASE_URL`：百炼页面显示的 OpenAI compatible 完整地址；
- `QWEN_MODEL`：`qwen-flash`；
- `ACCESS_SECRET`：自己生成的一段随机长字符串，建议至少 32 位。

不要上传本地 `.env`，不要把 API Key 写进 GitHub。

## 第四步：发布并测试

1. 点击 Deploy。
2. 发布完成后打开 Netlify 分配的网址。
3. 从明文兑换码表里选择一个码测试。
4. 在第一个浏览器兑换成功后，在另一个浏览器或无痕窗口输入相同兑换码，应提示“已经绑定了其他浏览器”。

## 兑换规则

- 一个兑换码只绑定首次兑换的浏览器；
- 原浏览器可重复进入，不会再次消耗兑换码；
- 清理浏览器数据、更换浏览器或更换设备后，原兑换码无法重新绑定；
- 每个兑换码累计最多调用 100,000 Token；
- 达到上限后停止 AI 调用，但浏览器本地已有课程进度仍可查看；
- 兑换状态和 Token 用量保存在 Netlify Blobs；
- 明文兑换码表不在部署包中，只由项目拥有者保管。

## 免费额度提醒

Netlify 免费计划包含 Functions 和 Blob 存储，但会消耗其每月 credits；不要开启自动充值。阿里云百炼继续保持“免费额度用完即停”。
