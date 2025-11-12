'use client'

import { useState, useEffect } from 'react'
import type { TranslationKey } from '@/i18n/translations'
import { playSound } from '@/utils/sounds'
import { useApp } from '@/components/context/AppContext'
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Image,
} from '@chakra-ui/react'

const MOTIVATIONAL_PHRASE_KEYS: TranslationKey[] = [
  'finished.phrase1',
  'finished.phrase2',
  'finished.phrase3',
  'finished.phrase4',
  'finished.phrase5',
]

const GIF_ROTATION_INTERVAL = 4000

interface GiphyGif {
  id: string
  url: string
  images: {
    fixed_width: {
      url: string
      width: string
      height: string
    }
  }
}

async function fetchGiphyGifs(query: string): Promise<GiphyGif[]> {
  try {
    const response = await fetch(
      `/api/giphy?q=${encodeURIComponent(query)}&limit=3`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch Giphy GIFs:', error)
    return []
  }
}

export function FinishedStage() {
  const { sessionState, resetDaily, t } = useApp()
  const stats = sessionState.participantStats
  const [randomPhraseKey] = useState(() =>
    MOTIVATIONAL_PHRASE_KEYS[Math.floor(Math.random() * MOTIVATIONAL_PHRASE_KEYS.length)]
  )
  const [gifs, setGifs] = useState<GiphyGif[]>([])
  const [currentGifIndex, setCurrentGifIndex] = useState(0)
  const [feedbackGiven, setFeedbackGiven] = useState(false)

  const totalTimeUsed = stats.reduce((sum, s) => sum + s.timeUsed, 0)
  const exceededCount = stats.filter((s) => s.exceeded).length
  const punctualCount = stats.length - exceededCount

  // Fetch GIFs on mount
  useEffect(() => {
    const queries = ['celebration', 'success', 'high five', 'party', 'congratulations']
    const randomQuery = queries[Math.floor(Math.random() * queries.length)]

    fetchGiphyGifs(randomQuery).then((fetchedGifs) => {
      if (fetchedGifs.length > 0) {
        setGifs(fetchedGifs)
      }
    })
  }, [])

  // Rotate GIFs
  useEffect(() => {
    if (gifs.length <= 1) return

    const interval = setInterval(() => {
      setCurrentGifIndex((prev) => (prev + 1) % gifs.length)
    }, GIF_ROTATION_INTERVAL)

    return () => clearInterval(interval)
  }, [gifs.length])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${String(secs).padStart(2, '0')}`
  }

  const handleFeedback = async (type: 'like' | 'dislike') => {
    try {
      await fetch(`/api/feedback/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      setFeedbackGiven(true)
    } catch (error) {
      console.error('Error sending feedback:', error)
    }
  }

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} display="flex" alignItems={{ base: 'flex-start', md: 'center' }} py={{ base: 8, md: 0 }} overflowY="auto" position="relative">
      <ConfettiAnimation />
      <Container maxW="3xl" w="full" px={{ base: 4, md: 6 }}>
        <VStack gap={{ base: 4, md: 6 }} align="stretch">
          {/* Header */}
          <VStack gap={{ base: 2, md: 1 }} textAlign="center">
            <Heading size={{ base: '4xl', md: '5xl' }} fontWeight="600" color="gray.900" _dark={{ color: 'gray.100' }} letterSpacing="tight">
              {t(randomPhraseKey)}
            </Heading>
          </VStack>

          {/* GIF Animation */}
          {gifs.length > 0 && (
            <Box
              display="flex"
              justifyContent="center"
              w="full"
            >
              <Box
                rounded="lg"
                overflow="hidden"
                borderWidth="1px"
                borderColor="gray.200"
                bg="white"
                _dark={{ borderColor: 'gray.700', bg: 'gray.800' }}
                maxW={{ base: '90vw', md: '400px' }}
                w="full"
                minH={{ base: '30vh', md: '256px' }}
                maxH={{ base: '30vh', md: '256px' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Image
                  src={gifs[currentGifIndex].images.fixed_width.url}
                  alt="Celebration GIF"
                  w="full"
                  h="auto"
                  objectFit="cover"
                  transition="opacity 0.3s"
                />
              </Box>
            </Box>
          )}

            {/* Stats Overview */}
            <Grid templateColumns={{ base: 'repeat(3, 1fr)' }} gap={3}>
              <GridItem>
                <VStack
                  gap={1}
                  p={4}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                  rounded="lg"
                >
                  <Text fontSize="2xl" fontWeight="300" color="gray.900" _dark={{ color: 'gray.100' }}>
                    {formatTime(totalTimeUsed)}
                  </Text>
                  <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
                    {t('finished.totalTime')}
                  </Text>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack
                  gap={1}
                  p={4}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                  rounded="lg"
                >
                  <Text fontSize="2xl" fontWeight="300" color="gray.900" _dark={{ color: 'gray.100' }}>
                    {punctualCount}
                  </Text>
                  <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
                    {t('finished.punctual')}
                  </Text>
                </VStack>
              </GridItem>

              <GridItem>
                <VStack
                  gap={1}
                  p={4}
                  bg="white"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                  rounded="lg"
                >
                <Text fontSize="2xl" fontWeight="300" color={exceededCount > 0 ? 'red.500' : 'gray.900'} _dark={{ color: exceededCount > 0 ? 'red.400' : 'gray.100' }}>
                  {exceededCount}
                </Text>
                <Text fontSize="xs" color="gray.500" _dark={{ color: 'gray.400' }}>
                  {t('finished.exceeded')}
                </Text>
                </VStack>
              </GridItem>
            </Grid>

          {exceededCount > 3 && (
            <Box p={3} bg="yellow.50" borderWidth="1px" borderColor="yellow.200" _dark={{ bg: 'yellow.950', borderColor: 'yellow.900' }} rounded="lg">
              <Text fontSize="xs" color="gray.700" _dark={{ color: 'yellow.200' }}>
                {t('finished.tip')}
              </Text>
            </Box>
          )}

          {/* Feedback Card */}
          <Box
            p={2}
            // bg="white"
            // borderWidth="1px"
            // borderColor="gray.200"
            // _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
            rounded="lg"
          >
            {!feedbackGiven ? (
              <VStack gap={2}>
                <Text fontSize="sm" fontWeight="500" color="gray.700" _dark={{ color: 'gray.300' }}>
                  {t('finished.feedbackQuestion')}
                </Text>
                <HStack gap={3}>
                  <Button
                    onClick={() => handleFeedback('like')}
                    size="lg"
                    variant="ghost"
                    fontSize="3xl"
                    _hover={{ transform: 'scale(1.2)', bg: 'green.50', _dark: { bg: 'green.950' } }}
                    transition="transform 0.2s"
                  >
                    👍
                  </Button>
                  <Button
                    onClick={() => handleFeedback('dislike')}
                    size="lg"
                    variant="ghost"
                    fontSize="3xl"
                    _hover={{ transform: 'scale(1.2)', bg: 'red.50', _dark: { bg: 'red.950' } }}
                    transition="transform 0.2s"
                  >
                    👎
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Text fontSize="sm" fontWeight="500" color="gray.700" _dark={{ color: 'gray.300' }} textAlign="center">
                {t('finished.feedbackThanks')}
              </Text>
            )}
          </Box>

          {/* Actions */}
          <HStack gap={2} justify="center">
            <Button
              onClick={() => {
                playSound('transition')
                resetDaily()
              }}
              size="lg"
              bg="gray.900"
              color="white"
              _dark={{ bg: 'gray.100', color: 'gray.900' }}
              _hover={{ bg: 'gray.800', _dark: { bg: 'gray.200' } }}
              rounded="lg"
              px={6}
              fontSize="sm"
            >
              {t('finished.newDaily')}
            </Button>
          </HStack>
        </VStack>
      </Container>
    </Box>
  )
}

function ConfettiAnimation() {
  const colors = [
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

  const confettiPieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.8}s`,
    animationDuration: `${2.5 + Math.random() * 1.5}s`,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: Math.random() > 0.5 ? 3 : 2,
    rotation: Math.random() * 360,
  }))

  return (
    <Box position="fixed" inset={0} pointerEvents="none" zIndex={50} overflow="hidden">
      {confettiPieces.map((piece) => (
        <Box
          key={piece.id}
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
}
