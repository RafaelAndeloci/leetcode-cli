#!/bin/bash

# Script para listar problemas por categoria

# Verificar se a categoria foi fornecida
if [ $# -lt 1 ]; then
    echo "Uso: $0 <categoria>"
    echo "Exemplo: $0 'dynamic-programming'"
    exit 1
fi

CATEGORY=$(echo $1 | tr '[:upper:]' '[:lower:]')

# Verificar se a categoria existe
if [ ! -d "categories/$CATEGORY" ]; then
    echo "Erro: Categoria '$CATEGORY' não encontrada."
    echo "Categorias disponíveis:"
    ls -l categories/ | grep '^d' | awk '{print "- " $9}'
    exit 1
fi

# Listar problemas na categoria
echo "Problemas na categoria '$CATEGORY':"
echo "======================================================================"

# Encontrar todos os arquivos MD na pasta da categoria
for file in categories/$CATEGORY/*.md; do
    if [ -f "$file" ]; then
        # Extrair o ID e o título do problema do arquivo
        TITLE=$(head -n 1 "$file" | sed 's/^# //')
        echo "$TITLE"
    fi
done

echo "======================================================================" 