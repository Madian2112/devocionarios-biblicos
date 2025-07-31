"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Target, TrendingUp, Calendar } from "lucide-react"
import type { TopicalStudy } from "@/lib/firestore"

interface StudyStatsProps {
  studies: TopicalStudy[]
}

export function StudyStats({ studies }: StudyStatsProps) {
  const stats = useMemo(() => {
    const totalStudies = studies.length
    const totalEntries = studies.reduce((sum, study) => sum + study.entries.length, 0)
    const avgEntriesPerStudy = totalStudies > 0 ? Math.round(totalEntries / totalStudies) : 0

    // Estudios activos (con entradas en los últimos 7 días)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const activeStudies = studies.filter((study) => {
      const updatedAt = study.updatedAt?.toDate() || new Date(0)
      return updatedAt > weekAgo && study.entries.length > 0
    }).length

    // Progreso semanal
    const weeklyProgress = Math.min((activeStudies / Math.max(totalStudies, 1)) * 100, 100)

    return {
      totalStudies,
      totalEntries,
      avgEntriesPerStudy,
      activeStudies,
      weeklyProgress,
    }
  }, [studies])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-300">Total Temas</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.totalStudies}</div>
          <p className="text-xs text-blue-300/70">{stats.totalEntries} versículos totales</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-300">Temas Activos</CardTitle>
          <Target className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.activeStudies}</div>
          <p className="text-xs text-green-300/70">Actualizados esta semana</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-300">Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{stats.avgEntriesPerStudy}</div>
          <p className="text-xs text-purple-300/70">versículos por tema</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-300">Progreso Semanal</CardTitle>
          <Calendar className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{Math.round(stats.weeklyProgress)}%</div>
          <Progress value={stats.weeklyProgress} className="mt-2 h-2" />
          <p className="text-xs text-orange-300/70 mt-1">actividad esta semana</p>
        </CardContent>
      </Card>
    </div>
  )
}
