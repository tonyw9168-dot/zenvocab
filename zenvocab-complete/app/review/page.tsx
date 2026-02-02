"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, Word } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { ArrowLeft, RotateCcw, Volume2, ChevronDown, ChevronUp } from 'lucide-react'

export default function ReviewPage() {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLearnedWords()
  }, [])

  const loadLearnedWords = async () => {
    setLoading(true)
    const allWords = await db.words.toArray()
    const learnedWords = allWords
      .filter(w => w.learned)
      .sort((a, b) => {
        // 按学习时间倒序（最近学习的在前）
        const timeA = a.learnedAt?.getTime() || 0
        const timeB = b.learnedAt?.getTime() || 0
        return timeB - timeA
      })
    
    setWords(learnedWords)
    setLoading(false)
  }

  const markAsUnlearned = async (id: number) => {
    await db.words.update(id, { 
      learned: false, 
      learnedAt: undefined 
    })
    
    setWords(prev => prev.filter(w => w.id !== id))
    setExpandedId(null)
  }

  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">📚</div>
          <h2 className="text-2xl font-bold">还没有已学单词</h2>
          <p className="text-muted-foreground">
            去学习页面开始学习吧
          </p>
          <Button onClick={() => router.push('/')}>
            返回首页
          </Button>
        </div>
      </div>
    )
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
          <span className="text-sm text-muted-foreground">
            已掌握 {words.length} 个单词
          </span>
        </div>
      </div>

      {/* 已学单词列表 */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        <div className="text-sm text-muted-foreground mb-4">
          💡 点击"忘记了"可以将单词恢复到学习列表
        </div>

        {words.map((word) => {
          const isExpanded = expandedId === word.id
          
          return (
            <div
              key={word.id}
              className="bg-card border rounded-lg overflow-hidden transition-all"
            >
              {/* 单词头部 */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-2xl font-serif">
                        {word.word}
                      </h3>
                      <button
                        onClick={() => playPronunciation(word.word)}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>

                    {word.learnedAt && (
                      <div className="text-xs text-muted-foreground">
                        学习于 {word.learnedAt.toLocaleDateString('zh-CN')}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsUnlearned(word.id!)}
                      className="text-xs"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      忘记了
                    </Button>

                    {word.aiContent && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(word.id!)}
                        className="text-xs"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* AI 内容 */}
                {isExpanded && word.aiContent && (
                  <div className="mt-4 space-y-4 pt-4 border-t animate-in fade-in-50 duration-300">
                    {/* 例句 */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        例句
                      </div>
                      <div className="pl-4 border-l-2 border-primary/20">
                        <p className="text-base italic mb-1">
                          {word.aiContent.example}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {word.aiContent.exampleTranslation}
                        </p>
                      </div>
                    </div>

                    {/* 助记 */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        助记方法
                      </div>
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-sm">
                          {word.aiContent.mnemonic}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
