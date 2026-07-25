# Ajuste de Capacidade Compartilhada - Guia de Teste

## Cenário de Teste

Evento: "Juntos Rumo ao Céu"  
Kits: Kit Completo + Kit Simples (compartilham as mesmas 300 vagas)

### Dados da API (exemplo esperado)

```json
{
  "lotes": [
    {
      "nomeEvento": "Juntos Rumo ao Céu",
      "lote": "Kit Completo",
      "capacidade": 300,
      "vendidos": 120,
      "pendentes": 10,
      "grupoCapacidade": {
        "id": "juntos-300-vagas",
        "capacidadeTotal": 300
      }
    },
    {
      "nomeEvento": "Juntos Rumo ao Céu",
      "lote": "Kit Simples",
      "capacidade": 300,
      "vendidos": 80,
      "pendentes": 5,
      "grupoCapacidade": {
        "id": "juntos-300-vagas",
        "capacidadeTotal": 300
      }
    }
  ]
}
```

## Comportamento Esperado

### Antes do Ajuste (INCORRETO) ❌
- **Tabela - Restantes (Kit Completo)**: 180 (calculado como 300 - 120)
- **Tabela - Restantes (Kit Simples)**: 220 (calculado como 300 - 80)
- **Total de Vagas Restantes**: 400 (soma 180 + 220) ← ERRADO!

### Depois do Ajuste (CORRETO) ✅
- **SharedCapacityCard**:
  - Capacidade total: 300
  - Inscrições aprovadas: 200 (120 + 80)
  - Pendentes: 15 (10 + 5)
  - **Vagas restantes: 100** (300 - 120 - 80 - 10 - 5)
  - Ocupação: 66% (200 / 300)

- **Tabela - Restantes (Kit Completo)**: **100** (do grupo)
- **Tabela - Restantes (Kit Simples)**: **100** (do grupo)
- **Total de Vagas Restantes no Painel**: **100** (não duplicado)

- **Ambos lotes mostram badge "Compartilhado"** para indicar que dividem as vagas

## Mudanças Técnicas

### 1. Função `agruparLotesPorCapacidade()` (loteGrouping.ts)
```typescript
// Para lotes compartilhados:
const vagasRestantes = Math.max(0, capacidadeTotal - vendidosTotais - pendentesTotais)

// Para lotes individuais:
const vagasRestantes = primeiroLote.vagasRestantes
```

### 2. Cálculo de Vagas Totais (DashboardPage.tsx)
```typescript
// Usa grupos para evitar duplicação:
const totalRemaining = 
  summaryQuery.data?.resumo.vagasRestantes ??
  agruparLotesPorCapacidade(summaryQuery.data?.lotes ?? [])
    .reduce((total, grupo) => total + grupo.vagasRestantes, 0) ??
  0
```

### 3. Tabela com Valores Corrigidos (LotesTable.tsx)
```typescript
// Para lotes compartilhados, usa valor do grupo:
const getVagasRestantes = (lote: DashboardLotMetrics): number => {
  if (lote.grupoCapacidade?.id) {
    const grupo = gruposCompartilhadosMap.get(lote.grupoCapacidade.id)
    if (grupo) return grupo.vagasRestantes  // ← Valor correto do grupo
  }
  return lote.vagasRestantes  // ← Valor individual
}

// Mesma lógica para percentual de ocupação
const getPercentualOcupacao = (lote: DashboardLotMetrics): number => {
  if (lote.grupoCapacidade?.id) {
    const grupo = gruposCompartilhadosMap.get(lote.grupoCapacidade.id)
    if (grupo) return grupo.percentualVendido
  }
  return lote.percentualVendido
}
```

## Casos de Uso Cobertos

✅ **Múltiplos lotes compartilhados**: Qualquer número de kits com o mesmo `grupoCapacidade.id`

✅ **Lotes individuais**: Continuam funcionando normalmente (sem `grupoCapacidade`)

✅ **Mix de compartilhados e individuais**: Cada um calcula conforme seu tipo

✅ **Múltiplos grupos no mesmo evento**: Cada grupo é agregado independentemente

## Como Criar Kits Compartilhados

No formulário de "Novo evento/lote" (NewEventPage.tsx):

1. **Primeiro Kit**
   - Nome: "Juntos Rumo ao Céu"
   - Kit/Lote: "Kit Completo"
   - Capacidade: 300
   - **Grupo de Capacidade**: `juntos-300-vagas` (novo)

2. **Segundo Kit (mesmo evento)**
   - Nome: "Juntos Rumo ao Céu"
   - Kit/Lote: "Kit Simples"
   - Capacidade: 300
   - **Grupo de Capacidade**: `juntos-300-vagas` (mesmo valor!)

Resultado: Os dois kits compartilham as 300 vagas totais.

## Validação de Teste

- [ ] Abrir Dashboard
- [ ] Selecionar evento "Juntos Rumo ao Céu"
- [ ] Confirmar que `SharedCapacityCard` mostra capacidade 300 e vagas corretas
- [ ] Confirmar que ambos os lotes na tabela mostram **100 vagas restantes**
- [ ] Confirmar que "Vagas restantes" no topo mostra **100** (não 200)
- [ ] Confirmar que percentual de ocupação em ambos os lotes é **66%**
- [ ] Confirmar que arrecadação mostra soma correta de ambos os kits
