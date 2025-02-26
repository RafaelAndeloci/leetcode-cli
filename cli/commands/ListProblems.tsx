import { existsSync } from "fs";
import { readdir, readFile } from "fs/promises";
import { Box, Text, useInput } from "ink";
import path from "path";
import React, { useEffect, useState } from "react";
import StableSelect from "../components/StableSelect";
import ProblemDetails from "./ProblemDetails";

interface Problem {
  id: string;
  title: string;
  path: string;
  categories: string[];
}

interface Category {
  name: string;
  displayName: string;
}

interface ListProblemsProps {
  onBack: () => void;
  onSelect?: (problem: Problem) => void;
}

const ListProblems: React.FC<ListProblemsProps> = ({ onBack, onSelect }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "category" | "details">(
    "list"
  );
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null
  );

  // Carrega categorias
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesDir = path.join(process.cwd(), "categories");
        if (!existsSync(categoriesDir)) {
          return;
        }

        const entries = await readdir(categoriesDir, { withFileTypes: true });
        const categoryList = entries
          .filter((entry) => entry.isDirectory())
          .map((dir) => ({
            name: dir.name,
            displayName: dir.name
              .split("-")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" "),
          }))
          .sort((a, b) => a.displayName.localeCompare(b.displayName));

        setCategories(categoryList);
      } catch (err: any) {
        console.error(`Erro ao carregar categorias: ${err.message}`);
      }
    };

    loadCategories();
  }, []);

  // Carrega problemas
  useEffect(() => {
    const loadProblems = async () => {
      try {
        setLoading(true);
        const problemsDir = path.join(process.cwd(), "problems");
        if (!existsSync(problemsDir)) {
          setProblems([]);
          return;
        }

        const entries = await readdir(problemsDir, { withFileTypes: true });

        const problemPromises = entries
          .filter((entry) => entry.isDirectory())
          .map(async (dir) => {
            const match = dir.name.match(/^(\d+)-(.+)$/);
            const id = match ? match[1] : dir.name;
            const title = match ? match[2].replace(/-/g, " ") : dir.name;
            const problemPath = path.join(problemsDir, dir.name);

            // Tentar carregar categorias do arquivo README.md se existir
            let categories: string[] = [];
            const readmePath = path.join(problemPath, "README.md");

            if (existsSync(readmePath)) {
              try {
                const readmeContent = await readFile(readmePath, "utf-8");
                // Procurar tags de categorias no formato "Categorias: [categoria1, categoria2]"
                const categoryMatch = readmeContent.match(
                  /Categorias:\s*\[(.*?)\]/i
                );
                if (categoryMatch && categoryMatch[1]) {
                  categories = categoryMatch[1]
                    .split(",")
                    .map((cat) => cat.trim());
                }
              } catch (err) {
                // Ignorar erros na leitura do README
              }
            }

            return {
              id,
              title,
              path: problemPath,
              categories,
            };
          });

        const problemsList = await Promise.all(problemPromises);

        // Ordenar por ID numérico
        problemsList.sort((a, b) => {
          const idA = parseInt(a.id, 10) || 0;
          const idB = parseInt(b.id, 10) || 0;
          return idA - idB;
        });

        setProblems(problemsList);
      } catch (err: any) {
        setError(`Erro ao carregar problemas: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, []);

  useInput((input, key) => {
    if (key.escape) {
      if (viewMode === "category") {
        setViewMode("list");
      } else {
        onBack();
      }
    }
  });

  const handleSelectProblem = (item: any) => {
    if (item.value === "back") {
      onBack();
    } else if (item.value === "filter") {
      setViewMode("category");
    } else {
      setSelectedProblemId(item.value);
      setViewMode("details");
    }
  };

  const handleSelectCategory = (item: any) => {
    if (item.value === "all") {
      setSelectedCategory(null);
    } else if (item.value === "back") {
      setViewMode("list");
    } else {
      setSelectedCategory(item.value);
    }
    setViewMode("list");
  };

  const handleBackFromDetails = () => {
    setViewMode("list");
    setSelectedProblemId(null);
  };

  if (loading) {
    return (
      <Box flexDirection="column">
        <Text>Carregando problemas...</Text>
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

  // Renderizar seleção de categoria
  if (viewMode === "category") {
    const categoryItems = [
      { label: "Todos os problemas", value: "all" },
      ...categories.map((category) => ({
        label: category.displayName,
        value: category.name,
      })),
      { label: "Voltar à listagem", value: "back" },
    ];

    return (
      <Box flexDirection="column">
        <Box marginBottom={1}>
          <Text bold>Selecione uma categoria</Text>
        </Box>
        <StableSelect items={categoryItems} onSelect={handleSelectCategory} />
        <Box marginTop={1}>
          <Text>Pressione ESC para voltar</Text>
        </Box>
      </Box>
    );
  }

  // Filtrar problemas por categoria, se uma estiver selecionada
  const filteredProblems = selectedCategory
    ? problems.filter((problem) =>
        problem.categories.includes(selectedCategory)
      )
    : problems;

  const problemItems = [
    { label: "📋 Filtrar por categoria", value: "filter" },
    ...filteredProblems.map((problem, index) => ({
      label: `${problem.id.padStart(4, "0")} - ${problem.title}`,
      value: problem.id,
      index,
    })),
    { label: "Voltar ao menu principal", value: "back" },
  ];

  const categoryName = selectedCategory
    ? categories.find((c) => c.name === selectedCategory)?.displayName ||
      selectedCategory
    : "Todos";

  // Renderizar detalhes do problema
  if (viewMode === "details" && selectedProblemId) {
    return (
      <ProblemDetails
        problemId={selectedProblemId}
        onBack={handleBackFromDetails}
      />
    );
  }

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Lista de Problemas ({filteredProblems.length})</Text>
        {selectedCategory && <Text> - Categoria: {categoryName}</Text>}
      </Box>

      {filteredProblems.length === 0 ? (
        <Box flexDirection="column">
          <Text>Nenhum problema encontrado.</Text>
          <Box marginTop={1}>
            <Text>Pressione ESC para voltar</Text>
          </Box>
        </Box>
      ) : (
        <Box flexDirection="column">
          <StableSelect items={problemItems} onSelect={handleSelectProblem} />
          <Box marginTop={1}>
            <Text>Pressione ESC para voltar</Text>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ListProblems;
