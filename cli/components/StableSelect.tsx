import { Box, Text, useInput } from "ink";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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

const StableSelect: React.FC<StableSelectProps> = React.memo(
  ({ items, onSelect }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    // Usar um ref para evitar re-renderizações causadas por atualizações frequentes
    const selectedIndexRef = useRef(selectedIndex);
    // Estabilizador de renderização
    const [stableRender, setStableRender] = useState(true);

    // Manter o ref atualizado
    useEffect(() => {
      selectedIndexRef.current = selectedIndex;
    }, [selectedIndex]);

    // Garantir que o componente esteja pronto para input imediatamente
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsFocused(true);
      }, 50);
      return () => clearTimeout(timer);
    }, []);

    // Estabilizar renderização
    useEffect(() => {
      const timer = setTimeout(() => {
        setStableRender(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Função para atualizar o índice selecionado de forma otimizada
    const updateSelectedIndex = useCallback((newIndex: number) => {
      setTimeout(() => {
        setSelectedIndex(newIndex);
      }, 0);
    }, []);

    // Gerenciar a navegação usando as teclas de seta ou qualquer tecla
    useInput(
      useCallback(
        (input, key: any) => {
          // Se não estiver focado, qualquer tecla ativa o componente
          if (!isFocused) {
            setIsFocused(true);
            return;
          }

          // Navegar usando as setas
          if (key.upArrow) {
            const currentIndex = selectedIndexRef.current;
            if (currentIndex > 0) {
              updateSelectedIndex(currentIndex - 1);
            }
          } else if (key.downArrow) {
            const currentIndex = selectedIndexRef.current;
            if (currentIndex < items.length - 1) {
              updateSelectedIndex(currentIndex + 1);
            }
          } else if (key.return) {
            onSelect(items[selectedIndexRef.current]);
          }
        },
        [isFocused, items, onSelect, updateSelectedIndex]
      )
    );

    // Calcular quantos itens mostrar
    const visibleItems = 5;

    // Calcular os índices visíveis de forma otimizada
    const { visibleIndices, emptyRows } = useMemo(() => {
      const startIndex = Math.max(
        0,
        Math.min(
          selectedIndex - Math.floor(visibleItems / 2),
          items.length - visibleItems
        )
      );

      const indices = Array.from(
        { length: visibleItems },
        (_, i) => startIndex + i
      ).filter((i) => i < items.length);

      // Criar linhas vazias para manter a altura consistente
      const empty = visibleItems - indices.length;

      return { visibleIndices: indices, emptyRows: empty };
    }, [selectedIndex, items.length, visibleItems]);

    // Criar textos de instrução de forma otimizada
    const instructionText = useMemo(() => {
      return isFocused
        ? "Use ↑/↓ para navegar, Enter para selecionar"
        : "Pressione qualquer tecla para ativar a navegação...";
    }, [isFocused]);

    // Memorizar o conteúdo completo para reduzir re-renderizações
    const renderedContent = useMemo(() => {
      return (
        <Box flexDirection="column">
          <Box marginBottom={1}>
            <Text dimColor>{instructionText}</Text>
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
    }, [instructionText, visibleIndices, selectedIndex, items, emptyRows]);

    return stableRender ? renderedContent : null;
  }
);

export default StableSelect;
