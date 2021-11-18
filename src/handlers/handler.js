const axios = require('axios');
const { incrementCounter, getCurrentCounter } = require('./db');
const API_TELEGRAM = `https://api.telegram.org/bot${process.env.TOKEN}`;

const callTelegramApi = async (method, body) => {
  const url = `${API_TELEGRAM}/${method}`;
  return axios.post(url, body);
};

const createKeyboardRequest = () => ({
  keyboard: [
    [{ text: '+1 ✨' }, { text: 'Mostra contatore'}],
  ],
});

const startBotMessage = async (chatId, counter = 0) => 
  callTelegramApi(
    'sendMessage', 
    { 
      chat_id: chatId,
      reply_markup: createKeyboardRequest(),
      text: `Benvenuto. Se senti qualcuno dire che "è più pulito" incrementa il contatore.\nTotale: ${counter}`,
    });

const sendCounterMessage = async (chatId, counter = 0) =>
  callTelegramApi(
    'sendMessage',
    {
      chat_id: chatId,
      reply_markup: createKeyboardRequest(),
      text: `Totale ${counter}`,
    });

exports.index = async (event) => {
  const body = JSON.parse(event.body);
  console.log('event', JSON.stringify(body));

  try {
    if (body.message.text === '/start') {
      const numCounter = await getCurrentCounter();
      const response = await startBotMessage(body.message.chat.id, numCounter);
      if (!response.data.ok) {
        const errorMsg = `Errore invio messaggio di benvenuto a ${body.message.from.username} (${body.message.from.id})`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    if (body.message.text === '+1 ✨') {
      const numCounter = await incrementCounter();
      const response = await sendCounterMessage(body.message.chat.id, numCounter);
      if (!response.data.ok) {
        const errorMsg = `Errore +1 a ${body.message.from.username} (${body.message.from.id})`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    }

    if (body.message.text === 'Mostra contatore') {
      const numCounter = await getCurrentCounter();
      const response = await sendCounterMessage(body.message.chat.id, numCounter);
      if (!response.data.ok) {
        const errorMsg = `Errore Show Counter a ${body.message.from.username} (${body.message.from.id})`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
    }
  } catch (error) {
    console.error(error.response.data);
    return { statusCode: 400 };
  }

  return { statusCode: 200 };
};
