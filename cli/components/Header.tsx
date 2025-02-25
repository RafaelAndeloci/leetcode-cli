import { Box, Text } from "ink";
import BigText from "ink-big-text";
import Gradient from "ink-gradient";
import React from "react";

interface HeaderProps {
  title?: string;
  subtitle?: string;
}

/**
 * Componente de cabeçalho para a CLI
 */
export const Header: React.FC<HeaderProps> = ({
  title = "LeetCode CLI",
  subtitle = "Gerenciador de soluções do LeetCode",
}) => {
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Gradient name="rainbow">
        <BigText text={title} font="simple3d" />
      </Gradient>
      <Box marginBottom={1}>
        <Text>{subtitle}</Text>
      </Box>
    </Box>
  );
};

export default Header;
