#!/usr/bin/env node
import { Box, render, Text } from "ink";
import meow from "meow";
import React, { useEffect, useState } from "react";
import CreateProblem from "./commands/CreateProblem";
import ListProblems from "./commands/ListProblems";
import Header from "./components/Header";
import MainMenu from "./components/MainMenu";

// Define os tipos de telas possíveis
type Screen = "menu" | "create" | "run" | "list" | "search" | "setup" | "help";

/**
 * Componente principal da aplicação
 */
const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("menu");
  const [isLoading, setIsLoading] = useState(false);

  // Função para lidar com a seleção de menu
  const handleMenuSelect = (action: string) => {
    if (action === "exit") {
      process.exit(0);
    } else {
      setCurrentScreen(action as Screen);
    }
  };

  // Função para voltar ao menu principal
  const backToMenu = () => {
    setCurrentScreen("menu");
  };

  // Renderiza a tela atual
  const renderScreen = () => {
    switch (currentScreen) {
      case "menu":
        return <MainMenu onSelect={handleMenuSelect} isLoading={isLoading} />;
      case "create":
        return <CreateProblem onComplete={backToMenu} onBack={backToMenu} />;
      case "run":
        return (
          <Box>
            <Text>Executar solução (Em desenvolvimento)</Text>
          </Box>
        );
      case "list":
        return <ListProblems onBack={backToMenu} />;
      case "search":
        return (
          <Box>
            <Text>Buscar problemas (Em desenvolvimento)</Text>
          </Box>
        );
      case "setup":
        return (
          <Box>
            <Text>Configurar ambiente (Em desenvolvimento)</Text>
          </Box>
        );
      case "help":
        return (
          <Box flexDirection="column">
            <Text bold>Ajuda:</Text>
            <Box marginY={1}>
              <Text>- Use as setas ↑↓ para navegar entre as opções.</Text>
            </Box>
            <Box marginY={1}>
              <Text>- Pressione Enter para selecionar uma opção.</Text>
            </Box>
            <Box marginY={1}>
              <Text>- Pressione ESC para voltar ao menu anterior.</Text>
            </Box>
            <Box marginTop={2}>
              <Text>
                Pressione qualquer tecla para voltar ao menu principal...
              </Text>
            </Box>
          </Box>
        );
    }
  };

  useEffect(() => {
    // Esconder o cursor do terminal
    process.stdout.write("\u001B[?25l");

    // Restaurar o cursor quando o componente for desmontado
    return () => {
      process.stdout.write("\u001B[?25h");
    };
  }, []);

  return (
    <Box
      flexDirection="column"
      padding={2}
      minHeight={25} // Ajuste conforme necessário
    >
      <Header />
      <Box flexGrow={1}>{renderScreen()}</Box>
    </Box>
  );
};

// Parse de argumentos da linha de comando
const cli = meow(
  `
  Uso:
    $ leetcode-cli

  Opções:
    --help, -h     Mostrar ajuda
    --version, -v  Mostrar versão

  Exemplos:
    $ leetcode-cli
`,
  {
    importMeta: import.meta,
    flags: {
      help: {
        type: "boolean",
        shortFlag: "h",
      },
      version: {
        type: "boolean",
        shortFlag: "v",
      },
    },
  }
);

// Renderiza a aplicação
render(<App />);

// Exportar para o TypeScript
export default App;
