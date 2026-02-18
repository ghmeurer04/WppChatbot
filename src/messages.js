import * as db from './database.mjs';

const string_categories = "['Moradia','Supermercado','Alimentação','Social & Lazer','Saúde','Transporte','Educação','Investimentos','Compras','Outros']";
const method_categories = "['Dinheiro','Cartão de Crédito','Cartão de Débito','Pix','Boleto']";

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function get_message_welcome(name,variant){
    if (variant == "altair"){
        return 'Bem-vindo, ' + name + '.\n\
Aqui você controla seu dinheiro.\n\
Aqui você mantém disciplina.\n\
Aqui você evolui.\n\
Eu organizo. Você decide.\n\n\
Digite menu para começar.'
    }
    return 'Parabéns por esse passo, ' + name + '! Agora você tem uma ferramenta que te dá controle, segurança e \
poder sobre o seu dinheiro.\n\n\
Para acessar o menu a qualquer momento, é só digitar "*menu*" ou "*fatura*".'
};

export function get_message_menu(name,variant){
    if(variant == 'altair')
    {
        return 'O que você pode fazer:\n\n\
• Ver gastos → digite *fatura* ou *relatório*\n\
• Registrar gasto → *descrição + valor + pagamento*\n\
Ex: mercado 150 pix\n\n\
• Enviar *foto* da fatura\n\
• Mandar *áudio* com o gasto\n\
• Registrar assinatura → assinatura Netflix 39.90\n\n\
Digite *menu* quando quiser voltar.\n\
Controle total. Simples assim.'
    }
    return '✨ Oi, ' + name + '! Aqui estão as opções rápidas pra você:\n\n\
\
📊 *Ver seus gastos*\n\
Digite relatório ou fatura e veja pra onde seu dinheiro foi.\n\n\
\
📝 *Registrar um novo gasto*\n\
Escreva: descrição valor forma de pagamento\n\n\
➡️ Exemplo: mercado 150 pix\n\n\
\
📸 *Foto da fatura*\n\
Pode mandar a foto que eu registro pra você.\n\n\
\
🎤 *Áudio*\n\
Prefere falar? Manda um áudio contando o gasto que eu anoto do seu jeitinho 😉\n\n\
\
🔁 *Assinaturas/recorrentes*\n\
Escreva: assinatura descrição valor\n\
➡️ Exemplo: assinatura Netflix 39.90\n\n\
\
💬 A qualquer momento, digite "*menu*" ou "*fatura*" pra ver essas opções novamente.\n\n\
\
Simples, rápido e feito pra você 💕'

}

export function get_message_unregistered(name) {
    return '🚨 Atenção! 🚨 ' + name + '!!\n\
Você ainda não está cadastrado no nosso sistema!\n\n\
Não perca tempo e comece agora a ter o controle total das suas finanças! 💰💡\n\n\
Com a nossa plataforma, você vai poder organizar seus gastos, realizar relatórios financeiros e ter tudo no mesmo lugar! 📊🗓️\n\n\
Não deixe suas finanças no improviso. Assine e tenha o controle da sua vida financeira na palma da sua mão! 🤳📈\n\n\
https://buy.stripe.com/00w4gydkTgxQ6LI7nF38400'
}

export function get_message_duedate(name, date){
    return '📅 Olá, ' + name +'!\n\
Seu plano está ativo, mas fique atento: ele vence em\n\n\
🕒 ' + date.getDate() + ' de ' + date.toLocaleString('pt-BR', { month: 'long' }) + ' de ' + date.getFullYear() + ' às ' + date.getHours() + ':' + date.getMinutes() + '.\n\n\
⌛ Não deixe para depois! Garanta que você continuará tendo acesso total aos seus relatórios e ferramentas financeiras. 💼📊\n\n\
Se precisar de ajuda para renovar, é só chamar! 🤝'
}

export function get_message_limit(name){
    return 'Desculpe' + name + ', voce atingiu nosso limite de requisições mensais.'
}

export function get_message_removal(id){
    return 'Seu gasto ' + id[0] + ' foi removido! 🤝'
}

export function get_message_removal_fail(id){
    return 'Não foi possível encontrar o gasto ' + id[0] + '! 💰'
}

export function get_message_help(name){
    return 'Peço desculpas ' + name + ', mas não consegui identificar a mensagem.\n\n📲 Digite "*menu*" para ver todas as opções disponíveis!\n\
📋 Quer saber o que você pode fazer por aqui?\n\
É só mandar um "*menu*" que a mágica acontece! ✨\n\
Simples, rápido e direto ao ponto! 💬✅'
}

export function get_message_failed_payment(variant){
    if(variant == 'altair'){
        const random = getRandomInt(1,2);
        switch(random){
            case 1:
                return 'Algo não está certo.\n\
Envie o gasto completo:\n\
descrição + valor + forma.'
            default:
                return 'Fala.\n\
Se quiser registrar um gasto, mande:\n\
descrição + valor + pagamento\n\
Ex: gasolina 120 pix\n\
Digite menu para ver opções.'
        }
    }
    const random = getRandomInt(1,15);
    switch (random){
        case 1:
            return "💚 Oi! Não consegui identificar um gasto nessa mensagem. Se quiser, é só me mandar o valor 😊"
        case 2:
            return '🌷 Estou por aqui! Para anotar, me envie o valor e o que foi gasto'
        case 3:
            return '✨ Não encontrei uma compra nessa mensagem. Quando quiser, é só me contar 😉'
        case 4:
            return '💕 Para eu anotar direitinho, me mande o gasto com valor, tá bem?'
        case 5:
            return '🌼 Acho que não veio um gasto dessa vez. Pode me enviar quando quiser'
        case 6:
            return '💚 Quando quiser anotar uma compra, é só me mandar o valor'
        case 7:
            return '🌷 Não consegui identificar uma despesa agora. Fico aguardando 💕'
        case 8:
            return "✨ Me manda o gasto assim que puder que eu anoto pra você"
        case 9:
            return '💕 Essa mensagem não veio com uma compra, mas estou aqui'
        case 10:
            return '🌱 Para organizar, preciso do valor do gasto. Pode me mandar?'
        case 11:
            return '💚 Não encontrei nenhum gasto nessa mensagem. Sem pressa 😉'
        case 12:
            return '🌼 Quando quiser registrar algo, é só me avisar'
        case 13:
            return '✨ Não identifiquei uma despesa agora, mas sigo à disposição'
        case 14:
            return '💕 Me manda o valor do gasto que eu cuido do resto'
        default:
            return '🌷 Acho que dessa vez não veio um gasto. Quando quiser, estou aqui'
    }
}

export function get_message_reminder_failed_payment(variant){
    if (variant == 'altair'){
        return 'Informação incompleta.\n\
Envie:\n\
descrição valor pagamento.'
    }
    return '🌷 Lembrete rápido – Como a Cida funciona\n\n\
💚 Só um lembretinho 😊\n\
📒 Como funciona:\n\
    ● Você pode me mandar mensagem escrita, áudio ou foto\n\
    ● Pode ser do seu jeito, sem preocupação\n\n\
👉 Para anotar um gasto, é só mandar:\n\
    ● “Mercado 120 credito”\n\
    ● “Luz 95 pix”\n\
    ● ou mandar a foto do comprovante\n\
    ● ou falar em áudio\n\n\
Eu vou te responder assim:\n\
💚 Prontinho! Salvei como Anotação 1\n\n\
🗑 Se quiser apagar depois, é só escrever:\n\
    Remover Anotação 1\n\n\
✨ Pode escrever curto\n\
✨ Pode falar do seu jeito\n\
✨ Estou aqui pra te ajudar\n\n\
Sou seu braço direito na organização financeira 💕'
}

export function get_message_entry(valor,new_id){
    return '🔥 Show! Acabei de registrar a entrada/salário!\n\n\
💵 Valor: ' + valor + '\n\
📁 Anotação: ' + new_id
}

export function get_message_signature(descricao,valor,new_id){
    return '🔥 Show! Acabei de registrar sua assinatura!\n\n\
📌 Descrição: ' + descricao + '\n\
💵 Valor: ' + valor + '\n\
📁 Anotação: ' + new_id
}

export async function get_message_result(result, new_id){
    return '📌 Descrição: ' + await db.capitalizeFirstLetter(result.descricao) + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Forma de pagamento: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 Anotação: ' + new_id
}

export function get_message_removal_description(new_id, variant){
    const random = getRandomInt(1,15);

    if (variant == 'altair'){
        switch (random){
            case 1:
                return "Se errar, é só escrever: Remover Anotação " + new_id
            case 2:
                return 'Quer apagar? Escreva: Remover Anotação ' + new_id
            case 3:
                return 'Para corrigir, mande: Remover Anotação '  + new_id
            case 4:
                return 'Apagar é fácil: Remover Anotação '  + new_id
            case 5:
                return 'Errou alguma coisa? Remover Anotação ' + new_id
            case 6:
                return 'Para apagar depois, escreva: Remover Anotação ' + new_id
            case 7:
                return 'Quer corrigir? Remover Anotação ' + new_id
            case 8:
                return "É só escrever assim: Remover Anotação " + new_id
            case 9:
                return 'Para excluir, mande: Remover Anotação ' + new_id
            case 10:
                return 'Apagar é simples: Remover Anotação ' + new_id
            case 11:
                return 'Se quiser apagar, escreva: Remover Anotação ' + new_id
            case 12:
                return 'Para corrigir, é só: Remover Anotação ' + new_id
            case 13:
                return 'Errou? É só mandar: Remover ' + new_id
            case 14:
                return 'Para apagar uma anotação: Remover Anotação ' + new_id
            default:
                return 'Fácil assim: Remover Anotação ' + new_id
        }
    }

    switch (random){
        case 1:
            return "💚 Se errar, é só escrever: Remover Anotação " + new_id
        case 2:
            return '🌼 Quer apagar? Escreva: Remover Anotação ' + new_id
        case 3:
            return '✨ Para corrigir, mande: Remover Anotação '  + new_id
        case 4:
            return '💕 Apagar é fácil: Remover Anotação '  + new_id
        case 5:
            return '🌷 Errou alguma coisa? Remover Anotação ' + new_id
        case 6:
            return '💚 Para apagar depois, escreva: Remover Anotação ' + new_id
        case 7:
            return '🌱 Quer corrigir? Remover Anotação ' + new_id
        case 8:
            return "🌼 É só escrever assim: Remover Anotação " + new_id
        case 9:
            return '✨ Para excluir, mande: Remover Anotação ' + new_id
        case 10:
            return '💕 Apagar é simples: Remover Anotação ' + new_id
        case 11:
            return '🌷 Se quiser apagar, escreva: Remover Anotação ' + new_id
        case 12:
            return '💚 Para corrigir, é só: Remover Anotação ' + new_id
        case 13:
            return '🌱 Errou? É só mandar: Remover ' + new_id
        case 14:
            return '🌼 Para apagar uma anotação: Remover Anotação ' + new_id
        default:
            return '✨ Fácil assim: Remover Anotação ' + new_id
    }
}

export function get_message_payment(name,variant){
    if (variant == 'altair'){
        const message = getRandomInt(1,7);
        switch (message){
            case 1:
                return 'Missão concluída, ' + name + '! Registro salvo'
            case 2:
                return 'Feito, ' + name + '. Seu gasto foi anotado.'
            case 3:
                return 'Registrado. Controle atualizado.'
            case 4:
                return 'Gasto registrado com sucesso, ' + name + '.'
            case 5:
                return 'Confirmado, ' + name + '. Organização em dia.'
            case 6:
                return 'Anotei aqui, ' + name + '. Controle firme.'
            case 7:
                return 'Salvo no sistema. Disciplina mantida.'
            case 8:
                return 'Anotado, ' + name + '. Seguimos focados.'
            case 9:
                return 'Feito, ' + name + '. Controle é poder.'
            default:
                return 'Atualizado, ' + name + '. Seu financeiro agradece.'
        }
    }

    const message = getRandomInt(1,7);
    switch (message){
        case 1:
            return '🔥 Show, ' + name + '! Acabei de guardar esse gasto na sua lista!'
        case 2:
            return '✅ ' + name + ', registro concluído com sucesso.'
        case 3:
            return '🎉 ' + name + ', registro feito com sucesso!'
        case 4:
            return '✅ Gasto anotado com sucesso, ' + name + ' 🚀'
        case 5:
            return '✨ Pronto, ' + name + '! Seu gasto foi registrado. Organização em dia 😉'
        case 6:
            return '📌 Registro confirmado, ' + name + '! Mais um passo para manter tudo sob controle 💼'
        case 7:
            return '👏 ' + name + ', gasto salvo com sucesso! Boa disciplina financeira 💪'
        default:
            return '✨ Pronto, ' + name + '! Seu gasto foi registrado. Organização em dia 😉'
    }

}




export function get_prompt_report(start, message){
    return "Considerando que hoje é " + start + ", identifique o período desejado na frase a seguir e retorne apenas a data de início e fim do período em um json de chaves inicio e fim, sem explicações adicionais. Se não for possivel identificar o período, retornar a frase original.\
\
Frase: " + message;
}

export function get_prompt_payment(message){
    return "Identifique descricao, metodo de pagamento, numero de parcelas e valor de cada parcela descritos na frase a seguir.\
\
Se não for possível identificar descricao, metodo ou valor ou se a frase não for compativel com esse pedido, retorne apenas a frase original. Caso seja possivel a identificação, retorne apenas a descricao, método de pagamento, numero de parcelas, o valor de cada parcela, com ponto decimal '.' e categoria, baseado na descrição identificada, sem explicações adicionais, em um formato de json contendo 5 chaves descricao, valor, metodo, parcela e categoria, conforme a seguir:\
{\"descricao\": 'descricao encontrada',\"valor\":valor numerico de cada parcela,\"metodo\":'metodo de pagamento encontrado',\"parcela\":quantidade de parcelas identificadas,\"categoria\": 'categoria identificada'}.\
NENHUM DOS VALORES DESSE JSON PODE SER NULO e se nao forem encontrados, retorne a frase original\
\
Categorias disponíveis: " + string_categories + "\n\
Metodos disponíveis: " + method_categories + "\n\n\
\
Frase: " + message;
}

export function get_prompt_media(){
    return "Identifique descricao, metodo de pagamento, numero de parcelas e valor de cada parcela presentes no anexo a seguir.\
\
Se não for possível identificar ou se o anexo não for compativel com esse pedido, retorne apenas a frase 'erro'. Caso seja possivel a identificação, retorne apenas a descricao, método de pagamento, numero de parcelas, o valor de cada parcela, com ponto decimal '.' e categoria, baseado na descrição identificada, sem explicações adicionais, em um formato de lista de jsons contendo 5 chaves descricao, valor, metodo, parcela e categoria, conforme a seguir:\
[{\"descricao\": 'descricao encontrada',\"valor\":valor numerico de cada parcela,\"metodo\":'metodo de pagamento encontrado',\"parcela\":quantidade de parcelas identificadas,\"categoria\": 'categoria identificada'}].\
NENHUM DOS VALORES DESSE JSON PODE SER NULO e se nao forem encontrados, retorne a frase original\
Categorias disponíveis: " + string_categories + "\n\
Metodos disponíveis: " + method_categories
}

export function get_prompt_signature(message){
    return "Identifique descricao da assinatura e valor descritos na frase a seguir.\
\
Se não for possível identificar ou se a frase não for compativel com esse pedido, retorne apenas a frase original. Caso seja possivel a identificação, retorne apenas a descricao, sem palavras como assinatura, plano, recorrente, entre outras similares, e o valor, com ponto decimal '.', baseado na descrição identificada, sem explicações adicionais, em um json de 2 chaves descricao, valor.\
\nFrase: " + message;
}

export function get_reminder_message(name, description, hours){
    const variant = getRandomInt(1,15);
    switch (variant){
        case 1:
            return '🩷 Oi, ' + name + '! Só lembrando da sua ' + description + ' às ' + hours + ' (' + date + ') 🌸.'
        case 2:
            return '🌷 Ei, ' + name + '! Hoje tem sua ' + description + ' às ' + hours + '. Já separou o que precisa levar? 🧺'
        case 3:
            return '☕ Bom dia, ' + name + '! Sua ' + description + ' é hoje, às ' + hours + '. Você vai tirar de letra! 💪'
        case 4:
            return '💌 Oi, ' + name + '! Só passando pra te lembrar da ' + description + ' marcada pra hoje, às ' + hours + ' 🌼'
        case 5:
            return '💖 ' + name + ', hoje tem ' + description + ' às ' + hours + '. Cuida de você como cuida da casa 🌿'
        case 6:
            return '🌸 Ei, ' + name + '! Tá chegando a hora da sua ' + description + ' (' + hours + '). Se organiza com calma 💕'
        case 7:
            return '🌻 ' + name + ', sua ' + description + ' é hoje às ' + hours + '. Já tomou aquele cafezinho pra recarregar as energias? ☕'
        case 8:
            return '🧺 Lembrete gentil: sua ' + description + ' acontece hoje às ' + hours + ' 🌷'
        case 9:
            return '💐 Oi, ' + name + '! Sua ' + description + ' é hoje às ' + hours + '. Tá tudo pronto por aí? 😄'
        case 10:
            return '🩵 Ei, ' + name + '! Hoje é dia da sua ' + description + ' às ' + hours + '. Se organiza com calma 💕'
        case 11:
            return '🌷 ' + name + ', lembrete da Cida: ' + description + ' às ' + hours + ' de hoje 🌸'
        case 12:
            return '💌 Bom dia, ' + name + '! Hoje é o dia da sua ' + description + ' às ' + hours + '. Respira fundo e vai tranquila 🌼'
        case 13:
            return '💖 Ei, ' + name + '! Tá chegando a hora da sua ' + description + ' às ' + hours + '. Não esquece, tá? 🌿'
        case 14:
            return '🩵 Hoje às ' + hours + ' é dia da sua ' + description + ', ' + name + ' 🌷. Já confirmou o horário? ⏰'
        case 15:
            return '🌸 Lembrete do coração: sua ' + description + ' é hoje às ' + hours + ', ' + name + ' 💕'
    }
}

export function get_reminder_confirmation(name){
    const variant = getRandomInt(1,15);
    switch (variant){
        case 1:
            return '✨ Combinado, ' + name + '! Te lembro direitinho no horário, pode deixar comigo 💕'
        case 2:
            return '💬 Perfeito! Cida anotou tudinho. Te aviso no horário certinho 😉'
        case 3:
            return '🩵 Tudo certo, ' + name + '! Eu te lembro com carinho na hora combinada 🌸'
        case 4:
            return '📅 Pode deixar, ' + name + '. Cida tá de olho na sua agenda 🕒'
        case 5:
            return ' ✨ Anotadinho aqui, ' + name + '! Te aviso no momento certinho 💬'
        case 6:
            return ' 🪻 Tudo anotado! Eu te mando o aviso no tempo certo, prometo 🕓'
        case 7:
            return '🩷 Pode relaxar, ' + name + '! Cida vai te lembrar sem falta 🌼'
        case 8:
            return '💬 Tudo certo! Eu te aviso direitinho quando chegar a hora 💕'
        case 9:
            return ' ✨ Perfeito, ' + name + '! Cida vai te lembrar pontualmente 🌸'
        case 10:
            return '🩷 Combinado! Eu te lembro na hora e, se quiser, um pouquinho antes também 💬'
        case 11:
            return ' ✨ Tudo bem! Cida já anotou e vai te avisar 💕'
        case 12:
            return ' 🪻 Pode deixar comigo, ' + name + '! Te aviso no momento certinho ⏰'
        case 13:
            return ' 💬 Ok, ' + name + '! Cida vai cuidar disso pra você 🩷'
        case 14:
            return ' ✨ Tudo certinho! Pode confiar que eu te lembro 💬'
        case 15:
            return ' 🌻 Combinado, flor! Eu te aviso no horário, pra você não se preocupar 🫶'
    }
}

export function get_prompt_messagetype(message){
    return "Classifique a seguinte mensagem em uma das categorias: 'registro de gasto', 'registro de assinatura' ou 'lembrete'. Se não identificar, retorne a mensagem 'erro'. Retorne apenas a categoria identificada em letras minusculas, sem explicações adicionais. Mensagem: " + message;
}

export function get_prompt_reminder(message){
    return "Considerando que agora é " + new Date() + ". Identifique a descricao e a data/hora descritos na frase a seguir. Retorne um json contendo tres chaves, uma de descricao, chamada descricao, uma de data no formato mm/dd/yyyy, chamada data, e outra de hora no formato hh:mm, chamada hora.\
Frase: " + message;
}

export function get_prompt_opinion(report_message){
    report_message = report_message.slice(report_message.indexOf("-----------------"))
    return report_message + " \n\nObserve as informações financeiras fornecidas e gere apenas um texto curto, leve e resumido, contendo emojis, identificando pontos de melhoria financeira. Evite listas extensas, títulos ou muitos bullet points. Não elogie a estrutura da lista no inicio da frase e prefira um parágrafo contínuo ou poucos parágrafos, com linguagem clara, concisa, prática e acessível, focada em ajustes realistas para o próximo período."    
}


export async function get_report_message(input_msg, number,last_month = false){
            var start = new Date();
            var end = new Date();
            var message = '';
            if(!(input_msg == '1' || input_msg == 'relatório' || input_msg == 'relatorio' || input_msg == 'saldo' || input_msg == 'fatura')){
                message += '🧾 Fatura: \n';
                const response = await db.get_request(get_prompt_report(start,input_msg));
                if(!(response == input_msg)){
                    var json = JSON.parse(response.match(/{[\s\S]*\}/)[0]);
                    start = new Date(json.inicio);
                    end = new Date(json.fim);
                } else {
                    start = new Date((start.getMonth()+1) + '/01/' + start.getFullYear())
                }
            } else if (last_month) {
                start = new Date(new Date().getFullYear(),new Date().getMonth() - 1,1);
                end.setDate(end.getDate() - 1);
                message += '🧾 Fatura ' + await db.capitalizeFirstLetter(start.toLocaleString('pt-BR', { month: 'long' })) + '/' + start.getFullYear() + '\n';
            } else {
                message += '🧾 Fatura ' + await db.capitalizeFirstLetter(start.toLocaleString('pt-BR', { month: 'long' })) + '/' + start.getFullYear() + '\n';
                start = new Date((start.getMonth()+1) + '/01/' + start.getFullYear())
            }
            start.setUTCHours(0,0,0,1)
            end.setUTCHours(23,59,59,999)
            start = new Date(start.setHours(start.getHours() + 3));
            end = new Date(end.getFullYear(),end.getMonth() + 1,0);
            var documents = await db.find('report',{$and:[{"phone_number":{$eq:number}},{"method":{$ne:"Assinatura"}},{"date":{$gt:start.getTime()}},{"date":{$lt:end.getTime()}}]});
            var signatures = await db.find('report',{$and:[{"phone_number":{$eq:number}},{"method":{$eq:"Assinatura"}}]});
            var entrada = documents.filter(x => x.method == '')
            documents = documents.filter(x => x.method != '' && x.method != 'Assinatura')
            var entry = 0;
            for(let i = 0; i < entrada.length; i++){
                entry += Number(String(entrada[i].value).match(/\d+[\,\.]?\d{0,2}/)[0].replace(",", "."));
            }
    
            for(let i = 0; i < signatures.length; i++){
                documents.push(signatures[i]);
            }
            if (documents.length > 0) {
                var methods = {};
                var categories = {};
    
                for (let i = 0; i < documents.length; i++) {
                    if (methods.hasOwnProperty(documents[i].method)){
                        methods[documents[i].method].push(documents[i]);
                    } else {
                        methods[documents[i].method] = [];
                        methods[documents[i].method].push(documents[i]);
                    }
                    if (categories.hasOwnProperty(documents[i].category)){
                        categories[documents[i].category].push(documents[i]);
                    } else {
                        categories[documents[i].category] = [];
                        categories[documents[i].category].push(documents[i]);
                    }
    
                }
                var saldo = 0;
                var list_methods = Object.keys(methods);
                var report = '';
                var saldo_method = {"Dinheiro":0,"Cartão de Crédito":0,"Cartão de Débito":0,"Pix":0,"Boleto":0,"Assinatura":0,"Outros":0};
                for (let i = 0; i < list_methods.length; i++) {
                    //report += '\n\n   *·* ' + list_methods[i] + ': \n'
                    for (let j = 0; j < methods[list_methods[i]].length; j++) {
                        var current = methods[list_methods[i]][j];
                        //console.log(methods[list_methods[i]],current,current.date)
                        //report += new Date(current.date).toLocaleDateString('pt-BR') + ' - ' + current.description + ': R$' + Number(current.value).toFixed(2) + ' [' + current.id + ']\n';
                        saldo += Number(String(current.value).match(/\d+[\,\.]?\d{0,2}/)[0].replace(",", "."));
                        saldo_method[current.method] += Number(String(current.value).match(/\d+[\,\.]?\d{0,2}/)[0].replace(",", "."));
                    }
                }
                var list_categories = Object.keys(categories);
                for (let i = 0; i < list_categories.length; i++) {
                    var sum_category = categories[list_categories[i]].reduce((acc, item) => acc + Number(item.value), 0)
                    report += '\n-------------------------------------------\n   *· ' + list_categories[i] + '* - *_R$ '+ sum_category.toFixed(2) + '_*\n'
                    for (let j = 0; j < categories[list_categories[i]].length; j++) {
                        var current = categories[list_categories[i]][j];
                        report += new Date(current.date).toLocaleDateString('pt-BR') + ' - ' + current.description + ': R$' + Number(current.value).toFixed(2) /*+ ' [' + current.id + ']+'*/ + '\n';
                    }
                }
    
    
                message += 'Entradas: R$' + entry.toFixed(2) + '\n';
                message += 'Saídas: R$' + saldo.toFixed(2) + '\n';
                message += 'Saldo total: R$' + String((entry - saldo).toFixed(2)) + '\n\n';
    
                message += '💳 Por forma de pagamento\n'
                message += '💳 Cartão: R$' + saldo_method['Cartão de Crédito'].toFixed(2) + '\n'
                message += '💠 Pix: R$' + saldo_method['Pix'].toFixed(2) + '\n'
                message += '🏦 Débito: R$' + saldo_method['Cartão de Débito'].toFixed(2) + '\n'
                message += '💵 Dinheiro: R$'+ saldo_method['Dinheiro'].toFixed(2) +'\n'
                message += '📜 Boleto: R$' + saldo_method['Boleto'].toFixed(2) + '\n'
                message += '↩️ Assinaturas: R$' + saldo_method['Assinatura'].toFixed(2)
    
                message += report;
    
            } else {
                message = 'Você ainda não registrou nenhum gasto! 📝'
            }
            return message;
}