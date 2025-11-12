'use client'

import { useState, useEffect, useRef } from 'react'
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
  Portal,
} from '@chakra-ui/react'
import { toaster } from '@/components/ui/toaster'
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react'
import { playSound } from '@/utils/sounds'
import { useApp } from '@/components/context/AppContext'

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

export function SetupStage() {
  const { sessionState, saveConfig, startDaily, t, generateShareLink } = useApp()
  const initialConfig = sessionState.config

  const [participants, setParticipants] = useState<Participant[]>(
    initialConfig?.participants || []
  )
  const [totalMinutes, setTotalMinutes] = useState<number>(
    initialConfig?.totalMinutes || 20
  )
  const [newName, setNewName] = useState('')
  const [emojiPickerOpen, setEmojiPickerOpen] = useState<string | null>(null)
  const emojiButtonRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({})

  const addParticipant = () => {
    if (!newName.trim()) return

    playSound('transition')
    const usedEmojis = participants.map(p => p.emoji || '')
    const newParticipant: Participant = {
      id: crypto.randomUUID(),
      name: newName.trim(),
      emoji: getRandomEmoji(usedEmojis),
      isAbsent: false,
    }

    setParticipants(Array.from(new Set([...participants, newParticipant])))
    setNewName('')
  }

  const removeParticipant = (id: string) => {
    playSound('transition')
    setParticipants(participants.filter(p => p.id !== id))
  }

  const toggleAbsent = (id: string) => {
    playSound('transition')
    setParticipants(
      participants.map(p => (p.id === id ? { ...p, isAbsent: !p.isAbsent } : p))
    )
  }

  const updateName = (id: string, name: string) => {
    setParticipants(participants.map(p => (p.id === id ? { ...p, name } : p)))
  }

  const openEmojiPicker = (id: string) => {
    playSound('transition')
    setEmojiPickerOpen(id)
  }

  const handleEmojiSelect = (emojiData: EmojiClickData, participantId: string) => {
    playSound('transition')
    setParticipants(
      participants.map(p =>
        p.id === participantId
          ? { ...p, emoji: emojiData.emoji }
          : p
      )
    )
    setEmojiPickerOpen(null)
  }

  const shuffleParticipants = () => {
    playSound('transition')
    const shuffled = [...participants]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setParticipants(shuffled)
  }

  const handleStart = () => {
    if (participants.length === 0) return
    if (participants.every(p => p.isAbsent)) return

    playSound('transition')
    const config: SessionConfig = {
      participants,
      totalMinutes,
    }

    saveConfig(config)
    setTimeout(() => startDaily(), 100)
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
          duration: 1000,
        })
        localStorage.setItem('lastConfigToast', String(now))
      }
    }
  }, [initialConfig, t])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerOpen) {
        const target = event.target as HTMLElement
        if (!target.closest('.emoji-picker-container') && !target.closest('.emoji-button')) {
          setEmojiPickerOpen(null)
        }
      }
    }

    if (emojiPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [emojiPickerOpen])

  useEffect(() => {
    if (participants.length > 0 || totalMinutes !== (initialConfig?.totalMinutes || 20)) {
      const config: SessionConfig = {
        participants,
        totalMinutes,
      }
      localStorage.setItem('daily-timer-config', JSON.stringify(config))
    } else if (participants.length === 0 && initialConfig === null) {
      localStorage.removeItem('daily-timer-config')
    }
  }, [participants, totalMinutes, initialConfig])

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} display="flex" alignItems={{ base: 'flex-start', md: 'center' }} py={{ base: 8, md: 0 }} overflowY="auto">
      <Container maxW="2xl" w="full" px={{ base: 4, md: 6 }}>
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
          <VStack gap={2} align="stretch">
            <VStack gap={1} align="start" flex={1}>
              <HStack>
                <Text fontSize="sm" fontWeight="500" color="gray.700" _dark={{ color: 'gray.300' }}>
                  {t('setup.timeTotal')}
                </Text>
                <Text fontSize="sm" color="gray.500" pb={2}>
                  ({Math.floor(timePerPerson / 60)}:{String(timePerPerson % 60).padStart(2, '0')} × {presentCount})
                </Text>
              </HStack>
              <HStack gap={2}>
                <Input
                  id="timeTotal"
                  type="number"
                  min={0}
                  max={60}
                  value={totalMinutes}
                  onChange={(e) => setTotalMinutes(Number.parseInt(e.target.value, 10) || 20)}
                  size="lg"
                  fontSize="lg"
                  bg="white"
                  borderColor="gray.200"
                  _dark={{ bg: 'gray.800', color: 'gray.100', borderColor: 'gray.700' }}
                  _hover={{ borderColor: 'gray.300', _dark: { borderColor: 'gray.600' } }}
                  _focus={{ borderColor: 'gray.900', boxShadow: '0 0 0 1px var(--chakra-colors-gray-900)', _dark: { borderColor: 'gray.100' } }}
                  rounded="lg"
                  w="52px"
                />
                <Button
                  onClick={() => {
                    playSound('transition')
                    setTotalMinutes(20)
                  }}
                  size="md"
                  variant="ghost"
                  color="gray.600"
                  _dark={{ color: 'gray.400' }}
                  _hover={{ color: 'gray.900', bg: 'gray.100', _dark: { color: 'gray.100', bg: 'gray.800' } }}
                  fontSize="sm"
                  px={3}
                >
                  20min
                </Button>
              </HStack>
            </VStack>
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
                px={4}
              >
                +
              </Button>
              <Button
                onClick={shuffleParticipants}
                disabled={participants.length < 2}
                size="lg"
                bg="gray.100"
                color="gray.900"
                _dark={{ bg: 'gray.700', color: 'gray.100' }}
                _hover={{ bg: 'gray.200', _dark: { bg: 'gray.600' } }}
                rounded="lg"
                px={4}
                title="Aleatorizar ordem"
              >
                🔀
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
                  maxH={{ base: '20vh', md: '30vh' }}
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
                      p={2}
                      bg="white"
                      borderWidth="1px"
                      borderColor="gray.200"
                      _dark={{ bg: 'gray.800', borderColor: 'gray.700' }}
                      rounded="lg"
                      opacity={participant.isAbsent ? 0.5 : 1}
                      _hover={{ borderColor: 'gray.300', _dark: { borderColor: 'gray.600' } }}
                      position="relative"
                    >
                      <Box position="relative">
                        <Button
                          ref={(el) => { emojiButtonRefs.current[participant.id] = el }}
                          onClick={() => openEmojiPicker(participant.id)}
                          size="sm"
                          variant="ghost"
                          fontSize="2xl"
                          p={0}
                          minW="auto"
                          h="auto"
                          className="emoji-button"
                          _hover={{ transform: 'scale(1.3)', transition: 'transform 0.3s' }}
                          aria-label={t('setup.changeEmoji')}
                          title={t('setup.changeEmoji')}
                        >
                          {participant.emoji}
                        </Button>
                        {emojiPickerOpen === participant.id && emojiButtonRefs.current[participant.id] && (
                          <Portal>
                            <Box
                              className="emoji-picker-container"
                              position="fixed"
                              zIndex={9999}
                              style={{
                                top: `${emojiButtonRefs.current[participant.id]?.getBoundingClientRect().bottom ?? 0 + 8}px`,
                                left: `${emojiButtonRefs.current[participant.id]?.getBoundingClientRect().left ?? 0}px`,
                              }}
                            >
                              <EmojiPicker
                                onEmojiClick={(emojiData) => handleEmojiSelect(emojiData, participant.id)}
                                autoFocusSearch={false}
                                width={320}
                                height={400}
                              />
                            </Box>
                          </Portal>
                        )}
                      </Box>
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

          {/* Action Buttons */}
          <VStack gap={2} w="full">
            <Button
              onClick={handleStart}
              disabled={presentCount === 0}
              size="lg"
              h={{ base: '44px', md: '48px' }}
              w="full"
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

            {presentCount > 0 && (
              <Button
                onClick={() => {
                  const link = generateShareLink()
                  if (link) {
                    navigator.clipboard.writeText(link).then(() => {
                      playSound('transition')
                      toaster.create({
                        title: t('setup.shareCopied'),
                        type: 'success',
                        duration: 2000,
                      })
                    }).catch(() => {
                      toaster.create({
                        title: t('setup.shareError'),
                        type: 'error',
                        duration: 2000,
                      })
                    })
                  }
                }}
                size="md"
                variant="ghost"
                w="full"
                color="gray.600"
                _dark={{ color: 'gray.400' }}
                _hover={{ color: 'gray.900', bg: 'gray.100', _dark: { color: 'gray.100', bg: 'gray.800' } }}
                fontSize="sm"
              >
                🔗 {t('setup.share')}
              </Button>
            )}
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
}
