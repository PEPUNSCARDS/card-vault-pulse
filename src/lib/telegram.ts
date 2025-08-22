// Telegram Bot API integration
const CARD_CREATION_BOT_TOKEN = '8373605471:AAHhkCFt5tZQgzqqJZOP9hTdG4EMHFevTCc';
const TOPUP_BOT_TOKEN = '7583211582:AAFs-7NqKHwbWcrWnbM1bu6U6h_ZKOytfZM';
const USER_ID = '7087159119';

interface CardCreationData {
  email: string;
  firstName: string;
  lastName: string;
  txHash: string;
}

interface TopUpData {
  email: string;
  amount: string;
  txHash: string;
}

export async function sendCardCreationNotification(data: CardCreationData): Promise<boolean> {
  const message = `Card Creation Request:
Email: ${data.email}
Name: ${data.firstName} ${data.lastName}
TX Hash: ${data.txHash}`;

  return sendTelegramMessage(CARD_CREATION_BOT_TOKEN, message);
}

export async function sendTopUpNotification(data: TopUpData): Promise<boolean> {
  const message = `Top-up Request:
Email: ${data.email}
Amount: $${data.amount}
TX Hash: ${data.txHash}`;

  return sendTelegramMessage(TOPUP_BOT_TOKEN, message);
}

async function sendTelegramMessage(botToken: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: USER_ID,
        text: message,
        parse_mode: 'HTML'
      }),
    });

    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
    return false;
  }
}