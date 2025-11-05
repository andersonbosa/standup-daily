'use client'

import {
  Box,
  IconButton,
  Text,
  HStack,
} from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import {
  MenuContent,
  MenuItem,
  MenuRoot,
  MenuTrigger,
  MenuSeparator,
  MenuItemGroup,
} from '@/components/ui/menu'
import { playSound } from '@/utils/sounds'

import type { Language, TranslationKey } from '@/i18n/translations'

interface FloatingMenuProps {
  language: Language
  onLanguageChange: (lang: Language) => void
  t: (key: TranslationKey) => string
}

export function FloatingMenu({ language, onLanguageChange, t }: FloatingMenuProps) {
  const { colorMode, toggleColorMode } = useColorMode()

  const languages: Array<{ code: Language; label: string; flag: string }> = [
    { code: 'pt-BR', label: 'Português', flag: '🇧🇷' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
  ]

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      zIndex={1000}
    >
      <MenuRoot positioning={{ placement: 'bottom-end' }}>
        <MenuTrigger asChild>
          <IconButton
            size="md"
            variant="ghost"
            bg="white"
            shadow="md"
            rounded="full"
            aria-label={t('menu.settings')}
            fontSize="lg"
            _dark={{ bg: 'gray.800' }}
            _hover={{
              transform: 'scale(1.1)',
              _dark: { bg: 'gray.700' },
            }}
            transition="transform 0.2s"
          >
            ⚙️
          </IconButton>
        </MenuTrigger>

        <MenuContent
          minW="200px"
          bg="white"
          shadow="lg"
          borderWidth="1px"
          borderColor="gray.200"
          _dark={{ bg: 'gray.900', borderColor: 'gray.700' }}
        >
          {/* Theme Toggle */}
          <MenuItem
            value="theme"
            onClick={() => {
              playSound('transition');
              toggleColorMode();
            }}
            closeOnSelect={false}
            _hover={{
              bg: 'gray.50',
              _dark: { bg: 'gray.800' },
            }}
          >
            <HStack gap={3} w="full">
              <Text fontSize="xl">{colorMode === 'light' ? '🌙' : '☀️'}</Text>
              <Text fontSize="sm" fontWeight="500" flex={1}>
                {colorMode === 'light' ? t('menu.darkMode') : t('menu.lightMode')}
              </Text>
            </HStack>
          </MenuItem>

          <MenuSeparator />

          {/* Language Section */}
          <MenuItemGroup>
            {languages.map((lang) => (
              <MenuItem
                key={lang.code}
                value={lang.code}
                onClick={() => {
                  playSound('transition');
                  onLanguageChange(lang.code);
                }}
                bg={language === lang.code ? 'gray.50' : 'transparent'}
                _dark={{
                  bg: language === lang.code ? 'gray.800' : 'transparent',
                }}
                _hover={{
                  bg: 'gray.100',
                  _dark: { bg: 'gray.700' },
                }}
              >
                <HStack gap={3} w="full">
                  <Text fontSize="xl">{lang.flag}</Text>
                  <Text fontSize="sm" fontWeight={language === lang.code ? '600' : '400'} flex={1}>
                    {lang.label}
                  </Text>
                  {language === lang.code && (
                    <Text fontSize="sm" color="gray.500" _dark={{ color: 'gray.400' }}>✓</Text>
                  )}
                </HStack>
              </MenuItem>
            ))}
          </MenuItemGroup>
        </MenuContent>
      </MenuRoot>
    </Box>
  )
}
