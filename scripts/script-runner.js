#!/usr/bin/env node

/**
 * Este script serve como um wrapper para os scripts bash, permitindo
 * uma melhor passagem de parâmetros quando usamos os scripts npm.
 */

const { spawn } = require("child_process");
const path = require("path");

// Obter o tipo de script a executar
const scriptType = process.argv[2];
const args = process.argv.slice(3);

// Caminhos para os scripts bash
const scriptPaths = {
  setup: path.join(__dirname, "setup.sh"),
  create: path.join(__dirname, "create-problem.sh"),
  run: path.join(__dirname, "run-solution.sh"),
  list: path.join(__dirname, "list-problems.sh"),
  search: path.join(__dirname, "search-problems.sh"),
};

// Verificar se o tipo de script é válido
if (!scriptType || !scriptPaths[scriptType]) {
  console.error(
    `Uso: node ${path.basename(__filename)} <tipo-script> [args...]`
  );
  console.error(
    `Tipos de script disponíveis: ${Object.keys(scriptPaths).join(", ")}`
  );
  process.exit(1);
}

// Construir o comando bash a ser executado
const scriptPath = scriptPaths[scriptType];

// Determinar a linguagem para scripts específicos de criação ou execução
let language = "";
if (scriptType === "create" || scriptType === "run") {
  // Verificar se há um sufixo de linguagem no tipo do script
  const scriptNameParts = process.env.npm_lifecycle_event?.split(":") || [];
  if (scriptNameParts.length > 1) {
    language = scriptNameParts[1];
  }
}

// Construir lista completa de argumentos
const cmdArgs = [...args];
if (language && (scriptType === "create" || scriptType === "run")) {
  // Adicionar a linguagem como último argumento para criar ou executar scripts
  if (scriptType === "create" && args.length >= 2) {
    cmdArgs.push(language);
  } else if (scriptType === "run") {
    cmdArgs.push(language);
  }
}

// Executar o script bash
const child = spawn("bash", [scriptPath, ...cmdArgs], {
  stdio: "inherit",
  shell: true,
});

child.on("close", (code) => {
  process.exit(code);
});
