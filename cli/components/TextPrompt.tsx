import { Box, Text } from "ink";
import TextInput from "ink-text-input";
import React, { useEffect, useState } from "react";

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
export const TextPrompt: React.FC<TextPromptProps> = ({
  question,
  onSubmit,
  defaultValue = "",
  placeholder = "",
  keyId = undefined,
}) => {
  const [value, setValue] = useState(defaultValue);

  // Atualiza o valor quando defaultValue muda
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue, keyId]);

  const handleSubmit = (value: string) => {
    onSubmit(value);
  };

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
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder={placeholder}
        />
      </Box>
    </Box>
  );
};

export default TextPrompt;
