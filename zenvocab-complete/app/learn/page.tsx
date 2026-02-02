"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, Word } from '@/lib/db'
import { generateWordContent } from '@/lib/ai'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Volume2, Loader2, RefreshCw } from 'lucide-react'

const CHUNK_SIZE = 20 // 每次加载的单词数量

export default function LearnPage() {
  const router = useRouter()
  const [words, setWords] = useState<Word[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [totalUnlearned, setTotalUnlearned] = useState(0)

  useEffect(() => {
    loadWords()
  }, [])

  const loadWords = async () => {
    setLoading(true)
    // 加载未学习的单词
    const allWords = await db.words.toArray()
    const unlearned = allWords.filter(w => !w.learned)
    
    setTotalUnlearned(unlearned.length)
    
    // 只加载前 CHUNK_SIZE 个
    const chunk = unlearned.slice(0, CHUNK_SIZE)
    setWords(chunk)
    setLoading(false)
  }

  const loadMoreWords = async () => {
    const allWords = await db.words.toArray()
    const unlearned = allWords.filter(w => !w.learned)
    setTotalUnlearned(unlearned.length)
    
    const newChunk = unlearned.slice(0, CHUNK_SIZE)
    setWords(newChunk)
  }

  const toggleWord = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      return
    }

    setExpandedId(id)
    
    const word = words.find(w => w.id === id)
    if (!word || word.aiContent) return

    // 生成 AI 内容
    setGeneratingId(id)
    try {
      const aiContent = await generateWordContent(word.word)
      await db.words.update(id, { aiContent })
      
      // 更新本地状态
      setWords(prev => prev.map(w => 
        w.id === id ? { ...w, aiContent } : w
      ))
    } catch (error) {
      console.error('Failed to generate content:', error)
    } finally {
      setGeneratingId(null)
    }
  }

  const markAsLearned = async (id: number) => {
    await db.words.update(id, { 
      learned: true, 
      learnedAt: new Date() 
    })
    
    // 从列表中移除
    setWords(prev => prev.filter(w => w.id !== id))
    setExpandedId(null)
    
    // 如果当前列表少于 5 个，自动加载更多
    if (words.length <= 5) {
      setTimeout(() => loadMoreWords(), 500)
    }
  }

  const playPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = 'en-US'
      utterance.rate = 0.8
      window.speechSynthesis.speak(utterance)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl">🎉</div>
          <h2 className="text-2xl font-bold">太棒了！</h2>
          <p className="text-muted-foreground">
            你已经完成了所有单词的学习
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
          <div className="text-sm text-muted-foreground text-right">
            <div>本批次 {words.length} 个</div>
            <div className="text-xs">总剩余 {totalUnlearned} 个</div>
          </div>
        </div>
      </div>

      {/* 单词列表 */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
        {words.map((word) => {
          const isExpanded = expandedId === word.id
          const isGenerating = generatingId === word.id
          
          return (
            <div
              key={word.id}
              className="bg-card border rounded-lg overflow-hidden transition-all"
            >
              {/* 单词头部 */}
              <div className="p-4 flex items-start gap-3">
                <Checkbox
                  checked={false}
                  onCheckedChange={() => markAsLearned(word.id!)}
                  className="mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => toggleWord(word.id!)}
                    className="w-full text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-serif group-hover:text-primary transition-colors">
                        {word.word}
                      </h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          playPronunciation(word.word)
                        }}
                        className="p-1 hover:bg-accent rounded-md transition-colors"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    {!isExpanded && (
                      <p className="text-sm text-muted-foreground mt-1">
                        点击查看详情
                      </p>
                    )}
                  </button>

                  {/* AI 内容 */}
                  {isExpanded && (
                    <div className="mt-4 space-y-4 animate-in fade-in-50 duration-300">
                      {isGenerating ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">AI 生成中...</span>
                        </div>
                      ) : word.aiContent ? (
                        <>
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
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {/* 加载更多提示 */}
        {totalUnlearned > words.length && (
          <div className="text-center py-6">
            <Button
              variant="outline"
              onClick={loadMoreWords}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              刷新加载下一批 ({totalUnlearned - words.length} 个剩余)
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
