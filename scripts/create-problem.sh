#!/bin/bash

# Script para criar um novo problema LeetCode

# Verificar se os argumentos necessários foram fornecidos
if [ $# -lt 3 ]; then
    echo "Uso: $0 <problema-id> <categoria> <linguagem>"
    echo "Exemplo: $0 123 'dynamic-programming' 'typescript'"
    exit 1
fi

PROBLEM_ID=$1
CATEGORY=$2
LANGUAGE=$3

# Formatar o ID do problema com 4 dígitos
FORMATTED_ID=$(printf "%04d" $PROBLEM_ID)

# Solicitar o título do problema
read -p "Digite o título do problema: " PROBLEM_TITLE

# Solicitar a descrição do problema
read -p "Digite a descrição do problema: " PROBLEM_DESCRIPTION

# Solicitar a dificuldade
read -p "Digite a dificuldade (Easy, Medium, Hard): " DIFFICULTY

# Criar diretórios
mkdir -p "problems/$FORMATTED_ID-${PROBLEM_TITLE// /-}/$(echo $LANGUAGE | tr '[:upper:]' '[:lower:]')"
mkdir -p "categories/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]')"

# Caminho do problema
PROBLEM_PATH="problems/$FORMATTED_ID-${PROBLEM_TITLE// /-}"

# Criar README do problema
cp templates/problem-template.md "$PROBLEM_PATH/README.md"

# Substituir placeholders no README
sed -i "s/{PROBLEM_ID}/$PROBLEM_ID/g" "$PROBLEM_PATH/README.md"
sed -i "s/{PROBLEM_TITLE}/$PROBLEM_TITLE/g" "$PROBLEM_PATH/README.md"
sed -i "s/{PROBLEM_DESCRIPTION}/$PROBLEM_DESCRIPTION/g" "$PROBLEM_PATH/README.md"
sed -i "s/{DIFFICULTY}/$DIFFICULTY/g" "$PROBLEM_PATH/README.md"
sed -i "s|{PROBLEM_URL}|https://leetcode.com/problems/${PROBLEM_TITLE// /-}/|g" "$PROBLEM_PATH/README.md"
sed -i "s/{CATEGORIES}/- $CATEGORY/g" "$PROBLEM_PATH/README.md"
sed -i "s|{SOLUTIONS_LIST}|- [$LANGUAGE](./$LANGUAGE/solution.$([ "$LANGUAGE" == "typescript" ] && echo "ts" || echo "$LANGUAGE"))|g" "$PROBLEM_PATH/README.md"

# Criar arquivo de solução
SOLUTION_TEMPLATE="templates/solution-template.$([ "$LANGUAGE" == "typescript" ] && echo "ts" || echo "$LANGUAGE")"
if [ -f "$SOLUTION_TEMPLATE" ]; then
    cp "$SOLUTION_TEMPLATE" "$PROBLEM_PATH/$LANGUAGE/solution.$([ "$LANGUAGE" == "typescript" ] && echo "ts" || echo "$LANGUAGE")"
else
    echo "Template para $LANGUAGE não encontrado. Criando arquivo vazio."
    touch "$PROBLEM_PATH/$LANGUAGE/solution.$([ "$LANGUAGE" == "typescript" ] && echo "ts" || echo "$LANGUAGE")"
fi

# Criar arquivo de referência na pasta de categorias
echo "# $PROBLEM_ID. $PROBLEM_TITLE" > "categories/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]')/$FORMATTED_ID-${PROBLEM_TITLE// /-}.md"
echo "" >> "categories/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]')/$FORMATTED_ID-${PROBLEM_TITLE// /-}.md"
echo "Este problema está categorizado como \"$CATEGORY\"." >> "categories/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]')/$FORMATTED_ID-${PROBLEM_TITLE// /-}.md"
echo "" >> "categories/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]')/$FORMATTED_ID-${PROBLEM_TITLE// /-}.md"
echo "[Ver detalhes do problema](../../$PROBLEM_PATH/README.md)" >> "categories/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]')/$FORMATTED_ID-${PROBLEM_TITLE// /-}.md"

echo "Problema $PROBLEM_ID ($PROBLEM_TITLE) criado com sucesso!"
echo "Estrutura de diretórios:"
echo "- $PROBLEM_PATH/"
echo "  - README.md"
echo "  - $LANGUAGE/"
echo "    - solution.$([ "$LANGUAGE" == "typescript" ] && echo "ts" || echo "$LANGUAGE")"
echo "- categories/$(echo $CATEGORY | tr '[:upper:]' '[:lower:]')/$FORMATTED_ID-${PROBLEM_TITLE// /-}.md" 