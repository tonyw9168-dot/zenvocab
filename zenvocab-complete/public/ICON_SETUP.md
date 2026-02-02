# PWA 图标生成说明

当前项目包含了一个 `icon.svg` 文件。要让 PWA 完整工作，你需要生成 PNG 格式的图标。

## 方法 1：在线工具（推荐）

访问 https://realfavicongenerator.net/ 或 https://www.pwabuilder.com/imageGenerator

上传 `public/icon.svg` 文件，生成以下尺寸的图标：
- icon-192.png (192x192)
- icon-512.png (512x512)

将生成的图标放到 `public/` 目录。

## 方法 2：使用 ImageMagick

如果你安装了 ImageMagick，可以运行：

```bash
convert public/icon.svg -resize 192x192 public/icon-192.png
convert public/icon.svg -resize 512x512 public/icon-512.png
```

## 方法 3：使用 Figma/Photoshop

1. 打开 icon.svg
2. 导出为 PNG
3. 生成 192x192 和 512x512 两个尺寸
4. 保存为 icon-192.png 和 icon-512.png

## 临时方案

如果暂时不需要 PWA 功能，可以先使用占位符图标，不影响网站正常使用。
