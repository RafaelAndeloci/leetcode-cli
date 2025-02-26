import { writeFile } from "fs/promises";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import path from "path";
import React, { useState } from "react";
import StableSelect from "../components/StableSelect";

interface SolutionEditorProps {
  problemPath: string;
  onBack: () => void;
  onSolutionCreated: () => void;
}

const SolutionEditor: React.FC<SolutionEditorProps> = ({
  problemPath,
  onBack,
  onSolutionCreated,
}) => {
  const [filename, setFilename] = useState("");
  const [content, setContent] = useState("");
  const [step, setStep] = useState<
    "language" | "filename" | "content" | "confirm"
  >("language");
  const [selectedLanguage, setSelectedLanguage] = useState<{
    extension: string;
    name: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Lista de linguagens suportadas
  const supportedLanguages = [
    { name: "JavaScript", extension: ".js" },
    { name: "TypeScript", extension: ".ts" },
    { name: "Python", extension: ".py" },
    { name: "Java", extension: ".java" },
    { name: "C++", extension: ".cpp" },
    { name: "C", extension: ".c" },
    { name: "Go", extension: ".go" },
    { name: "Ruby", extension: ".rb" },
  ];

  // Templates para cada linguagem
  const languageTemplates: Record<string, string> = {
    ".js": `/**
 * Solução para o problema.
 * 
 * @returns {any} - O resultado da solução
 */
function solution() {
  // Sua implementação aqui
  
  return null;
}

// Executa a solução
console.log(solution());
`,
    ".ts": `/**
 * Solução para o problema.
 * 
 * @returns {any} - O resultado da solução
 */
function solution(): any {
  // Sua implementação aqui
  
  return null;
}

// Executa a solução
console.log(solution());
`,
    ".py": `# Solução para o problema

def solution():
    # Sua implementação aqui
    
    return None

# Executa a solução
if __name__ == "__main__":
    print(solution())
`,
    ".java": `/**
 * Solução para o problema.
 */
public class Solution {
    public static void main(String[] args) {
        System.out.println(solution());
    }
    
    public static Object solution() {
        // Sua implementação aqui
        
        return null;
    }
}
`,
    ".cpp": `#include <iostream>

/**
 * Solução para o problema.
 */
int solution() {
    // Sua implementação aqui
    
    return 0;
}

int main() {
    std::cout << solution() << std::endl;
    return 0;
}
`,
    ".c": `#include <stdio.h>

/**
 * Solução para o problema.
 */
int solution() {
    // Sua implementação aqui
    
    return 0;
}

int main() {
    printf("%d\\n", solution());
    return 0;
}
`,
    ".go": `package main

import "fmt"

/**
 * Solução para o problema.
 */
func solution() interface{} {
    // Sua implementação aqui
    
    return nil
}

func main() {
    fmt.Println(solution())
}
`,
    ".rb": `# Solução para o problema

def solution
  # Sua implementação aqui
  
  return nil
end

# Executa a solução
puts solution
`,
  };

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  const handleLanguageSelect = (item: any) => {
    if (item.value === "back") {
      onBack();
    } else {
      const language = supportedLanguages.find(
        (lang) => lang.name === item.value
      );
      if (language) {
        setSelectedLanguage(language);
        setStep("filename");
        // Sugerir um nome de arquivo baseado na linguagem
        setFilename(`solution${language.extension}`);
      }
    }
  };

  const handleFilenameSubmit = (value: string) => {
    if (!value.trim()) {
      setError("Nome de arquivo não pode ser vazio");
      return;
    }

    if (!selectedLanguage) {
      setError("Selecione uma linguagem primeiro");
      return;
    }

    // Garantir que o arquivo tem a extensão correta
    if (!value.endsWith(selectedLanguage.extension)) {
      setFilename(`${value}${selectedLanguage.extension}`);
    } else {
      setFilename(value);
    }

    // Inicializar o conteúdo com o template da linguagem selecionada
    setContent(languageTemplates[selectedLanguage.extension] || "");
    setStep("content");
  };

  const handleContentSubmit = (value: string) => {
    setContent(value);
    setStep("confirm");
  };

  const handleConfirm = async (item: any) => {
    if (item.value === "back") {
      setStep("content");
      return;
    }

    if (item.value === "save") {
      try {
        if (!selectedLanguage) {
          throw new Error("Linguagem não selecionada");
        }

        // Salvar arquivo
        const filePath = path.join(problemPath, filename);
        await writeFile(filePath, content, "utf-8");

        setSuccess(true);
        setTimeout(() => {
          onSolutionCreated();
        }, 1500);
      } catch (err: any) {
        setError(`Erro ao salvar solução: ${err.message}`);
      }
    }
  };

  // Renderizar passo de seleção de linguagem
  if (step === "language") {
    const languageItems = [
      ...supportedLanguages.map((lang) => ({
        label: lang.name,
        value: lang.name,
      })),
      { label: "Voltar", value: "back" },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Selecione a Linguagem para a Solução</Text>
        </Box>

        <StableSelect items={languageItems} onSelect={handleLanguageSelect} />

        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text>Pressione ESC para voltar</Text>
        </Box>
      </Box>
    );
  }

  // Renderizar passo de nome do arquivo
  if (step === "filename") {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Nome do Arquivo</Text>
        </Box>

        <Box>
          <Text>Digite o nome do arquivo: </Text>
          <TextInput
            value={filename}
            onChange={setFilename}
            onSubmit={handleFilenameSubmit}
          />
        </Box>

        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text>Pressione Enter para continuar, ESC para voltar</Text>
        </Box>
      </Box>
    );
  }

  // Renderizar passo de conteúdo
  if (step === "content") {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Escreva ou Cole o Código da Solução</Text>
        </Box>

        <Box flexDirection="column" marginBottom={1}>
          <Text>
            Use um editor externo para escrever seu código e cole aqui. Para
            concluir, pressione Enter duas vezes.
          </Text>
          <Text>
            Linguagem: <Text color="blue">{selectedLanguage?.name}</Text>
          </Text>
        </Box>

        <Box>
          <Text>Conteúdo: </Text>
          <TextInput
            value={content}
            onChange={setContent}
            onSubmit={handleContentSubmit}
            placeholder="Cole seu código aqui e pressione Enter..."
          />
        </Box>

        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text>Pressione Enter para continuar, ESC para voltar</Text>
        </Box>
      </Box>
    );
  }

  // Renderizar passo de confirmação
  if (step === "confirm") {
    const confirmItems = [
      { label: "✅ Salvar Solução", value: "save" },
      { label: "✏️ Editar Conteúdo", value: "back" },
    ];

    if (success) {
      return (
        <Box flexDirection="column">
          <Box marginY={1}>
            <Text color="green">✓ Solução salva com sucesso!</Text>
          </Box>
        </Box>
      );
    }

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Confirmar Solução</Text>
        </Box>

        <Box flexDirection="column" marginBottom={1}>
          <Text>
            Arquivo: <Text bold>{filename}</Text>
          </Text>
          <Text>
            Linguagem: <Text color="blue">{selectedLanguage?.name}</Text>
          </Text>
        </Box>

        <Box
          flexDirection="column"
          marginBottom={1}
          borderStyle="round"
          paddingX={1}
        >
          <Text>
            {content.length > 500 ? content.substring(0, 500) + "..." : content}
          </Text>
        </Box>

        <StableSelect items={confirmItems} onSelect={handleConfirm} />

        {error && (
          <Box marginTop={1}>
            <Text color="red">{error}</Text>
          </Box>
        )}

        <Box marginTop={1}>
          <Text>Pressione ESC para voltar</Text>
        </Box>
      </Box>
    );
  }

  return null;
};

export default SolutionEditor;
