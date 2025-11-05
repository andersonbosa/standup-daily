'use client'

import { useEffect, useState } from 'react'
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
} from '@chakra-ui/react'

export function RunningStage() {
  const {
    sessionState,
    presentParticipants,
    timePerParticipant,
    nextParticipant,
    togglePause,
    resetDaily,
    t
  } = useApp()

  const participants = presentParticipants
  const currentIndex = sessionState.currentParticipantIndex
  const remainingSeconds = sessionState.remainingSeconds
  const isPaused = sessionState.isPaused
  const currentParticipant = participants[currentIndex]
  const isOvertime = remainingSeconds < 0
  const progress = Math.max(0, Math.min(100, ((timePerParticipant - remainingSeconds) / timePerParticipant) * 100))

  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (currentIndex > 0) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [currentIndex])

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds)
    const mins = Math.floor(absSeconds / 60)
    const secs = absSeconds % 60
    return `${seconds < 0 ? '-' : ''}${mins}:${String(secs).padStart(2, '0')}`
  }

  return (
    <Box
      h="100vh"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      overflowY={{ base: 'auto', md: 'hidden' }}
      position="relative"
      transition="background-color 1s ease"
    >
      {/* Progress Bar Top */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        h="4px"
        bg="gray.200"
        _dark={{ bg: 'gray.800' }}
        zIndex={100}
      >
        <Box
          h="full"
          bg={isOvertime ? 'red.500' : 'gray.900'}
          _dark={{ bg: isOvertime ? 'red.400' : 'gray.100' }}
          w={`${progress}%`}
          transition="width 1s linear, background-color 0.3s"
        />
      </Box>

      {showConfetti && <ConfettiAnimation />}

      <Container maxW="6xl" h="full" py={{ base: 8, md: 0 }} pt={{ base: 12, md: 0 }}>
        <Grid
          templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
          gap={{ base: 4, md: 8 }}
          h="full"
          alignItems="center"
        >
          {/* Main Timer */}
          <GridItem>
            <VStack gap={{ base: 4, md: 8 }} justify="center">
              <VStack gap={{ base: 3, md: 4 }}>
                <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }} fontWeight="500">
                  {currentIndex + 1} / {participants.length}
                </Text>

                {/* Emoji */}
                <Text fontSize={{ base: '6xl', md: '8xl' }} lineHeight="1">
                  {currentParticipant.emoji}
                </Text>

                <Heading
                  size={{ base: '3xl', md: '4xl' }}
                  fontWeight="600"
                  color="gray.900"
                  _dark={{ color: 'gray.100' }}
                  textAlign="center"
                >
                  {currentParticipant.name}
                </Heading>
              </VStack>

              <VStack gap={{ base: 4, md: 6 }} w="full">
                <Text
                  fontSize={{ base: '7xl', md: '9xl' }}
                  fontWeight="300"
                  color={isOvertime ? 'red.500' : 'gray.900'}
                  _dark={{ color: isOvertime ? 'red.400' : 'gray.100' }}
                  letterSpacing="tight"
                  lineHeight="1"
                >
                  {formatTime(remainingSeconds)}
                </Text>

                <Box w="full" maxW="md">
                  <Box
                    w="full"
                    h="18px"
                    bg="gray.200"
                    _dark={{ bg: 'gray.700' }}
                    rounded="full"
                    overflow="hidden"
                  >
                    <Box
                      h="full"
                      bg={isOvertime ? 'red.500' : 'gray.900'}
                      _dark={{ bg: isOvertime ? 'red.400' : 'gray.100' }}
                      w={`${progress}%`}
                      transition="width 1s linear"
                    />
                  </Box>
                </Box>
              </VStack>

              {isOvertime && (
                <Text
                  fontSize="sm"
                  color="red.500"
                  _dark={{ color: 'red.400' }}
                  fontWeight="500"
                >
                  {t('running.exceeded')}
                </Text>
              )}

              <HStack gap={2} flexWrap="wrap" justify="center">
                <Button
                  onClick={() => {
                    playSound('transition')
                    togglePause()
                  }}
                  size={{ base: 'md', md: 'lg' }}
                  variant="ghost"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  _hover={{
                    color: 'gray.900',
                    bg: 'gray.100',
                    _dark: { color: 'gray.100', bg: 'gray.800' }
                  }}
                  fontSize="sm"
                >
                  {isPaused ? t('running.continue') : t('running.pause')}
                </Button>
                <Button
                  onClick={() => {
                    playSound('transition')
                    nextParticipant()
                  }}
                  size={{ base: 'md', md: 'lg' }}
                  bg="gray.900"
                  color="white"
                  _dark={{ bg: 'gray.100', color: 'gray.900' }}
                  _hover={{
                    bg: 'gray.800',
                    _dark: { bg: 'gray.200' }
                  }}
                  rounded="lg"
                  px={{ base: 6, md: 8 }}
                  fontSize="sm"
                >
                  {t('running.next')}
                </Button>
                <Button
                  onClick={() => {
                    playSound('transition')
                    resetDaily()
                  }}
                  size={{ base: 'md', md: 'lg' }}
                  variant="ghost"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  _hover={{
                    color: 'gray.900',
                    bg: 'gray.100',
                    _dark: { color: 'gray.100', bg: 'gray.800' }
                  }}
                  fontSize="sm"
                >
                  {t('running.restart')}
                </Button>
              </HStack>
            </VStack>
          </GridItem>

          {/* Participants List */}
          <GridItem>
            <Box
              bg="white"
              borderWidth="1px"
              borderColor="gray.200"
              _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
              rounded="lg"
              p={{ base: 3, lg: 4 }}
              maxH={{ base: '200px', lg: 'calc(100vh - 4rem)' }}
            >
              <VStack gap={{ base: 2, lg: 3 }} align="stretch">
                <Text
                  fontSize="xs"
                  fontWeight="500"
                  color="gray.700"
                  _dark={{ color: 'gray.300' }}
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  {t('running.order')}
                </Text>
                <VStack
                  gap={{ base: 1, lg: 1.5 }}
                  overflowY="auto"
                  maxH={{ base: '150px', lg: 'calc(100vh - 10rem)' }}
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#E5E7EB',
                      borderRadius: '3px',
                    },
                  }}
                >
                  {participants.map((participant, index) => (
                    <HStack
                      key={participant.id}
                      p={{ base: 2, lg: 2.5 }}
                      w="full"
                      bg={index === currentIndex ? 'gray.900' : 'transparent'}
                      color={index === currentIndex ? 'white' : index < currentIndex ? 'gray.400' : 'gray.900'}
                      _dark={{
                        bg: index === currentIndex ? 'gray.100' : 'transparent',
                        color: index === currentIndex ? 'gray.900' : index < currentIndex ? 'gray.500' : 'gray.100'
                      }}
                      rounded="md"
                      fontWeight={index === currentIndex ? '600' : '400'}
                      fontSize={{ base: 'xs', lg: 'sm' }}
                    >
                      <Text fontSize={{ base: 'md', lg: 'lg' }}>{participant.emoji}</Text>
                      <Text flex={1} truncate>{participant.name}</Text>
                      {index < currentIndex && <Text fontSize="xs">✓</Text>}
                      {index === currentIndex && (
                        <Box
                          w={2}
                          h={2}
                          bg="white"
                          _dark={{ bg: 'gray.900' }}
                          rounded="full"
                          className="animate-pulse"
                        />
                      )}
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </Box>
          </GridItem>
        </Grid>
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

  const confettiPieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 0.6}s`,
    animationDuration: `${2 + Math.random() * 1}s`,
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
