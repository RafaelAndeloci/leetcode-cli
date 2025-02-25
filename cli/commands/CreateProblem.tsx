import { Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";
import React, { useEffect, useState } from "react";
import StableSelect from "../components/StableSelect";
import TextPrompt from "../components/TextPrompt";
import { listDirectories } from "../utils/filesystem";
import { createProblem } from "../utils/problem-creator";

// Estados possíveis do formulário
type FormStep =
  | "id"
  | "name"
  | "category"
  | "language"
  | "loading"
  | "done"
  | "error";

interface CreateProblemProps {
  onComplete: () => void;
  onBack: () => void;
}

/**
 * Componente para criar um novo problema
 */
export const CreateProblem: React.FC<CreateProblemProps> = ({
  onComplete,
  onBack,
}) => {
  // Estado do formulário
  const [formStep, setFormStep] = useState<FormStep>("id");
  const [problemId, setProblemId] = useState("");
  const [problemName, setProblemName] = useState("");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("");
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<
    { label: string; value: string }[]
  >([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Carregar as categorias ao iniciar o componente
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const dirs = await listDirectories("./categories");
        setCategories(
          dirs.map((dir) => ({
            label:
              dir.charAt(0).toUpperCase() + dir.slice(1).replace(/-/g, " "),
            value: dir,
          }))
        );
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    // Carregue as categorias assim que o componente montar,
    // mesmo antes de chegar à etapa de categoria
    loadCategories();
  }, []);

  // Lista de linguagens disponíveis
  const languages = [
    { label: "TypeScript", value: "typescript" },
    { label: "JavaScript", value: "javascript" },
    { label: "Python", value: "python" },
  ];

  // Lidar com teclas pressionadas
  useInput((input, key) => {
    if (key.return && (formStep === "done" || formStep === "error")) {
      onComplete();
    } else if (key.escape) {
      onBack();
    }
  });

  // Função para avançar para o próximo passo
  const goToNextStep = () => {
    switch (formStep) {
      case "id":
        setFormStep("name");
        break;
      case "name":
        setFormStep("category");
        break;
      case "category":
        setFormStep("language");
        break;
      case "language":
        setFormStep("loading");
        createProblemHandler();
        break;
    }
  };

  // Função para criar o problema
  const createProblemHandler = async () => {
    try {
      setFormStep("loading");
      const result = await createProblem(
        problemId,
        problemName,
        category,
        language
      );
      console.log(result);
      setFormStep("done");
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
      setFormStep("error");
    }
  };

  // Renderização condicional baseada no passo atual do formulário
  const renderStep = () => {
    switch (formStep) {
      case "id":
        return (
          <TextPrompt
            question="Digite o ID do problema (número):"
            onSubmit={(value) => {
              setProblemId(value);
              goToNextStep();
            }}
            placeholder="Ex: 123"
            defaultValue=""
            keyId={`step-${formStep}`}
          />
        );
      case "name":
        return (
          <TextPrompt
            question={`ID: ${problemId} - Digite o nome do problema:`}
            onSubmit={(value) => {
              setProblemName(value);
              goToNextStep();
            }}
            placeholder="Ex: Two Sum"
            defaultValue=""
            keyId={`step-${formStep}`}
          />
        );
      case "category":
        return (
          <Box flexDirection="column">
            <Box marginY={1}>
              <Text bold>Selecione a categoria:</Text>
              {isLoadingCategories && (
                <Box marginLeft={1}>
                  <Text color="green">
                    <Spinner type="dots" />
                  </Text>
                </Box>
              )}
            </Box>
            {!isLoadingCategories && categories.length > 0 && (
              <StableSelect
                items={categories}
                onSelect={(item) => {
                  setCategory(item.value);
                  goToNextStep();
                }}
              />
            )}
            {!isLoadingCategories && categories.length === 0 && (
              <Box>
                <Text color="red">Nenhuma categoria encontrada!</Text>
              </Box>
            )}
          </Box>
        );
      case "language":
        return (
          <Box flexDirection="column">
            <Box marginY={1}>
              <Text bold>Selecione a linguagem:</Text>
            </Box>
            <StableSelect
              items={languages}
              onSelect={(item) => {
                setLanguage(item.value);
                goToNextStep();
              }}
            />
          </Box>
        );
      case "loading":
        return (
          <Box>
            <Text>Criando problema... </Text>
            <Text color="green">
              <Spinner type="dots" />
            </Text>
          </Box>
        );
      case "done":
        return (
          <Box flexDirection="column">
            <Box marginY={1}>
              <Text color="green">✓ Problema criado com sucesso!</Text>
            </Box>
            <Text>ID: {problemId}</Text>
            <Text>Nome: {problemName}</Text>
            <Text>Categoria: {category}</Text>
            <Text>Linguagem: {language}</Text>
            <Box marginTop={1}>
              <Text>
                Pressione <Text color="blue">Enter</Text> para voltar ao menu
                principal.
              </Text>
            </Box>
          </Box>
        );
      case "error":
        return (
          <Box flexDirection="column">
            <Box marginY={1}>
              <Text color="red">✗ Erro ao criar o problema:</Text>
            </Box>
            <Text>{error}</Text>
            <Box marginTop={1}>
              <Text>
                Pressione <Text color="blue">Enter</Text> para voltar ao menu
                principal.
              </Text>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Box flexDirection="column" padding={1}>
      <Text bold>Criar Novo Problema</Text>
      <Box marginY={1}>{renderStep()}</Box>
      <Box marginTop={1}>
        <Text dimColor>
          Pressione <Text color="blue">ESC</Text> para voltar
        </Text>
      </Box>
    </Box>
  );
};

export default CreateProblem;
