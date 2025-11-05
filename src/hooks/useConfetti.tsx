'use client'

import { useState, useEffect } from 'react'
import { Box } from '@chakra-ui/react'

interface UseConfettiOptions {
  duration?: number
  loop?: boolean
  loopInterval?: number
  autoStart?: boolean
  pieceCount?: number
}

interface ConfettiPiece {
  id: number
  left: string
  animationDelay: string
  animationDuration: string
  color: string
  size: number
  rotation: number
}

const CONFETTI_COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // cyan
  '#45B7D1', // blue
  '#FFA07A', // orange
  '#98D8C8', // mint
  '#F7DC6F', // yellow
  '#BB8FCE', // purple
  '#85C1E2', // light blue
  '#F8B739', // gold
  '#EC7063', // coral
]

export function useConfetti({
  duration = 3000,
  loop = false,
  loopInterval = 1000,
  autoStart = true,
  pieceCount = 80,
}: UseConfettiOptions = {}) {
  const [isActive, setIsActive] = useState(autoStart)
  const [confettiLayers, setConfettiLayers] = useState<number[]>([])

  useEffect(() => {
    if (!isActive) return

    // Adiciona uma nova camada de confetti
    const newLayer = Date.now()
    setConfettiLayers(prev => [...prev, newLayer])

    // Remove a camada após a duração da animação
    const timer = setTimeout(() => {
      setConfettiLayers(prev => prev.filter(layer => layer !== newLayer))
    }, duration)

    return () => clearTimeout(timer)
  }, [isActive, duration])

  useEffect(() => {
    if (!loop || !isActive) return

    const interval = setInterval(() => {
      // Força uma nova renderização para adicionar nova camada
      setIsActive(false)
      setTimeout(() => setIsActive(true), 10)
    }, loopInterval)

    return () => clearInterval(interval)
  }, [loop, isActive, loopInterval])

  const start = () => {
    setIsActive(true)
  }

  const stop = () => {
    setIsActive(false)
    setConfettiLayers([])
  }

  const generateConfettiPieces = (): ConfettiPiece[] => {
    return Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 0.8}s`,
      animationDuration: `${2.5 + Math.random() * 1.5}s`,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: Math.random() > 0.5 ? 3 : 2,
      rotation: Math.random() * 360,
    }))
  }

  const ConfettiComponent = () => {
    if (confettiLayers.length === 0) return null

    return (
      <Box
        position="fixed"
        inset={0}
        pointerEvents="none"
        zIndex={50}
        overflow="hidden"
      >
        {confettiLayers.map((layerKey) => {
          const pieces = generateConfettiPieces()
          return (
            <Box key={layerKey} position="absolute" inset={0}>
              {pieces.map((piece) => (
                <Box
                  key={`${layerKey}-${piece.id}`}
                  position="absolute"
                  w={piece.size}
                  h={piece.size}
                  bg={piece.color}
                  rounded="full"
                  className="animate-confetti"
                  style={{
                    left: piece.left,
                    top: '-20px',
                    animationDelay: piece.animationDelay,
                    animationDuration: piece.animationDuration,
                    transform: `rotate(${piece.rotation}deg)`,
                  }}
                />
              ))}
            </Box>
          )
        })}
      </Box>
    )
  }

  return {
    isActive,
    start,
    stop,
    ConfettiComponent,
  }
}

