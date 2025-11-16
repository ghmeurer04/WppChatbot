import {find, get_request,capitalizeFirstLetter} from './database.mjs';

const string_categories = "['Moradia','Alimentação','Lazer','Saúde','Transporte','Educação','Investimentos','Compras','Outros']";
const method_categories = "['Dinheiro','Cartão de Crédito','Cartão de Débito','Pix','Boleto']";

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

export function get_message_welcome(name){
    return 'Parabéns por esse passo, ' + name + '! Agora você tem uma ferramenta que te dá controle, segurança e\
poder sobre o seu dinheiro. Esse é o começo do seu equilíbrio financeiro, construído com\
calma e confiança.\n\n\
📌 MODO DE USAR\n\
É simples: sempre que tiver um gasto, me envie assim ⬇\n\
🏷 DESCRIÇÃO + 💰 VALOR + 💳 FORMA DE PAGAMENTO\n\
Exemplos:\n\
🛒 Mercado 237,88 cartão de crédito\n\
💊 Farmácia 65,55 Pix\n\
🍽 Almoço 47,50 dinheiro\n\
🎤 Também pode mandar em áudio e imagem do mesmo jeitinho que eu registro pra você 😉\n\n\
Para acessar o menu a quaolquer momento, é só digitar "menu" ou "3".'
};

export function get_message_menu(name){
    return '✨ Oi, ' + name + '! Aqui estão as opções rápidas pra você:\n\n\
\
📊 *Relatório de gastos*\n\
Digite 1 ou relatório e veja pra onde seu dinheiro foi.\n\n\
\
📝 *Novo gasto*\n\
Escreva: descrição valor forma\n\
➡️ Exemplo: mercado 150 pix\n\n\
\
🔁 *Assinaturas/recorrentes*\n\
Escreva: assinatura descrição valor\n\
➡️ Exemplo: assinatura Netflix 39.90\n\n\
\
💡 Dica: pode mandar áudio ou foto e a IA registra automaticamente.\n\n\
\
💬 A qualquer momento, digite *menu* para voltar aqui.\n\n\
\
Simples, rápido e feito pra você 💕'

    /*return 'Olá ' + name + ', aqui estão as opções disponíveis para você:\n\n\
🔢 [1] – Gerar o relatório de gastos atuais 📈\n\n\
Veja de forma clara onde seu dinheiro está indo!\n\
Digite "relatório" ou "1" para receber um resumo completo dos seus gastos.\n\n\
📝 Para registrar seus gastos, siga este exemplo:\n\n\
[descrição] [valor] [método de pagamento]\n\n\
Exemplo: mercado 150 pix\n\n\
É simples e direto! 💡\n\
Além disso, podemos registrar seus gastos através de áudio e imagens, basta enviar aqui no chat e nossa IA fará o registro automaticamente!!\n\n\
Para cadastrar um gasto recorrente ou uma assinatura, envie:\n\
assinatura [descrição] [valor]\n\n\
Exemplo: assinatura Netflix 39.90\n\n\
Esses gastos serão registrados e adicionados ao seu relatório mensal automaticamente!\n\n\
📅 [4] – Consultar vencimento do seu plano 💡\n\
Fique em dia e continue aproveitando todos os recursos da plataforma!\n\n\
💬 Para ver o menu a qualquer momento, digite "menu" ou apenas "3"!\n\
Estamos aqui pra te ajudar a dominar suas finanças! 💪'*/
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

export function get_message_removal(id){
    return 'Seu gasto ' + id[0] + ' foi removido! 🤝'
}

export function get_message_removal_fail(id){
    return 'Não foi possível encontrar o gasto ' + id[0] + '! 💰'
}

export function get_message_help(name){
    return 'Peço desculpas ' + name + ', mas não consegui identificar a mensagem.\n\n📲 Digite "menu" ou "3" para ver todas as opções disponíveis!\n\
📋 Quer saber o que você pode fazer por aqui?\n\
É só mandar um menu ou o número 3 que a mágica acontece! ✨\n\
Simples, rápido e direto ao ponto! 💬✅'
}

export function get_message_failed_payment(name){
    return '⚠️ Opa, ' + name + '! Parece que alguns valores não estão corretos ou estão incompletos.\n\
Pode conferir e enviar novamente, por favor? 🙏\n\n\
Exemplo de como enviar:\n\
mercado 150 pix\n\n\
Assim eu consigo organizar direitinho sua fatura. 😉';
}

export function get_message_entry(valor,new_id){
    return '🔥 Show! Acabei de registrar a entrada/salário!\n\n\
💵 Valor: ' + valor + '\n\
📁 #ID: ' + new_id + '\n\n\
💰 Bora continuar? Digite 1 pra ver o resumo ou menu pra explorar!\n\
❌ Se mandou errado, relaxa: use o ID pra remover 😉'
}

export function get_message_signature(descricao,valor,new_id){
    return '🔥 Show! Acabei de registrar sua assinatura!\n\n\
📌 Descrição: ' + descricao + '\n\
💵 Valor: ' + valor + '\n\
📁 #ID: ' + new_id + '\n\n\
💰 Bora continuar? Digite 1 pra ver o resumo ou menu pra explorar!\n\
❌ Se mandou errado, relaxa: use o ID pra remover 😉'
}

export function get_message_payment(result,new_id, name){
    const variant = getRandomInt(1,7);
    switch (variant){
        case 1:
            return '🔥 Show, ' + name + '! Acabei de guardar esse gasto na sua lista!\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
💰 Bora continuar? Digite 1 pra ver o resumo ou menu pra explorar!\n\
❌ Se mandou errado, relaxa: use o ID pra remover 😉'
        case 2:
            return '✅ ' + name + ', registro concluído com sucesso.\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
💰 Para continuar sua gestão financeira:\n\
    ● Digite 1 para visualizar o resumo\n\
    ● Digite menu para mais opções\n\n\
❌ Caso queira corrigir, remova pelo ID informado.'
        case 3:
            return '🎉 ' + name + ', registro feito com sucesso!\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
💰 Tudo salvo direitinho.\n\
👉 Digite 1 para ver o resumo ou menu para explorar opções.\n\
❌ Se pintou erro, é só remover pelo ID 😉'
        case 4:
            return '✅ Gasto anotado com sucesso, ' + name + ' 🚀\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
📊 Quer ver como está indo? Use 1 para o resumo ou menu para mais comandos.\n\
❌ Errou algo? Sem drama, é só apagar pelo ID.'
        case 5:
            return '✨ Pronto, ' + name + '! Seu gasto foi registrado. Organização em dia 😉\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
💰 Continue acompanhando suas finanças: digite 1 para resumo ou menu para mais opções.\n\
❌ Se errou, basta remover pelo ID.'
        case 6:
            return '📌 Registro confirmado, ' + name + '! Mais um passo para manter tudo sob controle 💼\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
👉 Digite 1 para ver o resumo.\n\
👉 Digite menu para mais opções.\n\
❌ Quer corrigir? Use o ID e pronto!'
        case 7:
            return '👏 ' + name + ', gasto salvo com sucesso! Boa disciplina financeira 💪\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
🚀 Digite 1 para conferir o resumo ou menu para explorar.\n\
❌ Se rolou erro, é só remover com o ID.'
        default:
            return '✨ Pronto, ' + name + '! Seu gasto foi registrado. Organização em dia 😉\n\n\
📌 Descrição: ' + result.descricao + '\n\
💵 Valor: ' + result.valor + '\n\
💳 Método: ' + result.metodo + '\n\
🏷️ Categoria: ' + result.categoria + '\n\
📁 #ID: ' + new_id + '\n\n\
💰 Continue acompanhando suas finanças: digite 1 para resumo ou menu para mais opções.\n\
❌ Se errou, basta remover pelo ID.'
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
Se não for possível identificar descricao, metodo ou valor ou se a frase não for compativel com esse pedido, retorne apenas a frase original. Caso seja possivel a identificação, retorne apenas o descricao, método de pagamento, numero de parcelas, o valor de cada parcela, com ponto decimal '.' e categoria, baseado na descrição identificada, sem explicações adicionais, em um json de 5 chaves descricao, valor, metodo, parcela e categoria.\
\
Categorias disponíveis: " + string_categories + "\n\
Metodos disponíveis: " + method_categories + "\n\n\
\
Frase: " + message;
}

export function get_prompt_media(){
    return "Identifique descricao, metodo de pagamento, numero de parcelas e valor de cada parcela presentes no anexo a seguir.\
\
Se não for possível identificar ou se o anexo não for compativel com esse pedido, retorne apenas a frase 'erro'. Caso seja possivel a identificação, retorne apenas o descricao, método de pagamento, numero de parcelas, valor de cada parcela e categoria, baseado na descrição identificada, sem explicações adicionais, em um json de 4 chaves descricao, parcela, valor, metodo e categoria.\
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
    return "Classifique a seguinte mensagem em uma das categorias: registro de gasto, registro de assinatura ou lembrete. Se não identificar, retorne a mensagem 'erro'. Retorne apenas a categoria identificada em letras minusculas, sem explicações adicionais. Mensagem: " + message;
}

export function get_prompt_reminder(message){
    return "Considerando que agora é " + new Date() + ". Identifique a descricao e a data/hora descritos na frase a seguir. Retorne um json contendo tres chaves, uma de descricao, chamada descricao, uma de data no formato mm/dd/yyyy, chamada data, e outra de hora no formato hh:mm, chamada hora.\
Frase: " + message;
}


export async function get_report_message(input_msg, number){
            var start = new Date();
            var end = new Date();
            var message = '';
            if(!(input_msg == '1' || input_msg == 'relatório' || input_msg == 'relatorio' || input_msg == 'saldo' || input_msg == 'fatura')){
                message += '🧾 Fatura: \n';
                const response = await get_request(get_prompt_report(start,input_msg));
                if(!(response == input_msg)){
                    var json = JSON.parse(response.match(/{[\s\S]*\}/)[0]);
                    start = new Date(json.inicio);
                    end = new Date(json.fim);
                } else {
                    start = new Date((start.getMonth()+1) + '/01/' + start.getFullYear())
                }
            } else {
                message += '🧾 Fatura ' + await capitalizeFirstLetter(start.toLocaleString('default', { month: 'long' })) + '/' + start.getFullYear() + '\n';
                start = new Date((start.getMonth()+1) + '/01/' + start.getFullYear())
            }
            start.setUTCHours(0,0,0,1)
            end.setUTCHours(23,59,59,999)
            start = new Date(start.setHours(start.getHours() + 3));
            end = new Date(end.setHours(end.getHours() + 3));
            var documents = await find('report',{$and:[{"phone_number":{$eq:number}},{"method":{$ne:"Assinatura"}},{"date":{$gt:start.getTime()}},{"date":{$lt:end.getTime()}}]});
            var signatures = await find('report',{$and:[{"phone_number":{$eq:number}},{"method":{$eq:"Assinatura"}}]});
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
                    report += '\n-------------------------------------------\n   *·* ' + list_categories[i] + ': \n'
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