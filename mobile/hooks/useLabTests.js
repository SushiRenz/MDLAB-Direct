import { useEffect, useState } from 'react';
import { servicesAPI } from '../services/api';

export const useLabTests = () => {
  const [categories, setCategories] = useState([]);
  const [testsByCategory, setTestsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCategoryName = (category) => {
    const categoryMap = {
      'hematology': 'Hematology',
      'serology_immunology': 'Serology / Immunology',
      'clinical_chemistry': 'Clinical Chemistry',
      'clinical_microscopy': 'Clinical Microscopy'
    };
    return categoryMap[category] || category;
  };

  const categorizeServices = (services) => {
    console.log('Categorizing services:', services);
    
    // Group services by their actual category field
    const categorized = {};

    services.forEach(service => {
      const category = service.category;
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(service);
    });

    console.log('Categorized services by API category:', categorized);
    return categorized;
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching all services to categorize...');
      const response = await servicesAPI.getServices();
      console.log('Services response:', response);
      
      if (response.success && response.data) {
        const categorized = categorizeServices(response.data);
        
        // Set categories (only those with tests) with formatted names
        const availableCategories = Object.keys(categorized).map(formatCategoryName);
        setCategories(availableCategories);
        
        // Set all tests by category with formatted keys
        const formattedTestsByCategory = {};
        Object.keys(categorized).forEach(category => {
          const formattedKey = formatCategoryName(category);
          formattedTestsByCategory[formattedKey] = categorized[category];
        });
        setTestsByCategory(formattedTestsByCategory);
        
        console.log('Available categories:', availableCategories);
        console.log('Tests by category set:', formattedTestsByCategory);
      } else {
        console.error('Failed to fetch services:', response);
        setError('Failed to fetch services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
      setError(err.message);
    }
  };

  const fetchTestsByCategory = async (categoryName) => {
    // Since we already have all tests categorized, just return them
    console.log(`Getting tests for category: ${categoryName}`);
    const tests = testsByCategory[categoryName] || [];
    console.log(`Tests for ${categoryName}:`, tests);
    return tests;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    categories,
    testsByCategory,
    loading,
    error,
    fetchTestsByCategory
  };
};