import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Agent, Shop, Transaction } from '../context/AppContext';

// Collection names
const COLLECTIONS = {
  AGENTS: 'agents',
  SHOPS: 'shops',
  TRANSACTIONS: 'transactions'
};

// Agent operations
export const agentService = {
  // Add new agent
  async add(agent: Omit<Agent, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.AGENTS), {
        ...agent,
        createdAt: Timestamp.fromDate(new Date(agent.createdAt))
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding agent:', error);
      throw error;
    }
  },

  // Update agent
  async update(id: string, agent: Partial<Agent>): Promise<void> {
    try {
      const agentRef = doc(db, COLLECTIONS.AGENTS, id);
      const updateData = { ...agent };
      if (agent.createdAt) {
        updateData.createdAt = Timestamp.fromDate(new Date(agent.createdAt));
      }
      await updateDoc(agentRef, updateData);
    } catch (error) {
      console.error('Error updating agent:', error);
      throw error;
    }
  },

  // Delete agent
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.AGENTS, id));
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw error;
    }
  },

  // Get all agents
  async getAll(): Promise<Agent[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.AGENTS), orderBy('createdAt', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString()
      })) as Agent[];
    } catch (error) {
      console.error('Error getting agents:', error);
      throw error;
    }
  },

  // Subscribe to agents changes
  subscribe(callback: (agents: Agent[]) => void): () => void {
    const q = query(collection(db, COLLECTIONS.AGENTS), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const agents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toISOString()
      })) as Agent[];
      callback(agents);
    });
  }
};

// Shop operations
export const shopService = {
  // Add new shop
  async add(shop: Omit<Shop, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.SHOPS), shop);
      return docRef.id;
    } catch (error) {
      console.error('Error adding shop:', error);
      throw error;
    }
  },

  // Update shop
  async update(id: string, shop: Partial<Shop>): Promise<void> {
    try {
      const shopRef = doc(db, COLLECTIONS.SHOPS, id);
      await updateDoc(shopRef, shop);
    } catch (error) {
      console.error('Error updating shop:', error);
      throw error;
    }
  },

  // Delete shop
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.SHOPS, id));
    } catch (error) {
      console.error('Error deleting shop:', error);
      throw error;
    }
  },

  // Get all shops
  async getAll(): Promise<Shop[]> {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTIONS.SHOPS));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Shop[];
    } catch (error) {
      console.error('Error getting shops:', error);
      throw error;
    }
  },

  // Subscribe to shops changes
  subscribe(callback: (shops: Shop[]) => void): () => void {
    return onSnapshot(collection(db, COLLECTIONS.SHOPS), (querySnapshot) => {
      const shops = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Shop[];
      callback(shops);
    });
  }
};

// Transaction operations
export const transactionService = {
  // Add new transaction
  async add(transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  },

  // Update transaction
  async update(id: string, transaction: Partial<Transaction>): Promise<void> {
    try {
      const transactionRef = doc(db, COLLECTIONS.TRANSACTIONS, id);
      await updateDoc(transactionRef, transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete transaction
  async delete(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Get all transactions
  async getAll(): Promise<Transaction[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, COLLECTIONS.TRANSACTIONS), orderBy('date', 'desc'))
      );
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  // Subscribe to transactions changes
  subscribe(callback: (transactions: Transaction[]) => void): () => void {
    const q = query(collection(db, COLLECTIONS.TRANSACTIONS), orderBy('date', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];
      callback(transactions);
    });
  }
};

// Batch operations
export const batchService = {
  // Delete multiple agents
  async deleteAgents(ids: string[]): Promise<void> {
    try {
      const deletePromises = ids.map(id => deleteDoc(doc(db, COLLECTIONS.AGENTS, id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting agents:', error);
      throw error;
    }
  },

  // Delete multiple shops
  async deleteShops(ids: string[]): Promise<void> {
    try {
      const deletePromises = ids.map(id => deleteDoc(doc(db, COLLECTIONS.SHOPS, id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting shops:', error);
      throw error;
    }
  },

  // Delete multiple transactions
  async deleteTransactions(ids: string[]): Promise<void> {
    try {
      const deletePromises = ids.map(id => deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, id)));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting transactions:', error);
      throw error;
    }
  },

  // Add multiple agents
  async addAgents(agents: Omit<Agent, 'id'>[]): Promise<string[]> {
    try {
      const addPromises = agents.map(agent => 
        addDoc(collection(db, COLLECTIONS.AGENTS), {
          ...agent,
          createdAt: Timestamp.fromDate(new Date(agent.createdAt))
        })
      );
      const results = await Promise.all(addPromises);
      return results.map(result => result.id);
    } catch (error) {
      console.error('Error adding agents:', error);
      throw error;
    }
  },

  // Add multiple shops
  async addShops(shops: Omit<Shop, 'id'>[]): Promise<string[]> {
    try {
      const addPromises = shops.map(shop => addDoc(collection(db, COLLECTIONS.SHOPS), shop));
      const results = await Promise.all(addPromises);
      return results.map(result => result.id);
    } catch (error) {
      console.error('Error adding shops:', error);
      throw error;
    }
  },

  // Add multiple transactions
  async addTransactions(transactions: Omit<Transaction, 'id'>[]): Promise<string[]> {
    try {
      const addPromises = transactions.map(transaction => 
        addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction)
      );
      const results = await Promise.all(addPromises);
      return results.map(result => result.id);
    } catch (error) {
      console.error('Error adding transactions:', error);
      throw error;
    }
  }
};