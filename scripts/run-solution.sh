#!/bin/bash

# Script para executar uma solução de problema LeetCode

# Verificar se os argumentos necessários foram fornecidos
if [ $# -lt 2 ]; then
    echo "Uso: $0 <problema-id> <linguagem>"
    echo "Exemplo: $0 123 typescript"
    exit 1
fi

PROBLEM_ID=$1
LANGUAGE=$(echo $2 | tr '[:upper:]' '[:lower:]')

# Formatar o ID do problema com 4 dígitos
FORMATTED_ID=$(printf "%04d" $PROBLEM_ID)

# Encontrar o diretório do problema
PROBLEM_DIR=""
for dir in problems/$FORMATTED_ID-*; do
    if [ -d "$dir" ]; then
        PROBLEM_DIR=$dir
        break
    fi
done

if [ -z "$PROBLEM_DIR" ]; then
    echo "Erro: Problema $PROBLEM_ID não encontrado."
    exit 1
fi

# Verificar se a solução existe
SOLUTION_FILE="$PROBLEM_DIR/$LANGUAGE/solution"
if [ "$LANGUAGE" == "typescript" ]; then
    SOLUTION_FILE="${SOLUTION_FILE}.ts"
elif [ "$LANGUAGE" == "python" ]; then
    SOLUTION_FILE="${SOLUTION_FILE}.py"
elif [ "$LANGUAGE" == "java" ]; then
    SOLUTION_FILE="${SOLUTION_FILE}.java"
elif [ "$LANGUAGE" == "javascript" ]; then
    SOLUTION_FILE="${SOLUTION_FILE}.js"
else
    echo "Erro: Linguagem $LANGUAGE não suportada."
    exit 1
fi

if [ ! -f "$SOLUTION_FILE" ]; then
    echo "Erro: Solução em $LANGUAGE não encontrada para o problema $PROBLEM_ID."
    exit 1
fi

# Executar a solução de acordo com a linguagem
echo "Executando solução para o problema $PROBLEM_ID em $LANGUAGE..."
echo "======================================================================"

case "$LANGUAGE" in
    "typescript")
        # Compilar TypeScript para JavaScript
        npx tsc "$SOLUTION_FILE" --outDir /tmp
        JS_FILE="/tmp/$(basename ${SOLUTION_FILE%.ts}.js)"
        # Executar o JavaScript compilado
        node "$JS_FILE"
        ;;
    "python")
        python "$SOLUTION_FILE"
        ;;
    "java")
        # Compilar e executar Java
        javac "$SOLUTION_FILE"
        java -cp "$(dirname "$SOLUTION_FILE")" "Solution"
        ;;
    "javascript")
        node "$SOLUTION_FILE"
        ;;
esac

echo "======================================================================"
echo "Execução concluída." 