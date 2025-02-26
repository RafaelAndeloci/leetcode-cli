import { existsSync } from "fs";
import { readFile, readdir } from "fs/promises";
import { Box, Text, useInput } from "ink";
import path from "path";
import React, { useEffect, useState } from "react";
import StableSelect from "../components/StableSelect";
import CreateSolution from "./CreateSolution";
import SolutionViewer from "./SolutionViewer";

interface ProblemDetailsProps {
  problemId: string;
  onBack: () => void;
}

type ViewMode = "details" | "solutions" | "createSolution";

const ProblemDetails: React.FC<ProblemDetailsProps> = ({
  problemId,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [description, setDescription] = useState<string>("");
  const [problemInfo, setProblemInfo] = useState<{
    id: string;
    title: string;
    difficulty?: string;
    categories?: string[];
    languages?: string[];
  }>({ id: problemId, title: "" });
  const [problemPath, setProblemPath] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("details");
  const [selectedSolutionPath, setSelectedSolutionPath] = useState<string>("");

  useEffect(() => {
    const loadProblemDetails = async () => {
      try {
        setLoading(true);

        // Encontrar o diretório do problema
        const problemsDir = path.join(process.cwd(), "problems");
        if (!existsSync(problemsDir)) {
          throw new Error("Diretório de problemas não encontrado");
        }

        // Ler todos os diretórios de problemas
        const entries = await readdir(problemsDir, { withFileTypes: true });

        // Filtrar para encontrar o problema com o ID correspondente
        const problemDirEntry = entries.filter(
          (entry) =>
            entry.isDirectory() && entry.name.startsWith(`${problemId}-`)
        )[0];

        if (!problemDirEntry) {
          throw new Error(`Problema ${problemId} não encontrado`);
        }

        const problemDir = path.join(problemsDir, problemDirEntry.name);
        setProblemPath(problemDir);

        // Ler o README.md do problema
        const readmePath = path.join(problemDir, "README.md");
        if (!existsSync(readmePath)) {
          throw new Error(
            "Arquivo README.md não encontrado para este problema"
          );
        }

        const readmeContent = await readFile(readmePath, "utf-8");

        // Extrair informações do README
        const titleMatch = readmeContent.match(/^# (.+?)$/m);
        const difficultyMatch = readmeContent.match(/Dificuldade:\s*(\w+)/i);
        const categoriesMatch = readmeContent.match(/Categorias:\s*\[(.*?)\]/i);
        const languagesMatch = readmeContent.match(/Linguagens:\s*\[(.*?)\]/i);

        // Extrair a descrição (todo o conteúdo após a seção de informações)
        const descriptionMatch = readmeContent.match(
          /## Descrição\s+([\s\S]+?)(?=##|$)/
        );

        setProblemInfo({
          id: problemId,
          title: titleMatch ? titleMatch[1] : `Problema ${problemId}`,
          difficulty: difficultyMatch ? difficultyMatch[1] : undefined,
          categories: categoriesMatch
            ? categoriesMatch[1].split(",").map((cat) => cat.trim())
            : [],
          languages: languagesMatch
            ? languagesMatch[1].split(",").map((lang) => lang.trim())
            : [],
        });

        setDescription(
          descriptionMatch
            ? descriptionMatch[1].trim()
            : "Sem descrição disponível."
        );
      } catch (err: any) {
        setError(`Erro ao carregar detalhes do problema: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProblemDetails();
  }, [problemId]);

  useInput((input, key) => {
    if (key.escape) {
      onBack();
    }
  });

  const handleSelectAction = (action: string) => {
    if (action === "solutions") {
      setViewMode("solutions");
    } else if (action === "createSolution") {
      setViewMode("createSolution");
    } else if (action === "back") {
      onBack();
    }
  };

  const handleBackFromSolutions = () => {
    setViewMode("details");
  };

  const handleSolutionCreated = (solutionPath: string) => {
    setSelectedSolutionPath(solutionPath);
    setViewMode("solutions");
  };

  if (loading) {
    return (
      <Box>
        <Text>Carregando detalhes do problema...</Text>
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

  if (viewMode === "solutions" && problemPath) {
    return (
      <SolutionViewer
        problemPath={problemPath}
        onBack={handleBackFromSolutions}
        initialSolutionPath={selectedSolutionPath}
      />
    );
  }

  if (viewMode === "createSolution" && problemPath) {
    return (
      <CreateSolution
        problemPath={problemPath}
        onBack={handleBackFromSolutions}
        onComplete={handleSolutionCreated}
      />
    );
  }

  const actions = [
    { label: "💻 Ver Soluções", value: "solutions" },
    { label: "✏️ Criar Nova Solução", value: "createSolution" },
    { label: "Voltar à lista de problemas", value: "back" },
  ];

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold color="green">
          {problemInfo.id} - {problemInfo.title}
        </Text>
      </Box>

      <Box flexDirection="column" marginBottom={1}>
        {problemInfo.difficulty && (
          <Text>
            Dificuldade:{" "}
            <Text
              color={
                problemInfo.difficulty.toLowerCase() === "fácil"
                  ? "green"
                  : problemInfo.difficulty.toLowerCase() === "médio"
                  ? "yellow"
                  : problemInfo.difficulty.toLowerCase() === "difícil"
                  ? "red"
                  : "white"
              }
            >
              {problemInfo.difficulty}
            </Text>
          </Text>
        )}

        {problemInfo.categories && problemInfo.categories.length > 0 && (
          <Text>Categorias: {problemInfo.categories.join(", ")}</Text>
        )}

        {problemInfo.languages && problemInfo.languages.length > 0 && (
          <Text>Linguagens: {problemInfo.languages.join(", ")}</Text>
        )}
      </Box>

      <Box flexDirection="column" marginY={1}>
        <Text bold>Descrição:</Text>
        <Text>{description}</Text>
      </Box>

      <Box marginY={1}>
        <StableSelect
          items={actions}
          onSelect={(item) => handleSelectAction(item.value)}
        />
      </Box>

      <Box marginTop={1}>
        <Text>Pressione ESC para voltar</Text>
      </Box>
    </Box>
  );
};

export default ProblemDetails;
