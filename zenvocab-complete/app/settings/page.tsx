"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Upload, Moon, Sun, Trash2 } from 'lucide-react'
import { exportData, importData, downloadBackup } from '@/lib/backup'
import { useTheme } from '@/lib/use-theme'
import { db } from '@/lib/db'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [importing, setImporting] = useState(false)

  const handleExport = async () => {
    try {
      const data = await exportData()
      const filename = `zenvocab-backup-${new Date().toISOString().split('T')[0]}.json`
      downloadBackup(data, filename)
      alert('数据导出成功！')
    } catch (error) {
      alert('导出失败: ' + error)
      console.error('Export error:', error)
    }
  }

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      alert('请选择 JSON 格式的备份文件')
      return
    }

    setImporting(true)
    try {
      const text = await file.text()
      const result = await importData(text)
      
      if (result.success) {
        alert(result.message)
        if (result.imported > 0) {
          router.push('/')
        }
      } else {
        alert(result.message)
      }
    } catch (error) {
      alert('导入失败: ' + error)
      console.error('Import error:', error)
    } finally {
      setImporting(false)
      event.target.value = ''
    }
  }

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ 警告：此操作将删除所有单词和学习进度，且无法恢复！\n\n建议先导出备份。\n\n确定要清空所有数据吗？'
    )
    
    if (!confirmed) return

    const doubleConfirm = window.confirm('再次确认：真的要删除所有数据吗？')
    
    if (!doubleConfirm) return

    try {
      await db.words.clear()
      alert('所有数据已清空')
      router.push('/')
    } catch (error) {
      alert('清空失败: ' + error)
      console.error('Clear error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-background border-b z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <h1 className="text-lg font-semibold">设置</h1>
          <div className="w-16"></div>
        </div>
      </div>

      {/* 设置内容 */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        
        {/* 外观设置 */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">外观</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <div>
                <div className="font-medium">深色模式</div>
                <div className="text-sm text-muted-foreground">
                  {theme === 'dark' ? '已开启' : '已关闭'}
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
            >
              切换
            </Button>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">数据管理</h2>
          <div className="space-y-3">
            
            {/* 导出数据 */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5" />
                <div>
                  <div className="font-medium">导出备份</div>
                  <div className="text-sm text-muted-foreground">
                    保存所有单词和进度
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleExport}
              >
                导出
              </Button>
            </div>

            {/* 导入数据 */}
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5" />
                <div>
                  <div className="font-medium">导入备份</div>
                  <div className="text-sm text-muted-foreground">
                    从备份文件恢复数据
                  </div>
                </div>
              </div>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                  id="import-backup"
                  disabled={importing}
                />
                <label htmlFor="import-backup">
                  <Button
                    variant="outline"
                    disabled={importing}
                    asChild
                  >
                    <span className="cursor-pointer">
                      {importing ? '导入中...' : '导入'}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            {/* 清空数据 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5 text-destructive" />
                <div>
                  <div className="font-medium text-destructive">清空所有数据</div>
                  <div className="text-sm text-muted-foreground">
                    删除所有单词和进度
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleClearAllData}
                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                清空
              </Button>
            </div>
          </div>
        </div>

        {/* 关于 */}
        <div className="bg-card border rounded-lg p-4">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">关于</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">应用名称</span>
              <span className="font-medium">ZenVocab</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">版本</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">数据存储</span>
              <span className="font-medium">浏览器本地</span>
            </div>
          </div>
        </div>

        {/* PWA 提示 */}
        <div className="bg-muted/50 border border-dashed rounded-lg p-4">
          <div className="text-sm space-y-2">
            <div className="font-medium">💡 提示</div>
            <p className="text-muted-foreground">
              你可以将此应用添加到手机主屏幕，像原生 App 一样使用：
            </p>
            <ul className="text-muted-foreground space-y-1 ml-4">
              <li>• iOS: Safari 浏览器 → 分享 → 添加到主屏幕</li>
              <li>• Android: Chrome 浏览器 → 菜单 → 安装应用</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
