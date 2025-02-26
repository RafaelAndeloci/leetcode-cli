import { Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
const CreateProblem: React.FC<CreateProblemProps> = React.memo(
  ({ onComplete, onBack }) => {
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
    // Estabilizador de renderização
    const [stableRender, setStableRender] = useState(true);
    // Usar refs para reduzir re-renderizações
    const formStepRef = useRef(formStep);

    // Sincronizar refs com estados
    useEffect(() => {
      formStepRef.current = formStep;
    }, [formStep]);

    // Estabilizar renderização inicial
    useEffect(() => {
      const timer = setTimeout(() => {
        setStableRender(true);
      }, 100);
      return () => clearTimeout(timer);
    }, []);

    // Função segura para atualizar o estado
    const safeSetFormStep = useCallback((step: FormStep) => {
      setTimeout(() => {
        setFormStep(step);
      }, 0);
    }, []);

    // Carregar as categorias ao iniciar o componente
    useEffect(() => {
      const loadCategories = async () => {
        setIsLoadingCategories(true);
        try {
          const dirs = await listDirectories("./categories");
          const categoryItems = dirs.map((dir) => ({
            label:
              dir.charAt(0).toUpperCase() + dir.slice(1).replace(/-/g, " "),
            value: dir,
          }));

          // Usar setTimeout para atualizar de forma mais suave
          setTimeout(() => {
            setCategories(categoryItems);
            setIsLoadingCategories(false);
          }, 0);
        } catch (error) {
          console.error("Erro ao carregar categorias:", error);
          setTimeout(() => {
            setIsLoadingCategories(false);
          }, 0);
        }
      };

      // Carregue as categorias assim que o componente montar,
      // mesmo antes de chegar à etapa de categoria
      loadCategories();
    }, []);

    // Lista de linguagens disponíveis
    const languages = useMemo(
      () => [
        { label: "TypeScript", value: "typescript" },
        { label: "JavaScript", value: "javascript" },
        { label: "Python", value: "python" },
      ],
      []
    );

    // Lidar com teclas pressionadas
    useInput((input, key) => {
      if (
        key.return &&
        (formStepRef.current === "done" || formStepRef.current === "error")
      ) {
        onComplete();
      } else if (key.escape) {
        onBack();
      }
    });

    // Função para criar o problema
    const createProblemHandler = useCallback(async () => {
      try {
        safeSetFormStep("loading");
        const result = await createProblem(
          problemId,
          problemName,
          category,
          language
        );
        console.log(result);
        setTimeout(() => {
          safeSetFormStep("done");
        }, 0);
      } catch (err) {
        console.error(err);
        setTimeout(() => {
          setError((err as Error).message);
          safeSetFormStep("error");
        }, 0);
      }
    }, [problemId, problemName, category, language, safeSetFormStep]);

    // Funções de submit otimizadas com useCallback
    const handleIdSubmit = useCallback(
      (value: string) => {
        setTimeout(() => {
          setProblemId(value);
          setTimeout(() => {
            safeSetFormStep("name");
          }, 10);
        }, 0);
      },
      [safeSetFormStep]
    );

    const handleNameSubmit = useCallback(
      (value: string) => {
        setTimeout(() => {
          setProblemName(value);
          setTimeout(() => {
            safeSetFormStep("category");
          }, 10);
        }, 0);
      },
      [safeSetFormStep]
    );

    const handleCategorySelect = useCallback(
      (item: { value: string }) => {
        setTimeout(() => {
          setCategory(item.value);
          setTimeout(() => {
            safeSetFormStep("language");
          }, 10);
        }, 0);
      },
      [safeSetFormStep]
    );

    const handleLanguageSelect = useCallback(
      (item: { value: string }) => {
        setTimeout(() => {
          setLanguage(item.value);
          setTimeout(() => {
            safeSetFormStep("loading");
            setTimeout(() => {
              createProblemHandler();
            }, 10);
          }, 10);
        }, 0);
      },
      [createProblemHandler, safeSetFormStep]
    );

    // Renderização para o passo ID
    const renderIdStep = useMemo(
      () => (
        <TextPrompt
          question="Digite o ID do problema (número):"
          onSubmit={handleIdSubmit}
          placeholder="Ex: 123"
          defaultValue=""
        />
      ),
      [handleIdSubmit]
    );

    // Renderização para o passo Nome
    const renderNameStep = useMemo(
      () => (
        <TextPrompt
          question={`ID: ${problemId} - Digite o nome do problema:`}
          onSubmit={handleNameSubmit}
          placeholder="Ex: Two Sum"
          defaultValue=""
        />
      ),
      [problemId, handleNameSubmit]
    );

    // Renderização para o passo Categoria
    const renderCategoryStep = useMemo(
      () => (
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
            <StableSelect items={categories} onSelect={handleCategorySelect} />
          )}
          {!isLoadingCategories && categories.length === 0 && (
            <Box>
              <Text color="red">Nenhuma categoria encontrada!</Text>
            </Box>
          )}
        </Box>
      ),
      [isLoadingCategories, categories, handleCategorySelect]
    );

    // Renderização para o passo Linguagem
    const renderLanguageStep = useMemo(
      () => (
        <Box flexDirection="column">
          <Box marginY={1}>
            <Text bold>Selecione a linguagem:</Text>
          </Box>
          <StableSelect items={languages} onSelect={handleLanguageSelect} />
        </Box>
      ),
      [languages, handleLanguageSelect]
    );

    // Renderização para o passo Loading
    const renderLoadingStep = useMemo(
      () => (
        <Box>
          <Text>Criando problema... </Text>
          <Text color="green">
            <Spinner type="dots" />
          </Text>
        </Box>
      ),
      []
    );

    // Renderização para o passo Done
    const renderDoneStep = useMemo(
      () => (
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
      ),
      [problemId, problemName, category, language]
    );

    // Renderização para o passo Error
    const renderErrorStep = useMemo(
      () => (
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
      ),
      [error]
    );

    // Renderização condicional baseada no passo atual do formulário
    const renderStep = useCallback(() => {
      switch (formStep) {
        case "id":
          return renderIdStep;
        case "name":
          return renderNameStep;
        case "category":
          return renderCategoryStep;
        case "language":
          return renderLanguageStep;
        case "loading":
          return renderLoadingStep;
        case "done":
          return renderDoneStep;
        case "error":
          return renderErrorStep;
      }
    }, [
      formStep,
      renderIdStep,
      renderNameStep,
      renderCategoryStep,
      renderLanguageStep,
      renderLoadingStep,
      renderDoneStep,
      renderErrorStep,
    ]);

    // Memorizar o conteúdo completo
    const renderedContent = useMemo(
      () => (
        <Box flexDirection="column" padding={1}>
          <Text bold>Criar Novo Problema</Text>
          <Box marginY={1}>{renderStep()}</Box>
          <Box marginTop={1}>
            <Text dimColor>
              Pressione <Text color="blue">ESC</Text> para voltar
            </Text>
          </Box>
        </Box>
      ),
      [renderStep]
    );

    return stableRender ? renderedContent : null;
  }
);

export default CreateProblem;
