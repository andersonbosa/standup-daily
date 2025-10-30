'use client'

import { useState, useEffect } from 'react'
import type { Participant, SessionConfig } from '@/types'
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
} from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import type { TranslationKey } from '@/i18n/translations'

interface SetupStageProps {
  initialConfig: SessionConfig | null
  onStart: (config: SessionConfig) => void
  t: (key: TranslationKey) => string
}

const EMOJI_POOL = [
  '👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬',
  '👨‍🎨', '👩‍🎨', '🧑‍🎨', '👨‍🚀', '👩‍🚀', '🧑‍🚀',
  '🦸‍♂️', '🦸‍♀️', '🦸', '🧙‍♂️', '🧙‍♀️', '🧙',
  '🧛‍♂️', '🧛‍♀️', '🧛', '🧚‍♂️', '🧚‍♀️', '🧚',
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊',
  '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
  '🐷', '🐸', '🐵', '🐔', '🐧', '🐦',
  '🦄', '🦋', '🐝', '🐛', '🦖', '🦕',
  '🌟', '⭐', '💫', '✨', '🔥', '💥',
  '🚀', '🎯', '🎨', '🎭', '🎪', '🎬',
  '🎸', '🎹', '🎺', '🎷', '🥁', '🎤',
  '⚡', '💡', '🔮', '🎲', '🎮', '🕹️',
]

const getRandomEmoji = (usedEmojis: string[]): string => {
  const availableEmojis = EMOJI_POOL.filter(emoji => !usedEmojis.includes(emoji))
  if (availableEmojis.length === 0) {
    // Se todos os emojis foram usados, permite reutilizar
    return EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)]
  }
  return availableEmojis[Math.floor(Math.random() * availableEmojis.length)]
}

export function SetupStage({ initialConfig, onStart, t }: SetupStageProps) {
  const [participants, setParticipants] = useState<Participant[]>(
    initialConfig?.participants || []
  )
  const [totalMinutes, setTotalMinutes] = useState<number>(
    initialConfig?.totalMinutes || 15
  )
  const [newName, setNewName] = useState('')

  const addParticipant = () => {
    if (!newName.trim()) return

    const usedEmojis = participants.map(p => p.emoji || '')
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      emoji: getRandomEmoji(usedEmojis),
      isAbsent: false,
    }

    setParticipants([...participants, newParticipant])
    setNewName('')
  }

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id))
  }

  const toggleAbsent = (id: string) => {
    setParticipants(
      participants.map(p => (p.id === id ? { ...p, isAbsent: !p.isAbsent } : p))
    )
  }

  const updateName = (id: string, name: string) => {
    setParticipants(participants.map(p => (p.id === id ? { ...p, name } : p)))
  }

  const rotateEmoji = (id: string) => {
    const usedEmojis = participants
      .filter(p => p.id !== id)
      .map(p => p.emoji || '')
    
    setParticipants(
      participants.map(p => 
        p.id === id 
          ? { ...p, emoji: getRandomEmoji(usedEmojis) }
          : p
      )
    )
  }

  const handleStart = () => {
    if (participants.length === 0) return
    if (participants.every(p => p.isAbsent)) return

    const config: SessionConfig = {
      participants,
      totalMinutes,
    }

    onStart(config)
  }

  const titleCase = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  const presentCount = participants.filter(p => !p.isAbsent).length
  const timePerPerson = presentCount > 0 ? Math.floor((totalMinutes * 60) / presentCount) : 0

  useEffect(() => {
    if (initialConfig) {
      const lastToastTime = localStorage.getItem('lastConfigToast')
      const now = Date.now()
      const twentyFourHours = 24 * 60 * 60 * 1000

      if (!lastToastTime || now - Number(lastToastTime) > twentyFourHours) {
        toaster.create({
          title: t('setup.configLoaded'),
          description: t('setup.configLoadedDesc'),
          type: 'info',
          duration: 3000,
        })
        localStorage.setItem('lastConfigToast', String(now))
      }
    }
  }, [initialConfig, t])

  return (
    <Box h="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} display="flex" alignItems="center" py={{ base: 8, md: 0 }} overflowY={{ base: 'auto', md: 'hidden' }}>
      <Container maxW="2xl" w="full">
        <VStack gap={{ base: 8, md: 6 }} align="stretch">
          {/* Header */}
          <VStack gap={{ base: 2, md: 1 }} textAlign="center">
            <Heading size={{ base: '4xl', md: '5xl' }} fontWeight="600" color="gray.900" _dark={{ color: 'gray.100' }} letterSpacing="tight">
              {t('app.title')}
            </Heading>
            <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.500" _dark={{ color: 'gray.400' }} fontWeight="400">
              {t('app.subtitle')}
            </Text>
          </VStack>

          {/* Time Input */}
          <VStack gap={3} align="stretch">
            <HStack justify="space-between" align="end">
              <VStack gap={1} align="start" flex={1}>
                <Text fontSize="sm" fontWeight="500" color="gray.700" _dark={{ color: 'gray.300' }}>
                  {t('setup.timeTotal')}
                </Text>
                <Input
                  type="number"
                  min={1}
                  max={60}
                  value={totalMinutes}
                  onChange={(e) => setTotalMinutes(Number.parseInt(e.target.value) || 15)}
                  size="lg"
                  fontSize="lg"
                  bg="white"
                  borderColor="gray.200"
                  _dark={{ bg: 'gray.800', color: 'gray.100', borderColor: 'gray.700' }}
                  _hover={{ borderColor: 'gray.300', _dark: { borderColor: 'gray.600' } }}
                  _focus={{ borderColor: 'gray.900', boxShadow: '0 0 0 1px var(--chakra-colors-gray-900)', _dark: { borderColor: 'gray.100' } }}
                  rounded="lg"
                  w="120px"
                />
              </VStack>
              {presentCount > 0 && (
                <Text fontSize="sm" color="gray.500" pb={2}>
                  {Math.floor(timePerPerson / 60)}:{String(timePerPerson % 60).padStart(2, '0')} × {presentCount}
                </Text>
              )}
            </HStack>
          </VStack>

          {/* Add Participant */}
          <VStack gap={2} align="stretch">
            <Text fontSize="sm" fontWeight="500" color="gray.700" _dark={{ color: 'gray.300' }}>
              {t('setup.addParticipant')}
            </Text>
            <HStack gap={2}>
              <Input
                flex={1}
                value={newName}
                onChange={(e) => setNewName(titleCase(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && addParticipant()}
                placeholder={t('setup.namePlaceholder')}
                size="lg"
                bg="white"
                borderColor="gray.200"
                _dark={{ bg: 'gray.800', color: 'gray.100', borderColor: 'gray.700' }}
                _hover={{ borderColor: 'gray.300', _dark: { borderColor: 'gray.600' } }}
                _focus={{ borderColor: 'gray.900', boxShadow: '0 0 0 1px var(--chakra-colors-gray-900)', _dark: { borderColor: 'gray.100' } }}
                rounded="lg"
              />
              <Button
                onClick={addParticipant}
                size="lg"
                bg="gray.900"
                color="white"
                _dark={{ bg: 'gray.100', color: 'gray.900' }}
                _hover={{ bg: 'gray.800', _dark: { bg: 'gray.200' } }}
                rounded="lg"
                px={6}
              >
                +
              </Button>
            </HStack>
          </VStack>

          {/* Participants List */}
          <VStack gap={2} align="stretch">
            <Text fontSize="sm" fontWeight="500" color="gray.700" _dark={{ color: 'gray.300' }}>
              {t('setup.participants')}
            </Text>
            <Box>
              {participants.length > 0 ? (
                <VStack
                  gap={2}
                  align="stretch"
                  maxH={{ base: '300px', md: '280px' }}
                  overflowY="auto"
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
                  {participants.map((participant) => (
                    <HStack
                      key={participant.id}
                      p={3}
                      bg="white"
                      borderWidth="1px"
                      borderColor="gray.200"
                      _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                      rounded="lg"
                      opacity={participant.isAbsent ? 0.5 : 1}
                      _hover={{ borderColor: 'gray.300', _dark: { borderColor: 'gray.600' } }}
                    >
                      <Button
                        onClick={() => rotateEmoji(participant.id)}
                        size="sm"
                        variant="ghost"
                        fontSize="2xl"
                        p={0}
                        minW="auto"
                        h="auto"
                        _hover={{ transform: 'scale(1.3)', transition: 'transform 0.3s' }}
                        aria-label={t('setup.changeEmoji')}
                        title={t('setup.changeEmoji')}
                      >
                        {participant.emoji}
                      </Button>
                      <Input
                        flex={1}
                        value={participant.name}
                        onChange={(e) => updateName(participant.id, e.target.value)}
                        bg="transparent"
                        border="none"
                        _focus={{ boxShadow: 'none' }}
                        textDecoration={participant.isAbsent ? 'line-through' : 'none'}
                        color={participant.isAbsent ? 'gray.400' : 'gray.900'}
                        _dark={{ color: participant.isAbsent ? 'gray.500' : 'gray.100' }}
                        fontWeight="500"
                        px={0}
                        size="sm"
                      />
                      <Button
                        onClick={() => toggleAbsent(participant.id)}
                        size="sm"
                        variant="ghost"
                        color="gray.500"
                        _dark={{ color: 'gray.400' }}
                        _hover={{ color: 'gray.900', bg: 'gray.100', _dark: { color: 'gray.100', bg: 'gray.700' } }}
                        fontSize="xs"
                      >
                        {participant.isAbsent ? t('setup.present') : t('setup.absent')}
                      </Button>
                      <IconButton
                        onClick={() => removeParticipant(participant.id)}
                        size="sm"
                        variant="ghost"
                        color="gray.400"
                        _hover={{ color: 'red.500', bg: 'red.50', _dark: { color: 'red.400', bg: 'red.950' } }}
                        aria-label={t('setup.remove')}
                        fontSize="xl"
                      >
                        ×
                      </IconButton>
                    </HStack>
                  ))}
                </VStack>
              ) : (
                <Box textAlign="center" py={8} color="gray.400" bg="white" borderWidth="1px" borderColor="gray.200" _dark={{ color: 'gray.500', bg: 'gray.800', borderColor: 'gray.700' }} rounded="lg">
                  <Text fontSize="sm">{t('setup.noParticipants')}</Text>
                </Box>
              )}
            </Box>
          </VStack>

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={presentCount === 0}
            size="lg"
            h="48px"
            bg={presentCount > 0 ? 'gray.900' : 'gray.200'}
            color={presentCount > 0 ? 'white' : 'gray.400'}
            _dark={{ 
              bg: presentCount > 0 ? 'gray.100' : 'gray.700',
              color: presentCount > 0 ? 'gray.900' : 'gray.500'
            }}
            _hover={presentCount > 0 ? { bg: 'gray.800', _dark: { bg: 'gray.200' } } : {}}
            rounded="lg"
            fontSize="md"
            fontWeight="600"
            cursor={presentCount === 0 ? 'not-allowed' : 'pointer'}
          >
            {t('setup.startDaily')}
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}
