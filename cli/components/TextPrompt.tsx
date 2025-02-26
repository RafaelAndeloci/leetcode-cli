import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface TextPromptProps {
  question: string;
  onSubmit: (value: string) => void;
  defaultValue?: string;
  placeholder?: string;
  keyId?: string | number;
}

/**
 * Componente para entrada de texto
 */
export const TextPrompt: React.FC<TextPromptProps> = React.memo(
  ({
    question,
    onSubmit,
    defaultValue = "",
    placeholder = "",
    keyId = undefined,
  }) => {
    const [value, setValue] = useState(defaultValue);
    // Usamos um estado adicional para controlar se a renderização está estável
    const [stableRender, setStableRender] = useState(true);

    // Atualiza o valor quando defaultValue muda
    useEffect(() => {
      setValue(defaultValue);
    }, [defaultValue, keyId]);

    // Estabilizar renderização
    useEffect(() => {
      // Este efeito executa uma única vez na montagem do componente
      const timer = setTimeout(() => {
        setStableRender(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Memorizar a função onSubmit
    const handleSubmit = useCallback(
      (value: string) => {
        onSubmit(value);
      },
      [onSubmit]
    );

    // Memorizar a função onChange
    const handleChange = useCallback((newValue: string) => {
      // Usar batch updates compatível com Node.js
      setTimeout(() => {
        setValue(newValue);
      }, 0);
    }, []);

    // Memorizar o conteúdo do componente para reduzir re-renderizações
    const renderedContent = useMemo(() => {
      return (
        <Box flexDirection="column">
          <Box marginY={1}>
            <Text bold>{question}</Text>
          </Box>
          <Box>
            <Box marginRight={1}>
              <Text>❯</Text>
            </Box>
            <TextInput
              value={value}
              onChange={handleChange}
              onSubmit={handleSubmit}
              placeholder={placeholder}
            />
          </Box>
        </Box>
      );
    }, [question, value, handleChange, handleSubmit, placeholder]);

    return stableRender ? renderedContent : null;
  }
);

export default TextPrompt;
