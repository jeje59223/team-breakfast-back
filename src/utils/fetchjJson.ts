import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.MONGODB_API_KEY as string;

const headers = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
  apiKey: apiKey as string,
};

export async function fetchJson(url: string, method: string, body: object): Promise<any> {
  const response = await fetch(url, {
    method,
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Erreur HTTP : ${response.status} - ${response.statusText}`);
  }

  return response.json();
}
