import { Box, Text } from "ink";
import Spinner from "ink-spinner";
import React from "react";
import StableSelect from "./StableSelect";

// Definindo o tipo para os itens do menu
interface MenuItem {
  label: string;
  value: string;
  description?: string;
}

interface MainMenuProps {
  onSelect: (item: string) => void;
  isLoading?: boolean;
}

/**
 * Menu principal da aplicação
 */
export const MainMenu: React.FC<MainMenuProps> = ({
  onSelect,
  isLoading = false,
}) => {
  // Definindo os itens do menu
  const items: MenuItem[] = [
    {
      label: "📝 Criar novo problema",
      value: "create",
      description: "Cria um novo problema com base em um ID e categoria",
    },
    {
      label: "▶️ Executar solução",
      value: "run",
      description: "Executa uma solução existente",
    },
    {
      label: "📋 Listar problemas",
      value: "list",
      description: "Lista problemas por categoria",
    },
    {
      label: "🔍 Buscar problemas",
      value: "search",
      description: "Busca problemas por termo",
    },
    {
      label: "⚙️ Configurar ambiente",
      value: "setup",
      description: "Configura o ambiente de desenvolvimento",
    },
    {
      label: "❓ Ajuda",
      value: "help",
      description: "Mostra informações de ajuda",
    },
    {
      label: "🚪 Sair",
      value: "exit",
      description: "Sai da aplicação",
    },
  ];

  const handleSelect = (item: MenuItem) => {
    onSelect(item.value);
  };

  return (
    <Box flexDirection="column">
      <Box marginBottom={1}>
        <Text bold>Selecione uma opção:</Text>
        {isLoading && (
          <Box marginLeft={1}>
            <Text color="green">
              <Spinner type="dots" />
            </Text>
          </Box>
        )}
      </Box>

      <StableSelect items={items} onSelect={handleSelect} />

      <Box marginTop={1}>
        <Text dimColor>
          Use as setas ↑↓ para navegar, Enter para selecionar
        </Text>
      </Box>
    </Box>
  );
};

export default MainMenu;
