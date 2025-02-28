// pages/api/transactions/process.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface TransactionData {
  city: string;
  date: string;
  sector: string;
  ktCO2: number;
  account: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { city, date, sector, ktCO2, account }: TransactionData = req.body;
      
      // Validate input
      if (!city || !date || !sector || !ktCO2 || !account) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Missing required fields' 
        });
      }

      // Process transaction
      // Add your blockchain transaction logic here

      res.status(200).json({
        status: 'success',
        message: 'Transaction processed',
        data: { city, date, sector, ktCO2 }
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}