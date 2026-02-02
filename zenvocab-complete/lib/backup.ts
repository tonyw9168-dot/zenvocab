import { db, Word } from './db'

export interface BackupData {
  version: string
  exportDate: string
  words: Word[]
}

/**
 * 导出所有数据为 JSON
 */
export async function exportData(): Promise<string> {
  const allWords = await db.words.toArray()
  
  const backup: BackupData = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    words: allWords
  }
  
  return JSON.stringify(backup, null, 2)
}

/**
 * 从 JSON 导入数据
 */
export async function importData(jsonString: string): Promise<{
  success: boolean
  message: string
  imported: number
}> {
  try {
    const backup: BackupData = JSON.parse(jsonString)
    
    if (!backup.words || !Array.isArray(backup.words)) {
      return {
        success: false,
        message: '无效的备份文件格式',
        imported: 0
      }
    }
    
    // 获取现有单词
    const existingWords = await db.words.toArray()
    const existingSet = new Set(existingWords.map(w => w.word))
    
    // 过滤出新单词
    const newWords = backup.words.filter(w => !existingSet.has(w.word))
    
    if (newWords.length === 0) {
      return {
        success: true,
        message: '所有单词已存在，无需导入',
        imported: 0
      }
    }
    
    // 批量插入
    await db.words.bulkAdd(newWords)
    
    return {
      success: true,
      message: `成功导入 ${newWords.length} 个单词`,
      imported: newWords.length
    }
  } catch (error) {
    console.error('导入失败:', error)
    return {
      success: false,
      message: '导入失败: ' + (error as Error).message,
      imported: 0
    }
  }
}

/**
 * 下载数据为文件
 */
export function downloadBackup(data: string, filename: string = 'zenvocab-backup.json') {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
