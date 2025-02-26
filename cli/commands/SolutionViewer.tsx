import { execSync } from "child_process";
import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { Box, Text, useInput } from "ink";
import path from "path";
import React, { useEffect, useState } from "react";
import StableSelect from "../components/StableSelect";

interface SolutionViewerProps {
  problemPath: string;
  onBack: () => void;
  initialSolutionPath?: string;
}

interface Solution {
  language: string;
  path: string;
  filename: string;
  extension: string;
}

const SolutionViewer: React.FC<SolutionViewerProps> = ({
  problemPath,
  onBack,
  initialSolutionPath,
}) => {
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(
    null
  );
  const [solutionContent, setSolutionContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "content" | "run">("list");
  const [executionResult, setExecutionResult] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Mapeamento de extensões para linguagens
  const extensionToLanguage: Record<string, string> = {
    ".ts": "TypeScript",
    ".js": "JavaScript",
    ".py": "Python",
    ".java": "Java",
    ".cpp": "C++",
    ".c": "C",
    ".cs": "C#",
    ".go": "Go",
    ".rb": "Ruby",
    ".php": "PHP",
  };

  // Mapeamento de extensões para cores
  const extensionToColor: Record<string, string> = {
    ".ts": "blue",
    ".js": "yellow",
    ".py": "green",
    ".java": "red",
    ".cpp": "magenta",
    ".c": "cyan",
    ".cs": "blue",
    ".go": "cyan",
    ".rb": "red",
    ".php": "magenta",
  };

  // Mapeamento de extensões para comandos de execução
  const extensionToCommand: Record<string, string> = {
    ".ts": "npx tsx",
    ".js": "node",
    ".py": "python3",
    ".java": "java",
    ".cpp": "g++ -o /tmp/solution && /tmp/solution",
    ".c": "gcc -o /tmp/solution && /tmp/solution",
    ".cs": "dotnet run",
    ".go": "go run",
    ".rb": "ruby",
    ".php": "php",
  };

  useEffect(() => {
    const loadSolutions = async () => {
      try {
        setLoading(true);
        if (!existsSync(problemPath)) {
          throw new Error("Diretório do problema não encontrado");
        }

        // Buscar todas as soluções possíveis (arquivos de código) no diretório do problema
        const entries = await readdir(problemPath, { withFileTypes: true });

        const solutionFiles = entries
          .filter(
            (entry) => entry.isFile() && !entry.name.includes("README.md")
          )
          .map((file) => {
            const ext = path.extname(file.name);
            return {
              language: extensionToLanguage[ext] || "Desconhecido",
              path: path.join(problemPath, file.name),
              filename: file.name,
              extension: ext,
            };
          })
          .sort((a, b) => a.language.localeCompare(b.language));

        setSolutions(solutionFiles);

        // Verificar se também temos soluções em subdiretórios de linguagem
        const subDirs = entries.filter((entry) => entry.isDirectory());

        for (const subDir of subDirs) {
          const subDirPath = path.join(problemPath, subDir.name);
          const subEntries = await readdir(subDirPath, { withFileTypes: true });

          const subSolutions = subEntries
            .filter((entry) => entry.isFile())
            .map((file) => {
              const ext = path.extname(file.name);
              return {
                language: extensionToLanguage[ext] || subDir.name,
                path: path.join(subDirPath, file.name),
                filename: `${subDir.name}/${file.name}`,
                extension: ext,
              };
            });

          setSolutions((prev) =>
            [...prev, ...subSolutions].sort((a, b) =>
              a.language.localeCompare(b.language)
            )
          );
        }

        // Se houver uma solução inicial especificada, carregá-la
        if (initialSolutionPath && existsSync(initialSolutionPath)) {
          const initialFileName = path.basename(initialSolutionPath);
          const initialSubDir = path.relative(
            problemPath,
            path.dirname(initialSolutionPath)
          );
          const displayName =
            initialSubDir === "."
              ? initialFileName
              : `${initialSubDir}/${initialFileName}`;
          const ext = path.extname(initialFileName);

          const initialSolution = {
            language:
              extensionToLanguage[ext] || initialSubDir || "Desconhecido",
            path: initialSolutionPath,
            filename: displayName,
            extension: ext,
          };

          loadSolutionContent(initialSolution);
        }
      } catch (err: any) {
        setError(`Erro ao carregar soluções: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadSolutions();
  }, [problemPath, initialSolutionPath]);

  const loadSolutionContent = async (solution: Solution) => {
    try {
      setLoading(true);
      const content = await readFile(solution.path, "utf-8");
      setSolutionContent(content);
      setSelectedSolution(solution);
      setViewMode("content");
    } catch (err: any) {
      setError(`Erro ao carregar conteúdo da solução: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const runSolution = async (solution: Solution) => {
    try {
      setIsExecuting(true);
      setViewMode("run");

      const command = extensionToCommand[solution.extension];

      if (!command) {
        throw new Error(
          `Não há suporte para execução de arquivos ${solution.extension}`
        );
      }

      // Executar a solução
      const result = execSync(`${command} "${solution.path}"`, {
        encoding: "utf-8",
        timeout: 10000, // 10 segundos de timeout
      });

      setExecutionResult(result);
    } catch (err: any) {
      setExecutionResult(`Erro ao executar: ${err.message}`);
    } finally {
      setIsExecuting(false);
    }
  };

  useInput((input, key) => {
    if (key.escape) {
      if (viewMode === "content" || viewMode === "run") {
        setViewMode("list");
        if (viewMode === "run") {
          setExecutionResult("");
        }
        if (viewMode === "content") {
          setSelectedSolution(null);
          setSolutionContent("");
        }
      } else {
        onBack();
      }
    }
  });

  const handleSelectSolution = (item: any) => {
    if (item.value === "back") {
      onBack();
    } else {
      const solution = solutions[item.index];
      loadSolutionContent(solution);
    }
  };

  const handleSelectContentAction = (action: string) => {
    if (action === "run" && selectedSolution) {
      runSolution(selectedSolution);
    } else if (action === "back") {
      setViewMode("list");
      setSelectedSolution(null);
      setSolutionContent("");
    }
  };

  if (loading && viewMode === "list") {
    return (
      <Box>
        <Text>Carregando soluções...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box flexDirection="column">
        <Text color="red">{error}</Text>
        <Box marginTop={1}>
          <Text>Pressione ESC para voltar</Text>
        </Box>
      </Box>
    );
  }

  // Visualizar resultado da execução
  if (viewMode === "run") {
    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Resultado da execução - {selectedSolution?.filename}</Text>
        </Box>

        {isExecuting ? (
          <Box>
            <Text>Executando solução...</Text>
          </Box>
        ) : (
          <Box flexDirection="column">
            <Box
              borderStyle="round"
              paddingX={1}
              paddingY={1}
              flexDirection="column"
              height={15}
            >
              <Text>{executionResult}</Text>
            </Box>

            <Box marginTop={1}>
              <StableSelect
                items={[{ label: "Voltar ao código", value: "back" }]}
                onSelect={() => {
                  setViewMode("content");
                  setExecutionResult("");
                }}
              />
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Visualizar conteúdo da solução
  if (viewMode === "content" && selectedSolution) {
    const languageColor =
      extensionToColor[selectedSolution.extension] || "white";

    // Formatar o conteúdo para exibição
    const formattedContent = solutionContent.split("\n").map((line, index) => {
      return (
        <Box key={index}>
          <Text color="gray">{(index + 1).toString().padStart(3, " ")}</Text>
          <Text> │ </Text>
          <Text>{line}</Text>
        </Box>
      );
    });

    const contentActions = [
      { label: "▶️ Executar Solução", value: "run" },
      { label: "Voltar à lista de soluções", value: "back" },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>
            Solução em{" "}
            <Text color={languageColor}>{selectedSolution.language}</Text> (
            {selectedSolution.filename})
          </Text>
        </Box>
        <Box
          borderStyle="round"
          paddingX={1}
          paddingY={1}
          flexDirection="column"
          height={15}
        >
          {formattedContent}
        </Box>
        <Box marginY={1}>
          <StableSelect
            items={contentActions}
            onSelect={(item) => handleSelectContentAction(item.value)}
          />
        </Box>
        <Box marginTop={1}>
          <Text>Pressione ESC para voltar à lista de soluções</Text>
        </Box>
      </Box>
    );
  }

  // Listar soluções disponíveis
  const items = [
    ...solutions.map((solution, index) => ({
      label: `${solution.language} (${solution.filename})`,
      value: solution.filename,
      index,
    })),
    { label: "Voltar aos detalhes do problema", value: "back" },
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Soluções Disponíveis ({solutions.length})</Text>
      </Box>

      {solutions.length === 0 ? (
        <Box flexDirection="column">
          <Text>Nenhuma solução encontrada para este problema.</Text>
          <Box marginTop={1}>
            <Text>Pressione ESC para voltar</Text>
          </Box>
        </Box>
      ) : (
        <Box flexDirection="column">
          <StableSelect items={items} onSelect={handleSelectSolution} />
          <Box marginTop={1}>
            <Text>Pressione ESC para voltar aos detalhes do problema</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SolutionViewer;
