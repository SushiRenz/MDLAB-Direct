import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useLabTests } from '../hooks/useLabTests';

const LabTestModal = ({ visible, onClose, onConfirm }) => {
  const { categories, testsByCategory, loading, error } = useLabTests();
  const [expandedCategories, setExpandedCategories] = useState({});
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedTests([]);
      setSearchTerm('');
      setExpandedCategories({});
    }
  }, [visible]);

  // Handle category expansion
  const toggleCategory = async (categoryName) => {
    console.log(`🔄 Toggling category: ${categoryName}`);
    
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  // Handle test selection
  const toggleTestSelection = (test) => {
    console.log(`🔄 Toggling test selection:`, test);
    
    setSelectedTests(prev => {
      const isSelected = prev.some(selectedTest => selectedTest._id === test._id);
      
      if (isSelected) {
        // Remove test
        return prev.filter(selectedTest => selectedTest._id !== test._id);
      } else {
        // Add test
        return [...prev, test];
      }
    });
  };

  // Calculate total price
  const totalPrice = selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedTests.length === 0) {
      Alert.alert('No Tests Selected', 'Please select at least one test before confirming.');
      return;
    }

    console.log('✅ Confirming selected tests:', selectedTests);
    console.log('💰 Total price:', totalPrice);
    
    onConfirm({
      tests: selectedTests,
      totalPrice: totalPrice,
      testIds: selectedTests.map(test => test._id)
    });
    
    onClose();
  };

  // Filter tests based on search term
  const filterTests = (testsArray) => {
    if (!searchTerm.trim()) return testsArray;
    
    return testsArray.filter(test => 
      test.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Render category item
  const renderCategory = ({ item: categoryName }) => {
    const isExpanded = expandedCategories[categoryName];
    const categoryTests = testsByCategory[categoryName] || [];
    const filteredTests = filterTests(categoryTests);
    const allCategorySelected = categoryTests.length > 0 && categoryTests.every(test => 
      selectedTests.some(selectedTest => selectedTest._id === test._id)
    );

    const handleSelectAllCategory = () => {
      if (allCategorySelected) {
        // Deselect all tests in this category
        setSelectedTests(prev => prev.filter(selectedTest => 
          !categoryTests.some(test => test._id === selectedTest._id)
        ));
      } else {
        // Select all tests in this category
        const newTests = categoryTests.filter(test =>
          !selectedTests.some(selectedTest => selectedTest._id === test._id)
        );
        setSelectedTests(prev => [...prev, ...newTests]);
      }
    };

    return (
      <View style={styles.categoryContainer}>
        <View style={styles.categoryHeader}>
          <Pressable 
            style={styles.categoryHeaderLeft}
            onPress={() => toggleCategory(categoryName)}
          >
            <Ionicons 
              name={isExpanded ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color="#1A202C"
              style={styles.categoryIcon}
            />
            <Text style={styles.categoryTitle}>
              {categoryName} ({categoryTests.length})
            </Text>
          </Pressable>
          
          <Pressable 
            style={styles.categorySelectAll}
            onPress={handleSelectAllCategory}
          >
            <View style={[styles.checkbox, allCategorySelected && styles.checkboxSelected]}>
              {allCategorySelected && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.categorySelectAllText}>Select All</Text>
          </Pressable>
        </View>

        {isExpanded && (
          <View style={styles.testsContainer}>
            {filteredTests.length === 0 ? (
              <Text style={styles.noTestsText}>
                {searchTerm ? 'No tests match your search' : 'No tests available'}
              </Text>
            ) : (
              <View style={styles.testsGrid}>
                {filteredTests.map(test => renderTest(test))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render test item
  const renderTest = (test) => {
    const isSelected = selectedTests.some(selectedTest => selectedTest._id === test._id);

    return (
      <Pressable
        key={test._id}
        style={[styles.testCard, isSelected && styles.testCardSelected]}
        onPress={() => toggleTestSelection(test)}
      >
        <View style={[styles.testCheckbox, isSelected && styles.testCheckboxSelected]}>
          {isSelected && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </View>
        
        <View style={styles.testInfo}>
          <Text style={styles.testName}>
            {test.serviceName || test.name}
          </Text>
          <Text style={styles.testPrice}>
            ₱{(test.price || 0).toFixed(2)}
          </Text>
          {test.preparationInstructions && (
            <Text style={styles.testPreparation}>
              {test.preparationInstructions}
            </Text>
          )}
          {test.duration && (
            <Text style={styles.testDuration}>
              Duration: {test.duration}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Laboratory Tests</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#1A202C" />
          </Pressable>
        </View>

        {/* Search Bar and Select All Button */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#718096" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for tests..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor="#718096"
            />
          </View>
          <Pressable 
            style={styles.selectAllButton}
            onPress={() => {
              if (selectedTests.length > 0) {
                setSelectedTests([]);
              } else {
                // Select all tests from all categories
                const allTests = Object.values(testsByCategory).flat();
                setSelectedTests(allTests);
              }
            }}
          >
            <Ionicons 
              name={selectedTests.length > 0 ? "checkmark-circle" : "checkbox-outline"} 
              size={18} 
              color="#FFFFFF" 
            />
            <Text style={styles.selectAllButtonText}>
              {selectedTests.length > 0 ? 'Deselect All' : 'Select All Tests'}
            </Text>
          </Pressable>
        </View>

        {/* Selected Tests Summary */}
        {selectedTests.length > 0 && (
          <View style={styles.selectedSummary}>
            <Text style={styles.summaryTitle}>
              Selected Tests ({selectedTests.length})
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {selectedTests.map(test => (
                <View key={test._id} style={styles.selectedTestItem}>
                  <Text style={styles.selectedTestName}>
                    {test.serviceName || test.name}
                  </Text>
                  <Text style={styles.selectedTestPrice}>
                    ₱{(test.price || 0).toFixed(2)}
                  </Text>
                  <Pressable 
                    onPress={() => toggleTestSelection(test)}
                    style={styles.removeButton}
                  >
                    <Ionicons name="close-circle" size={16} color="#E53E3E" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
            <Text style={styles.totalPrice}>
              Total: ₱{totalPrice.toFixed(2)}
            </Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#21AEA8" />
              <Text style={styles.loadingText}>Loading tests...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {error}</Text>
              <Pressable style={styles.retryButton} onPress={() => window.location.reload()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </Pressable>
            </View>
          ) : (
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={renderCategory}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
          <Pressable 
            style={[
              styles.confirmButton, 
              selectedTests.length === 0 && styles.confirmButtonDisabled
            ]} 
            onPress={handleConfirm}
            disabled={selectedTests.length === 0}
          >
            <Text style={[
              styles.confirmButtonText,
              selectedTests.length === 0 && styles.confirmButtonTextDisabled
            ]}>
              Confirm Selection ({selectedTests.length} tests)
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A202C',
  },
  closeButton: {
    padding: 4,
  },
  searchSection: {
    marginHorizontal: 20,
    marginVertical: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#21AEA8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  selectAllButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  selectedSummary: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#21AEA8',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
  },
  selectedTestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  selectedTestName: {
    fontSize: 12,
    color: '#1A202C',
    marginRight: 4,
  },
  selectedTestPrice: {
    fontSize: 12,
    color: '#21AEA8',
    fontWeight: '600',
    marginRight: 4,
  },
  removeButton: {
    padding: 2,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#21AEA8',
    textAlign: 'right',
    marginTop: 8,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#4A5568',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#E53E3E',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#21AEA8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  categorySelectAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categorySelectAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4A5568',
  },
  testsContainer: {
    marginTop: 8,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noTestsText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    padding: 20,
  },
  testCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    minHeight: 140,
  },
  testCardSelected: {
    borderColor: '#21AEA8',
    borderWidth: 2,
    backgroundColor: '#F0F9FF',
  },
  testCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  testCheckboxSelected: {
    backgroundColor: '#21AEA8',
    borderColor: '#21AEA8',
  },
  testInfo: {
    flex: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#21AEA8',
    borderColor: '#21AEA8',
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 6,
    lineHeight: 18,
  },
  testPrice: {
    fontSize: 16,
    color: '#21AEA8',
    fontWeight: '700',
    marginBottom: 8,
  },
  testPreparation: {
    fontSize: 11,
    color: '#4A5568',
    lineHeight: 15,
    marginBottom: 4,
  },
  testDuration: {
    fontSize: 11,
    color: '#718096',
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#4A5568',
    fontWeight: '500',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#21AEA8',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  confirmButtonTextDisabled: {
    color: '#A0AEC0',
  },
});

export default LabTestModal;