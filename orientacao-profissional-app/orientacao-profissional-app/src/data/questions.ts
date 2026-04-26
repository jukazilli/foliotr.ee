import type { Question } from '../types/test';

export const questions: Question[] = [
  { number: 1, id: 'BF01', block: 'bigFive', dimension: 'conscienciosidade', text: 'Antes de começar algo importante, eu gosto de organizar o que precisa ser feito.' },
  { number: 2, id: 'BF02', block: 'bigFive', dimension: 'conscienciosidade', text: 'Costumo cumprir prazos mesmo quando a tarefa não é muito interessante.' },
  { number: 3, id: 'BF03', block: 'bigFive', dimension: 'conscienciosidade', text: 'Tenho facilidade para manter foco até terminar o que comecei.' },
  { number: 4, id: 'BF04', block: 'bigFive', dimension: 'conscienciosidade', text: 'Costumo deixar tarefas pela metade quando aparece algo mais interessante.', reverse: true },

  { number: 5, id: 'BF05', block: 'bigFive', dimension: 'amabilidade', text: 'Tento entender o ponto de vista das outras pessoas antes de responder.' },
  { number: 6, id: 'BF06', block: 'bigFive', dimension: 'amabilidade', text: 'Gosto de colaborar para que o ambiente fique mais leve e respeitoso.' },
  { number: 7, id: 'BF07', block: 'bigFive', dimension: 'amabilidade', text: 'Tenho paciência para ajudar alguém que está com dificuldade.' },
  { number: 8, id: 'BF08', block: 'bigFive', dimension: 'amabilidade', text: 'Em discussões, costumo impor minha opinião mesmo quando isso gera conflito.', reverse: true },

  { number: 9, id: 'BF09', block: 'bigFive', dimension: 'estabilidadeEmocional', text: 'Consigo manter a calma quando algo sai diferente do planejado.' },
  { number: 10, id: 'BF10', block: 'bigFive', dimension: 'estabilidadeEmocional', text: 'Mesmo sob pressão, consigo pensar com clareza antes de agir.' },
  { number: 11, id: 'BF11', block: 'bigFive', dimension: 'estabilidadeEmocional', text: 'Quando recebo uma crítica, consigo refletir sem me abalar demais.' },
  { number: 12, id: 'BF12', block: 'bigFive', dimension: 'estabilidadeEmocional', text: 'Fico muito ansioso quando preciso tomar decisões importantes.', reverse: true },

  { number: 13, id: 'BF13', block: 'bigFive', dimension: 'extroversao', text: 'Tenho facilidade para conversar com pessoas que acabei de conhecer.' },
  { number: 14, id: 'BF14', block: 'bigFive', dimension: 'extroversao', text: 'Gosto de participar de conversas, reuniões ou atividades em grupo.' },
  { number: 15, id: 'BF15', block: 'bigFive', dimension: 'extroversao', text: 'Sinto energia quando estou interagindo com outras pessoas.' },
  { number: 16, id: 'BF16', block: 'bigFive', dimension: 'extroversao', text: 'Evito situações em que preciso me expor ou falar com muitas pessoas.', reverse: true },

  { number: 17, id: 'BF17', block: 'bigFive', dimension: 'abertura', text: 'Gosto de aprender coisas novas, mesmo quando parecem difíceis no começo.' },
  { number: 18, id: 'BF18', block: 'bigFive', dimension: 'abertura', text: 'Tenho curiosidade para entender assuntos diferentes dos que já conheço.' },
  { number: 19, id: 'BF19', block: 'bigFive', dimension: 'abertura', text: 'Gosto de testar novas formas de resolver problemas.' },
  { number: 20, id: 'BF20', block: 'bigFive', dimension: 'abertura', text: 'Prefiro sempre fazer as coisas do jeito conhecido, mesmo quando existem alternativas melhores.', reverse: true },

  { number: 21, id: 'R01', block: 'riasec', dimension: 'realista', text: 'Montar, ajustar ou consertar algo usando as mãos, ferramentas ou equipamentos.' },
  { number: 22, id: 'R02', block: 'riasec', dimension: 'realista', text: 'Trabalhar com atividades práticas, onde o resultado pode ser visto de forma concreta.' },
  { number: 23, id: 'R03', block: 'riasec', dimension: 'realista', text: 'Resolver problemas observando diretamente como algo funciona na prática.' },
  { number: 24, id: 'R04', block: 'riasec', dimension: 'realista', text: 'Atuar em ambientes que envolvem operação, produção, construção, campo ou tecnologia aplicada.' },

  { number: 25, id: 'I01', block: 'riasec', dimension: 'investigativo', text: 'Pesquisar a causa de um problema antes de escolher uma solução.' },
  { number: 26, id: 'I02', block: 'riasec', dimension: 'investigativo', text: 'Analisar informações, dados ou padrões para encontrar respostas.' },
  { number: 27, id: 'I03', block: 'riasec', dimension: 'investigativo', text: 'Estudar um assunto em profundidade até compreender como ele funciona.' },
  { number: 28, id: 'I04', block: 'riasec', dimension: 'investigativo', text: 'Resolver desafios que exigem lógica, investigação e raciocínio.' },

  { number: 29, id: 'A01', block: 'riasec', dimension: 'artistico', text: 'Criar ideias visuais, textos, conceitos, campanhas, histórias ou apresentações.' },
  { number: 30, id: 'A02', block: 'riasec', dimension: 'artistico', text: 'Trabalhar com liberdade para imaginar soluções diferentes.' },
  { number: 31, id: 'A03', block: 'riasec', dimension: 'artistico', text: 'Transformar uma ideia em algo criativo, bonito, expressivo ou marcante.' },
  { number: 32, id: 'A04', block: 'riasec', dimension: 'artistico', text: 'Melhorar a forma como uma mensagem, produto ou experiência é apresentada.' },

  { number: 33, id: 'S01', block: 'riasec', dimension: 'social', text: 'Ensinar, orientar ou acompanhar o desenvolvimento de outra pessoa.' },
  { number: 34, id: 'S02', block: 'riasec', dimension: 'social', text: 'Ajudar pessoas a resolverem dificuldades pessoais, profissionais ou de aprendizagem.' },
  { number: 35, id: 'S03', block: 'riasec', dimension: 'social', text: 'Trabalhar ouvindo, acolhendo, cuidando ou dando suporte a pessoas.' },
  { number: 36, id: 'S04', block: 'riasec', dimension: 'social', text: 'Participar de atividades que geram impacto positivo na vida de outras pessoas.' },

  { number: 37, id: 'E01', block: 'riasec', dimension: 'empreendedor', text: 'Convencer pessoas a apoiarem uma ideia, proposta, produto ou projeto.' },
  { number: 38, id: 'E02', block: 'riasec', dimension: 'empreendedor', text: 'Liderar iniciativas, tomar decisões e movimentar pessoas em direção a um objetivo.' },
  { number: 39, id: 'E03', block: 'riasec', dimension: 'empreendedor', text: 'Negociar, vender, apresentar propostas ou defender soluções.' },
  { number: 40, id: 'E04', block: 'riasec', dimension: 'empreendedor', text: 'Assumir desafios maiores para alcançar crescimento, reconhecimento ou resultado.' },

  { number: 41, id: 'C01', block: 'riasec', dimension: 'convencional', text: 'Organizar informações, documentos, planilhas, registros ou processos.' },
  { number: 42, id: 'C02', block: 'riasec', dimension: 'convencional', text: 'Seguir procedimentos claros para evitar erros e manter tudo funcionando bem.' },
  { number: 43, id: 'C03', block: 'riasec', dimension: 'convencional', text: 'Conferir detalhes, números, prazos e informações importantes.' },
  { number: 44, id: 'C04', block: 'riasec', dimension: 'convencional', text: 'Criar controles, padrões ou rotinas para melhorar a organização de uma atividade.' },

  { number: 45, id: 'ARQ01', block: 'archetype', dimension: 'estruturador', text: 'Sinto satisfação quando consigo organizar algo que estava confuso.' },
  { number: 46, id: 'ARQ02', block: 'archetype', dimension: 'estruturador', text: 'Gosto de transformar ideias em planos, processos ou sistemas que funcionam.' },
  { number: 47, id: 'ARQ03', block: 'archetype', dimension: 'estruturador', text: 'Me sinto bem quando assumo responsabilidade e ajudo algo a ficar mais seguro ou eficiente.' },
  { number: 48, id: 'ARQ04', block: 'archetype', dimension: 'estruturador', text: 'Prefiro construir algo sólido e confiável do que depender de improviso o tempo todo.' },

  { number: 49, id: 'ARQ05', block: 'archetype', dimension: 'conectado', text: 'Sinto que meu esforço vale a pena quando consigo ajudar alguém de forma direta.' },
  { number: 50, id: 'ARQ06', block: 'archetype', dimension: 'conectado', text: 'Costumo perceber quando uma pessoa precisa de apoio, mesmo que ela não diga claramente.' },
  { number: 51, id: 'ARQ07', block: 'archetype', dimension: 'conectado', text: 'Gosto de ambientes onde existe cooperação, cuidado e troca entre as pessoas.' },
  { number: 52, id: 'ARQ08', block: 'archetype', dimension: 'conectado', text: 'Me motiva ver pessoas evoluindo com alguma ajuda, orientação ou apoio meu.' },

  { number: 53, id: 'ARQ09', block: 'archetype', dimension: 'explorador', text: 'Sinto prazer em aprender, descobrir e entender coisas novas.' },
  { number: 54, id: 'ARQ10', block: 'archetype', dimension: 'explorador', text: 'Gosto de investigar possibilidades antes de aceitar uma resposta pronta.' },
  { number: 55, id: 'ARQ11', block: 'archetype', dimension: 'explorador', text: 'Fico animado quando posso explorar um assunto novo ou um caminho diferente.' },
  { number: 56, id: 'ARQ12', block: 'archetype', dimension: 'explorador', text: 'Me sinto mais motivado quando tenho liberdade para testar ideias e seguir minha curiosidade.' },

  { number: 57, id: 'ARQ13', block: 'archetype', dimension: 'transformador', text: 'Me motiva enfrentar desafios difíceis e encontrar uma forma de superá-los.' },
  { number: 58, id: 'ARQ14', block: 'archetype', dimension: 'transformador', text: 'Gosto de liderar mudanças, tirar ideias do papel e fazer algo acontecer.' },
  { number: 59, id: 'ARQ15', block: 'archetype', dimension: 'transformador', text: 'Tenho energia quando existe uma meta ambiciosa ou um problema importante para resolver.' },
  { number: 60, id: 'ARQ16', block: 'archetype', dimension: 'transformador', text: 'Sinto satisfação quando consigo mudar uma situação, uma equipe, um projeto ou um negócio para melhor.' }
];
