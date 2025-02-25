#!/bin/bash

# Script para configurar o ambiente

echo "Configurando o ambiente para o repositório LeetCode..."

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "Erro: npm não encontrado. Por favor, instale o Node.js e npm."
    exit 1
fi

# Verificar se typescript está instalado globalmente
if ! command -v tsc &> /dev/null; then
    echo "Instalando TypeScript globalmente..."
    npm install -g typescript
fi

# Criar ou atualizar package.json na raiz
if [ ! -f package.json ]; then
    echo "Criando package.json..."
    npm init -y
    
    # Adicionar dependências
    npm install --save-dev typescript @types/node ts-node
    
    # Adicionar scripts ao package.json
    npm pkg set scripts.tsc="tsc"
    npm pkg set scripts.test="echo \"Executando todos os testes...\""
else
    echo "Atualizando dependências..."
    npm install --save-dev typescript @types/node ts-node
fi

# Criar ou atualizar tsconfig.json
if [ ! -f tsconfig.json ]; then
    echo "Criando tsconfig.json..."
    echo '{
  "compilerOptions": {
    "target": "es2016",
    "module": "commonjs",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "skipLibCheck": true
  }
}' > tsconfig.json
fi

# Verificar se python está instalado
if command -v python &> /dev/null || command -v python3 &> /dev/null; then
    echo "Python encontrado."
else
    echo "Aviso: Python não encontrado. Algumas funcionalidades podem não estar disponíveis."
fi

echo "Configuração concluída!"
echo "Você pode começar a adicionar problemas usando: ./scripts/create-problem.sh" 