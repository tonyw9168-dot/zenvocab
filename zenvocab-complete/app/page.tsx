"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, Word } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { CircularProgress } from '@/components/ui/circular-progress'
import { Upload, BookOpen, History, Settings } from 'lucide-react'

export default function Home() {
  const router = useRouter()
  const [stats, setStats] = useState({ total: 0, learned: 0 })
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    const allWords = await db.words.toArray()
    const total = allWords.length
    const learned = allWords.filter(w => w.learned).length
    setStats({ total, learned })
  }

  const handleImport = async () => {
    if (!importText.trim()) return

    const lines = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    // 去重
    const uniqueWords = Array.from(new Set(lines))

    // 检查已存在的单词
    const existingWords = await db.words
      .where('word')
      .anyOf(uniqueWords)
      .toArray()
    
    const existingSet = new Set(existingWords.map(w => w.word))
    const newWords = uniqueWords.filter(w => !existingSet.has(w))

    if (newWords.length === 0) {
      alert('所有单词已存在！')
      return
    }

    // 批量插入
    await db.words.bulkAdd(
      newWords.map(word => ({
        word,
        learned: false,
        createdAt: new Date()
      }))
    )

    alert(`成功导入 ${newWords.length} 个新单词！`)
    setImportText('')
    setShowImport(false)
    loadStats()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    console.log('文件上传触发', file)
    
    if (!file) {
      console.log('没有选择文件')
      return
    }

    console.log('文件信息:', { name: file.name, size: file.size, type: file.type })

    // 检查文件类型
    if (!file.name.endsWith('.txt')) {
      alert('请上传 .txt 文件')
      return
    }

    try {
      const text = await file.text()
      console.log('文件内容长度:', text.length)
      console.log('文件前100个字符:', text.substring(0, 100))
      
      setImportText(text)
      
      // 统计单词数用于提示
      const lines = text.split('\n').filter(line => line.trim().length > 0)
      alert(`文件已加载！共 ${lines.length} 行内容`)
    } catch (error) {
      console.error('文件读取失败:', error)
      alert('文件读取失败，请重试: ' + error)
    }

    // 清空 input 以便重复上传同一文件
    event.target.value = ''
  }

  const progress = stats.total > 0 ? (stats.learned / stats.total) * 100 : 0

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo 和设置 */}
        <div className="text-center relative">
          <h1 className="text-4xl font-serif font-bold mb-2">ZenVocab</h1>
          <p className="text-muted-foreground">极简单词流</p>
          
          {/* 设置按钮 */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-0 right-0"
            onClick={() => router.push('/settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* 进度卡片 */}
        <div className="bg-card border rounded-lg p-8 flex flex-col items-center space-y-6">
          <CircularProgress value={progress} size={180} strokeWidth={14} />
          
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold">
              {stats.learned} / {stats.total}
            </div>
            <div className="text-sm text-muted-foreground">
              {stats.total - stats.learned > 0 
                ? `还有 ${stats.total - stats.learned} 个单词待掌握`
                : '🎉 所有单词已掌握！'
              }
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          {stats.total > 0 ? (
            <>
              <Button 
                className="w-full h-12 text-base"
                onClick={() => router.push('/learn')}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                开始学习
              </Button>
              
              {stats.learned > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/review')}
                >
                  <History className="mr-2 h-4 w-4" />
                  复习已学单词 ({stats.learned})
                </Button>
              )}
            </>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-4">
              还没有单词，请先导入
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowImport(!showImport)}
          >
            <Upload className="mr-2 h-4 w-4" />
            导入单词
          </Button>
        </div>

        {/* 导入区域 */}
        {showImport && (
          <div className="bg-card border rounded-lg p-4 space-y-3">
            {/* 文件上传按钮 */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-primary/50 rounded-md cursor-pointer hover:bg-accent transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">从 TXT 文件导入</span>
              </label>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  或手动粘贴
                </span>
              </div>
            </div>

            <textarea
              className="w-full h-40 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="每行一个单词，例如：&#10;abandon&#10;ability&#10;absorb"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={handleImport} className="flex-1">
                确认导入
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowImport(false)}
              >
                取消
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
