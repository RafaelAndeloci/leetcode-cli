import { promises as fs } from "fs";
import * as path from "path";

/**
 * Verifica se um diretório existe e o cria se não existir
 *
 * @param dirPath Caminho do diretório
 * @returns Promise que resolve quando o diretório existir ou for criado
 */
export const ensureDir = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch (error) {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

/**
 * Verifica se um arquivo existe
 *
 * @param filePath Caminho do arquivo
 * @returns Promise<boolean> indicando se o arquivo existe
 */
export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Lista os diretórios dentro de um diretório
 *
 * @param dirPath Caminho do diretório
 * @returns Promise com a lista de diretórios
 */
export const listDirectories = async (dirPath: string): Promise<string[]> => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    return [];
  }
};

/**
 * Lista arquivos com uma extensão específica dentro de um diretório
 *
 * @param dirPath Caminho do diretório
 * @param extension Extensão dos arquivos (com o ponto, ex: ".md")
 * @returns Promise com a lista de arquivos
 */
export const listFiles = async (
  dirPath: string,
  extension?: string
): Promise<string[]> => {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    return entries
      .filter(
        (entry) =>
          entry.isFile() && (extension ? entry.name.endsWith(extension) : true)
      )
      .map((entry) => entry.name);
  } catch (error) {
    return [];
  }
};

/**
 * Lê o conteúdo de um arquivo
 *
 * @param filePath Caminho do arquivo
 * @returns Promise com o conteúdo do arquivo
 */
export const readFile = async (filePath: string): Promise<string> => {
  return fs.readFile(filePath, "utf-8");
};

/**
 * Escreve conteúdo em um arquivo
 *
 * @param filePath Caminho do arquivo
 * @param content Conteúdo a ser escrito
 * @returns Promise que resolve quando a operação for concluída
 */
export const writeFile = async (
  filePath: string,
  content: string
): Promise<void> => {
  await ensureDir(path.dirname(filePath));
  return fs.writeFile(filePath, content, "utf-8");
};
