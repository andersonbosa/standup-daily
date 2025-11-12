# Design Guidelines - Daily Timer

## 📐 Sistema de Tamanhos Responsivos

### Princípios Fundamentais
1. **Viewport-based**: Usar unidades baseadas na viewport (vh, vw) para garantir que o conteúdo sempre caiba na tela
2. **Escalabilidade**: Elementos devem escalar proporcionalmente ao tamanho da tela
3. **Sem overflow**: Evitar conteúdo que force scroll desnecessário
4. **Consistência**: Manter proporções consistentes entre mobile e desktop

---

## 🎯 Unidades de Medida

### Quando usar cada unidade:

#### **vh (viewport height)**
- ✅ Altura de containers principais
- ✅ Espaçamentos verticais grandes
- ✅ Padding vertical de seções
- Exemplo: `minH="100vh"`, `py="2vh"`

#### **vw (viewport width)**
- ✅ Largura de elementos que devem escalar com a tela
- ✅ Padding horizontal em telas pequenas
- ⚠️ Usar com cuidado (pode causar overflow horizontal)
- Exemplo: `maxW="90vw"`, `px="4vw"`

#### **rem (relative to root font-size)**
- ✅ Tamanhos de fonte
- ✅ Espaçamentos pequenos e médios (gaps, padding)
- ✅ Bordas e raios
- Exemplo: `fontSize="1.5rem"`, `gap="1rem"`, `rounded="0.5rem"`

#### **% (percentage)**
- ✅ Largura de containers filhos
- ✅ Layouts responsivos
- Exemplo: `w="100%"`, `maxW="90%"`

#### **px (pixels)**
- ⚠️ Evitar quando possível
- ✅ Valores muito pequenos (bordas, sombras)
- Exemplo: `borderWidth="1px"`, `h="4px"`

---

## 📱 Breakpoints e Tamanhos

### Breakpoints Chakra UI
```
base: 0px      (mobile)
sm: 480px      (mobile landscape)
md: 768px      (tablet)
lg: 992px      (desktop)
xl: 1280px     (large desktop)
2xl: 1536px    (extra large)
```

### Tamanhos de Fonte Responsivos
```typescript
// Títulos principais
size={{ base: '2xl', md: '4xl', lg: '5xl' }}  // 1.5rem → 2.25rem → 3rem

// Subtítulos
fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}  // 1rem → 1.125rem → 1.25rem

// Texto corpo
fontSize={{ base: 'sm', md: 'md' }}  // 0.875rem → 1rem

// Texto pequeno
fontSize={{ base: 'xs', md: 'sm' }}  // 0.75rem → 0.875rem
```

### Espaçamentos Responsivos
```typescript
// Gap entre seções
gap={{ base: 4, md: 6, lg: 8 }}  // 1rem → 1.5rem → 2rem

// Padding de containers
py={{ base: 4, md: 6, lg: 8 }}   // 1rem → 1.5rem → 2rem
px={{ base: 4, md: 6, lg: 8 }}   // 1rem → 1.5rem → 2rem

// Gap entre elementos
gap={{ base: 2, md: 3 }}  // 0.5rem → 0.75rem
```

---

## 🎨 Estrutura de Componentes

### Layout Principal
```tsx
<Box 
  minH="100vh"                    // Mínimo altura da viewport
  display="flex"
  alignItems={{ base: 'flex-start', md: 'center' }}
  py={{ base: 4, md: 0 }}         // Padding vertical responsivo
  overflowY="auto"                // Scroll quando necessário
>
  <Container 
    maxW={{ base: '100%', md: '2xl', lg: '4xl' }}
    px={{ base: 4, md: 6 }}       // Padding horizontal responsivo
  >
    {/* Conteúdo */}
  </Container>
</Box>
```

### Cards e Seções
```tsx
<Box
  p={{ base: 3, md: 4 }}          // Padding responsivo
  rounded="lg"                     // 0.5rem
  borderWidth="1px"
>
  <VStack gap={{ base: 2, md: 3 }}>
    {/* Conteúdo */}
  </VStack>
</Box>
```

### Botões
```tsx
<Button
  size={{ base: 'md', md: 'lg' }}
  fontSize={{ base: 'sm', md: 'md' }}
  px={{ base: 4, md: 6 }}
  h={{ base: '40px', md: '48px' }}
>
  Texto
</Button>
```

---

## 📊 Proporções Recomendadas

### Hierarquia Visual
```
Título Principal:    3rem - 4rem (48px - 64px)
Subtítulo:          1.5rem - 2rem (24px - 32px)
Texto Normal:       1rem (16px)
Texto Pequeno:      0.875rem (14px)
Texto Muito Pequeno: 0.75rem (12px)
```

### Espaçamentos
```
Entre Seções:       2rem - 3rem (32px - 48px)
Entre Elementos:    0.75rem - 1.5rem (12px - 24px)
Padding Interno:    1rem - 1.5rem (16px - 24px)
```

---

## ✅ Checklist de Implementação

Ao criar/modificar componentes, verificar:

- [ ] Usa `minH` em vez de `h` para containers principais
- [ ] Tem `overflowY="auto"` para permitir scroll quando necessário
- [ ] Usa tamanhos responsivos com breakpoints `{{ base, md, lg }}`
- [ ] Padding horizontal adequado em mobile (`px={{ base: 4, md: 6 }}`)
- [ ] Alinhamento vertical responsivo (`alignItems={{ base: 'flex-start', md: 'center' }}`)
- [ ] Fontes escalam com o tamanho da tela
- [ ] Espaçamentos (gap, padding) são responsivos
- [ ] Larguras máximas definidas para evitar conteúdo muito largo
- [ ] Testado em mobile (320px) e desktop (1920px)

---

## 🚫 Anti-patterns (Evitar)

```tsx
// ❌ Altura fixa que pode cortar conteúdo
<Box h="100vh" overflowY="hidden">

// ❌ Tamanhos fixos em pixels para elementos grandes
<Heading fontSize="48px">

// ❌ Padding/margin excessivo que força scroll
<Box py="100px">

// ❌ Largura fixa que não se adapta
<Box w="800px">

// ❌ Centralização vertical sem considerar mobile
<Box h="100vh" display="flex" alignItems="center">
```

---

## ✅ Best Practices

```tsx
// ✅ Altura mínima com scroll automático
<Box minH="100vh" overflowY="auto">

// ✅ Tamanhos responsivos
<Heading size={{ base: '2xl', md: '4xl' }}>

// ✅ Espaçamento proporcional
<VStack gap={{ base: 4, md: 6 }}>

// ✅ Largura responsiva com máximo
<Container maxW={{ base: '100%', md: '2xl' }}>

// ✅ Alinhamento responsivo
<Box 
  display="flex" 
  alignItems={{ base: 'flex-start', md: 'center' }}
>
```

---

## 🎯 Metas de Performance

- **Mobile First**: Começar design para 320px de largura
- **Sem Scroll Horizontal**: Nunca deve haver scroll horizontal
- **Conteúdo Visível**: Todo conteúdo importante deve ser visível sem scroll em 80% dos casos
- **Tempo de Carregamento**: Componentes devem renderizar em < 100ms
- **Acessibilidade**: Mínimo de 16px para texto corpo, 14px para texto pequeno

---

## 📝 Exemplos Práticos

### SetupStage
```tsx
<Box minH="100vh" py={{ base: 4, md: 0 }}>
  <Container maxW="2xl" px={{ base: 4, md: 6 }}>
    <VStack gap={{ base: 4, md: 6 }}>
      <Heading size={{ base: '2xl', md: '4xl' }}>
      <Input h={{ base: '40px', md: '48px' }}>
      <Button size={{ base: 'md', md: 'lg' }}>
    </VStack>
  </Container>
</Box>
```

### RunningStage
```tsx
<Box minH="100vh">
  <Container maxW="6xl" px={{ base: 4, md: 6 }}>
    <Grid 
      templateColumns={{ base: '1fr', lg: '2fr 1fr' }}
      gap={{ base: 4, md: 8 }}
    >
      <Text fontSize={{ base: '5xl', md: '7xl' }}>
    </Grid>
  </Container>
</Box>
```

### FinishedStage
```tsx
<Box minH="100vh" py={{ base: 4, md: 0 }}>
  <Container maxW="3xl" px={{ base: 4, md: 6 }}>
    <VStack gap={{ base: 4, md: 6 }}>
      <Heading size={{ base: '2xl', md: '4xl' }}>
      <Grid templateColumns="repeat(3, 1fr)" gap={3}>
      <Button size={{ base: 'md', md: 'lg' }}>
    </VStack>
  </Container>
</Box>
```

---

## 🔄 Processo de Review

Antes de fazer commit, verificar:

1. **Mobile (320px - 480px)**: Conteúdo visível, sem overflow horizontal
2. **Tablet (768px - 992px)**: Layout transiciona suavemente
3. **Desktop (1280px+)**: Usa espaço disponível sem ficar muito espaçado
4. **Dark Mode**: Funciona em ambos os temas
5. **Scroll**: Funciona naturalmente quando necessário

---

## 📚 Referências

- [Chakra UI Responsive Styles](https://chakra-ui.com/docs/styled-system/responsive-styles)
- [CSS Units Guide](https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units)
- [Viewport Units](https://developer.mozilla.org/en-US/docs/Web/CSS/Viewport_concepts)

