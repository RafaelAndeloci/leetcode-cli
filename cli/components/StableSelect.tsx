import { Box, Text, useInput } from "ink";
import React, { useEffect, useState } from "react";

interface Item {
  label: string;
  value: string;
  description?: string;
}

interface StableSelectProps {
  items: Item[];
  onSelect: (item: Item) => void;
}

// Definir a interface para o parâmetro key do useInput
interface KeyObj {
  upArrow?: boolean;
  downArrow?: boolean;
  return?: boolean;
  name?: string;
  escape?: boolean;
}

const StableSelect: React.FC<StableSelectProps> = ({ items, onSelect }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  // Garantir que o componente esteja pronto para input imediatamente
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFocused(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Gerenciar a navegação usando as teclas de seta ou qualquer tecla
  useInput((input, key: any) => {
    // Se não estiver focado, qualquer tecla ativa o componente
    if (!isFocused) {
      setIsFocused(true);
      return;
    }

    // Navegar usando as setas
    if (key.upArrow) {
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (key.downArrow) {
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (key.return) {
      onSelect(items[selectedIndex]);
    }
  });

  // Calcular quantos itens mostrar
  const visibleItems = 5;
  const startIndex = Math.max(
    0,
    Math.min(
      selectedIndex - Math.floor(visibleItems / 2),
      items.length - visibleItems
    )
  );
  const visibleIndices = Array.from(
    { length: visibleItems },
    (_, i) => startIndex + i
  ).filter((i) => i < items.length);

  // Criar linhas vazias para manter a altura consistente
  const emptyRows = visibleItems - visibleIndices.length;

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text dimColor>
          {isFocused
            ? "Use ↑/↓ para navegar, Enter para selecionar"
            : "Pressione qualquer tecla para ativar a navegação..."}
        </Text>
      </Box>
      {visibleIndices.map((index) => (
        <Box key={index}>
          <Text color={index === selectedIndex ? "blue" : undefined}>
            {index === selectedIndex ? "› " : "  "}
            {items[index].label}
          </Text>
        </Box>
      ))}
      {/* Adicionar linhas vazias para manter altura consistente */}
      {Array.from({ length: emptyRows }).map((_, i) => (
        <Box key={`empty-${i}`} height={1}></Box>
      ))}
    </Box>
  );
};

export default StableSelect;
