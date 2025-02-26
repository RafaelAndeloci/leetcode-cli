import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { Box, Text, useInput } from "ink";
import path from "path";
import React, { useState } from "react";
import StableSelect from "../components/StableSelect";
import TextPrompt from "../components/TextPrompt";

interface CreateSolutionProps {
  problemPath: string;
  onBack: () => void;
  onComplete: (solutionPath: string) => void;
}

// Estados possíveis do formulário
type FormStep = "language" | "filename" | "loading" | "done" | "error";

// Mapeamento de linguagens para extensões
const languageToExtension: Record<string, string> = {
  typescript: ".ts",
  javascript: ".js",
  python: ".py",
  java: ".java",
  cpp: ".cpp",
  c: ".c",
  csharp: ".cs",
  go: ".go",
  ruby: ".rb",
  php: ".php",
};

// Templates básicos para cada linguagem
const languageTemplates: Record<string, string> = {
  typescript: `/**
 * Solução para o problema
 */
export function solution() {
  // Implemente sua solução aqui
  return null;
}

// Teste da solução
console.log(solution());
`,
  javascript: `/**
 * Solução para o problema
 */
function solution() {
  // Implemente sua solução aqui
  return null;
}

// Teste da solução
console.log(solution());
`,
  python: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-

def solution():
    # Implemente sua solução aqui
    return None

# Teste da solução
if __name__ == "__main__":
    print(solution())
`,
  java: `public class Solution {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.solution());
    }
    
    public Object solution() {
        // Implemente sua solução aqui
        return null;
    }
}
`,
  cpp: `#include <iostream>

class Solution {
public:
    void solution() {
        // Implemente sua solução aqui
    }
};

int main() {
    Solution sol;
    sol.solution();
    return 0;
}
`,
  c: `#include <stdio.h>

void solution() {
    // Implemente sua solução aqui
}

int main() {
    solution();
    return 0;
}
`,
  csharp: `using System;

public class Solution {
    public static void Main() {
        Solution sol = new Solution();
        Console.WriteLine(sol.solution());
    }
    
    public object solution() {
        // Implemente sua solução aqui
        return null;
    }
}
`,
  go: `package main

import "fmt"

func solution() interface{} {
    // Implemente sua solução aqui
    return nil
}

func main() {
    fmt.Println(solution())
}
`,
  ruby: `#!/usr/bin/env ruby

def solution
  # Implemente sua solução aqui
  return nil
end

# Teste da solução
puts solution
`,
  php: `<?php

function solution() {
    // Implemente sua solução aqui
    return null;
}

// Teste da solução
echo solution();
`,
};

const CreateSolution: React.FC<CreateSolutionProps> = ({
  problemPath,
  onBack,
  onComplete,
}) => {
  // Estados
  const [formStep, setFormStep] = useState<FormStep>("language");
  const [language, setLanguage] = useState("");
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [createdSolutionPath, setCreatedSolutionPath] = useState("");

  // Lista de linguagens disponíveis
  const languages = [
    { label: "TypeScript", value: "typescript" },
    { label: "JavaScript", value: "javascript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C++", value: "cpp" },
    { label: "C", value: "c" },
    { label: "C#", value: "csharp" },
    { label: "Go", value: "go" },
    { label: "Ruby", value: "ruby" },
    { label: "PHP", value: "php" },
  ];

  // Função para criar a solução
  const createSolution = async () => {
    try {
      setFormStep("loading");

      // Obter a extensão para a linguagem selecionada
      const extension = languageToExtension[language];
      if (!extension) {
        throw new Error(`Linguagem não suportada: ${language}`);
      }

      // Criar diretório para a linguagem se não existir
      const languageDir = path.join(problemPath, language);
      if (!existsSync(languageDir)) {
        await mkdir(languageDir, { recursive: true });
      }

      // Definir o nome do arquivo final
      const finalFilename = filename.endsWith(extension)
        ? filename
        : `${filename}${extension}`;

      // Caminho completo para o arquivo de solução
      const solutionPath = path.join(languageDir, finalFilename);

      // Verificar se o arquivo já existe
      if (existsSync(solutionPath)) {
        throw new Error(`Já existe uma solução com o nome ${finalFilename}`);
      }

      // Obter o template para a linguagem
      const template = languageTemplates[language] || "";

      // Escrever o arquivo de solução com o template
      await writeFile(solutionPath, template);

      // Guardar o caminho da solução criada
      setCreatedSolutionPath(solutionPath);
      setFormStep("done");
    } catch (err: any) {
      console.error("Erro ao criar solução:", err);
      setError(err.message);
      setFormStep("error");
    }
  };

  // Lidar com teclas pressionadas
  useInput((input, key) => {
    if (key.escape) {
      onBack();
    } else if (key.return && formStep === "done") {
      onComplete(createdSolutionPath);
    }
  });

  // Função para avançar para o próximo passo
  const goToNextStep = () => {
    switch (formStep) {
      case "language":
        setFormStep("filename");
        break;
      case "filename":
        createSolution();
        break;
    }
  };

  // Renderização condicional baseada no passo atual do formulário
  const renderStep = () => {
    switch (formStep) {
      case "language":
        return (
          <Box flexDirection="column">
            <Box marginY={1}>
              <Text bold>Selecione a linguagem para a solução:</Text>
            </Box>
            <StableSelect
              items={languages}
              onSelect={(item) => {
                setLanguage(item.value);
                // Definir um nome de arquivo padrão baseado na linguagem
                const defaultExtension = languageToExtension[item.value] || "";
                setFilename(`solution${defaultExtension}`);
                goToNextStep();
              }}
            />
          </Box>
        );
      case "filename":
        return (
          <TextPrompt
            question={`Linguagem: ${language} - Digite o nome do arquivo:`}
            onSubmit={(value) => {
              setFilename(value);
              goToNextStep();
            }}
            placeholder={`Exemplo: solution${
              languageToExtension[language] || ""
            }`}
            defaultValue={filename}
            keyId={`step-${formStep}`}
          />
        );
      case "loading":
        return (
          <Box>
            <Text>Criando solução... </Text>
          </Box>
        );
      case "done":
        return (
          <Box flexDirection="column">
            <Box marginY={1}>
              <Text color="green">✓ Solução criada com sucesso!</Text>
            </Box>
            <Text>Linguagem: {language}</Text>
            <Text>Arquivo: {filename}</Text>
            <Box marginTop={1}>
              <Text>
                Pressione <Text color="blue">Enter</Text> para visualizar a
                solução.
              </Text>
            </Box>
          </Box>
        );
      case "error":
        return (
          <Box flexDirection="column">
            <Box marginY={1}>
              <Text color="red">✗ Erro ao criar a solução:</Text>
            </Box>
            <Text>{error}</Text>
            <Box marginTop={1}>
              <Text>
                Pressione <Text color="blue">ESC</Text> para voltar.
              </Text>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Criar Nova Solução</Text>
      <Box marginY={1}>{renderStep()}</Box>
      <Box marginTop={1}>
        <Text dimColor>
          Pressione <Text color="blue">ESC</Text> para voltar
        </Text>
      </Box>
    </Box>
  );
};

export default CreateSolution;
