import { spawn } from "child_process";

/**
 * Executa um comando shell e retorna uma promise com o resultado
 *
 * @param command O comando a ser executado
 * @param args Os argumentos do comando
 * @returns Uma promise que resolve com a saída do comando ou rejeita com o erro
 */
export const executeCommand = (
  command: string,
  args: string[] = [],
  options: { cwd?: string; shell?: boolean } = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["inherit", "pipe", "pipe"],
      shell: options.shell ?? true,
      cwd: options.cwd,
    });

    let stdout = "";
    let stderr = "";

    child.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Comando falhou com código ${code}: ${stderr}`));
      }
    });
  });
};

/**
 * Executa um script bash do projeto
 *
 * @param scriptName Nome do script bash (sem a extensão .sh)
 * @param args Argumentos para o script
 * @returns Promise com o resultado da execução
 */
export const executeScript = async (
  scriptName: string,
  args: string[] = []
): Promise<string> => {
  try {
    console.log(`Executando script: ${scriptName} com args:`, args);
    const result = await executeCommand("bash", [
      `./scripts/${scriptName}.sh`,
      ...args,
    ]);
    return result;
  } catch (error) {
    console.error("Erro detalhado:", error);
    throw new Error(`Erro ao executar script ${scriptName}: ${error.message}`);
  }
};
