import * as fs from "fs/promises";
import * as path from "path";

export async function createProblem(
  id: string,
  problemName: string,
  category: string,
  language: string
): Promise<string> {
  try {
    // Formatar ID com zeros à esquerda
    const formattedId = id.padStart(4, "0");

    // Usar o nome fornecido pelo usuário ou criar um nome padrão
    const problemTitle = problemName || `Problem-${id}`;

    // Criar diretórios
    const problemPath = path.resolve(
      `./problems/${formattedId}-${problemTitle}`
    );
    const languagePath = path.join(problemPath, language);

    await fs.mkdir(languagePath, { recursive: true });

    // Criar README básico
    const readmePath = path.join(problemPath, "README.md");
    await fs.writeFile(
      readmePath,
      `# ${id}. ${problemTitle}\n\nCategoria: ${category}`
    );

    // Criar arquivo de solução vazio
    const extension =
      language === "typescript" ? "ts" : language === "python" ? "py" : "js";

    await fs.writeFile(
      path.join(languagePath, `solution.${extension}`),
      `// Solução para o problema ${id}\n`
    );

    return `Problema ${id} criado com sucesso em ${problemPath}`;
  } catch (error: any) {
    console.error("Erro ao criar problema:", error);
    throw new Error(`Falha ao criar problema: ${error.message}`);
  }
}
