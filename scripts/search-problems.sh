#!/bin/bash

# Script para buscar problemas por termo

# Verificar se o termo de busca foi fornecido
if [ $# -lt 1 ]; then
    echo "Uso: $0 <termo-busca>"
    echo "Exemplo: $0 'array'"
    exit 1
fi

SEARCH_TERM=$1

echo "Buscando problemas com o termo '$SEARCH_TERM'..."
echo "======================================================================"

# Buscar em todos os arquivos README.md em problemas
FOUND=0

for readme in problems/*/README.md; do
    if [ -f "$readme" ]; then
        # Pesquisar o termo no arquivo
        if grep -i "$SEARCH_TERM" "$readme" > /dev/null; then
            # Extrair o ID e o título do problema
            TITLE=$(head -n 1 "$readme" | sed 's/^# //')
            PROBLEM_DIR=$(dirname "$readme")
            
            echo "Problema: $TITLE"
            echo "Diretório: $PROBLEM_DIR"
            
            # Extrair a categoria
            CATEGORY=$(grep -A1 "## Categorias" "$readme" | tail -n 1 | sed 's/- //')
            echo "Categoria: $CATEGORY"
            
            # Extrair a dificuldade
            DIFFICULTY=$(grep -A1 "## Dificuldade" "$readme" | tail -n 1)
            echo "Dificuldade: $DIFFICULTY"
            
            echo "-----------------------------------"
            FOUND=$((FOUND + 1))
        fi
    fi
done

if [ $FOUND -eq 0 ]; then
    echo "Nenhum problema encontrado com o termo '$SEARCH_TERM'."
else
    echo "Total de problemas encontrados: $FOUND"
fi

echo "======================================================================" 