"use client";

import { useState, useEffect } from 'react';
import { getCacheStats } from '@/hooks/use-firestore';
import { cachedFirestoreService } from '@/lib/firestore-cached';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CacheDebug() {
  const [stats, setStats] = useState<any>(null);
  const [mobileStats, setMobileStats] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(async () => {
        const [memoryStats, mobileCacheStats] = await Promise.all([
          getCacheStats(),
          cachedFirestoreService.getCacheStats()
        ]);
        setStats(memoryStats);
        setMobileStats(mobileCacheStats);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const handleClearCache = async () => {
    await cachedFirestoreService.clearAllCache();
    // Actualizar stats inmediatamente
    const [memoryStats, mobileCacheStats] = await Promise.all([
      getCacheStats(),
      cachedFirestoreService.getCacheStats()
    ]);
    setStats(memoryStats);
    setMobileStats(mobileCacheStats);
  };

  if (!isVisible) {
    return (
      <Button 
        onClick={() => setIsVisible(true)}
        variant="outline" 
        size="sm"
        className="fixed bottom-4 right-4 opacity-20 hover:opacity-100 z-50"
      >
        📊 Cache
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 z-50 bg-black/95 border-gray-700 max-h-[80vh] overflow-y-auto">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm text-white">🗄️ Cache Manager</CardTitle>
          <div className="flex gap-1">
            <Button 
              onClick={handleClearCache}
              variant="ghost" 
              size="sm"
              className="text-red-400 hover:text-red-300 h-6 px-2 text-xs"
            >
              🧹 Limpiar
            </Button>
            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        
        {/* 📱 CACHE MÓVIL (IndexedDB) */}
        {mobileStats && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-400">📱 Cache Móvil (IndexedDB)</h4>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Dispositivo:</span>
              <Badge variant={mobileStats.isMobile ? "destructive" : "default"}>
                {mobileStats.isMobile ? "📱 Móvil" : "🖥️ Desktop"}
              </Badge>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Versículos bíblicos:</span>
              <span className="text-white">{mobileStats.bibleVersesCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Devocionales:</span>
              <span className="text-white">{mobileStats.devocionalesTotalCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Tamaño estimado:</span>
              <span className="text-white">{mobileStats.estimatedSize}</span>
            </div>
            
            {mobileStats.totalCached && (
              <div className="text-xs text-gray-500 mt-1 p-2 bg-gray-800 rounded">
                💾 {mobileStats.totalCached}
              </div>
            )}
          </div>
        )}

        {/* 🧠 CACHE MEMORIA (RAM) */}
        {stats && (
          <div className="space-y-2 border-t border-gray-700 pt-2">
            <h4 className="text-sm font-semibold text-green-400">🧠 Cache RAM</h4>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Memoria usada:</span>
              <span className="text-white">
                {stats.totalSize}KB / {stats.maxSize}KB
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Items temporales:</span>
              <span className="text-white">{stats.itemCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Duración:</span>
              <span className="text-white">
                {Math.round(stats.config.duration / 60000)}min
              </span>
            </div>
            
            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ 
                  width: `${Math.min((stats.totalSize / stats.maxSize) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* 📊 INFORMACIÓN */}
        <div className="text-xs text-gray-500 space-y-1 border-t border-gray-700 pt-2">
          <p>📱 <strong>Cache Móvil:</strong> Datos permanentes (IndexedDB)</p>
          <p>🧠 <strong>Cache RAM:</strong> Datos temporales (se pierden al cerrar)</p>
          <p>🚀 <strong>Precarga automática:</strong> Capítulos populares + últimos 3 devocionales</p>
        </div>

        {/* 🎯 BENEFICIOS */}
        <div className="text-xs bg-blue-900/20 border border-blue-700 rounded p-2">
          <h5 className="text-blue-300 font-semibold mb-1">🎯 Beneficios Móviles:</h5>
          <ul className="text-gray-300 space-y-1">
            <li>• ⚡ Devocionales instantáneos offline</li>
            <li>• 📖 Versículos populares precargados</li>
            <li>• 📊 Uso mínimo de datos móviles</li>
            <li>• 🔄 Actualización inteligente</li>
          </ul>
        </div>
        
      </CardContent>
    </Card>
  );
} 