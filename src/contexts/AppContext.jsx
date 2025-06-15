import React, { createContext, useContext, useReducer, useEffect } from 'react';
import apiService from '../services/apiService';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  companies: [],
  quotations: [],
  lorryReceipts: [],
  loading: false,
  error: null,
};

// Action types
const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_USER: 'SET_USER',
  LOGOUT_USER: 'LOGOUT_USER',
  SET_COMPANIES: 'SET_COMPANIES',
  ADD_COMPANY: 'ADD_COMPANY',
  UPDATE_COMPANY: 'UPDATE_COMPANY',
  SET_QUOTATIONS: 'SET_QUOTATIONS',
  ADD_QUOTATION: 'ADD_QUOTATION',
  SET_LORRY_RECEIPTS: 'SET_LORRY_RECEIPTS',
  ADD_LORRY_RECEIPT: 'ADD_LORRY_RECEIPT',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case actionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case actionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    case actionTypes.SET_USER:
      return { 
        ...state, 
        user: action.payload, 
        isAuthenticated: !!action.payload,
        loading: false 
      };
    
    case actionTypes.LOGOUT_USER:
      return { 
        ...state, 
        user: null, 
        isAuthenticated: false,
        companies: [],
        quotations: [],
        lorryReceipts: []
      };
    
    case actionTypes.SET_COMPANIES:
      return { ...state, companies: action.payload, loading: false };
    
    case actionTypes.ADD_COMPANY:
      return { 
        ...state, 
        companies: [...state.companies, action.payload],
        loading: false 
      };
    
    case actionTypes.UPDATE_COMPANY:
      return {
        ...state,
        companies: state.companies.map(company =>
          company.id === action.payload.id ? { ...company, ...action.payload } : company
        ),
        loading: false
      };
    
    case actionTypes.SET_QUOTATIONS:
      return { ...state, quotations: action.payload, loading: false };
    
    case actionTypes.ADD_QUOTATION:
      return { 
        ...state, 
        quotations: [action.payload, ...state.quotations],
        loading: false 
      };
    
    case actionTypes.SET_LORRY_RECEIPTS:
      return { ...state, lorryReceipts: action.payload, loading: false };
    
    case actionTypes.ADD_LORRY_RECEIPT:
      return { 
        ...state, 
        lorryReceipts: [action.payload, ...state.lorryReceipts],
        loading: false 
      };
    
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => {
      dispatch({ type: actionTypes.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: actionTypes.SET_ERROR, payload: error });
    },

    clearError: () => {
      dispatch({ type: actionTypes.CLEAR_ERROR });
    },

    login: async (username, password) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const user = await apiService.authenticateUser(username, password);
        dispatch({ type: actionTypes.SET_USER, payload: user });
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    logout: () => {
      dispatch({ type: actionTypes.LOGOUT_USER });
      localStorage.removeItem('user');
    },

    loadCompanies: async () => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const companies = await apiService.getCompanies();
        dispatch({ type: actionTypes.SET_COMPANIES, payload: companies });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      }
    },

    createCompany: async (companyData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const result = await apiService.createCompany(companyData);
        const newCompany = { id: result.lastInsertRowid, ...companyData };
        dispatch({ type: actionTypes.ADD_COMPANY, payload: newCompany });
        return newCompany;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    updateCompany: async (id, companyData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        await apiService.updateCompany(id, companyData);
        dispatch({ type: actionTypes.UPDATE_COMPANY, payload: { id, ...companyData } });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    loadQuotations: async (filters = {}) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const quotations = await apiService.getQuotations(filters);
        dispatch({ type: actionTypes.SET_QUOTATIONS, payload: quotations });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      }
    },

    createQuotation: async (quotationData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const result = await apiService.createQuotation(quotationData);
        const newQuotation = { id: result.lastInsertRowid, ...quotationData };
        dispatch({ type: actionTypes.ADD_QUOTATION, payload: newQuotation });
        return newQuotation;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },

    loadLorryReceipts: async (filters = {}) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const lorryReceipts = await apiService.getLorryReceipts(filters);
        dispatch({ type: actionTypes.SET_LORRY_RECEIPTS, payload: lorryReceipts });
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
      }
    },

    createLorryReceipt: async (lrData) => {
      try {
        dispatch({ type: actionTypes.SET_LOADING, payload: true });
        const result = await apiService.createLorryReceipt(lrData);
        const newLorryReceipt = { id: result.lastInsertRowid, ...lrData };
        dispatch({ type: actionTypes.ADD_LORRY_RECEIPT, payload: newLorryReceipt });
        return newLorryReceipt;
      } catch (error) {
        dispatch({ type: actionTypes.SET_ERROR, payload: error.message });
        throw error;
      }
    },
  };

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        dispatch({ type: actionTypes.SET_USER, payload: user });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
