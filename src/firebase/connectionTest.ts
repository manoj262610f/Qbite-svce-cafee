import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './config';

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // permission-denied on /test/connection is normal since default deny rule applies
    return true;
  }
}
