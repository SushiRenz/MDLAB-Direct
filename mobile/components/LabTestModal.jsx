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

    return (
      <View style={styles.categoryContainer}>
        <Pressable 
          style={styles.categoryHeader}
          onPress={() => toggleCategory(categoryName)}
        >
          <View style={styles.categoryHeaderContent}>
            <Ionicons 
              name={isExpanded ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color="#1A202C"
              style={styles.categoryIcon}
            />
            <Text style={styles.categoryTitle}>
              {categoryName} ({categoryTests.length})
            </Text>
          </View>
        </Pressable>

        {isExpanded && (
          <View style={styles.testsContainer}>
            {filteredTests.length === 0 ? (
              <Text style={styles.noTestsText}>
                {searchTerm ? 'No tests match your search' : 'No tests available'}
              </Text>
            ) : (
              filteredTests.map(test => renderTest(test))
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
        style={[styles.testItem, isSelected && styles.testItemSelected]}
        onPress={() => toggleTestSelection(test)}
      >
        <View style={styles.testContent}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && (
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            )}
          </View>
          
          <View style={styles.testDetails}>
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

        {/* Search Bar */}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
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
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  testsContainer: {
    marginTop: 8,
  },
  noTestsText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    padding: 20,
  },
  testItem: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  testItemSelected: {
    borderColor: '#21AEA8',
    backgroundColor: '#F0F9FF',
  },
  testContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#21AEA8',
    borderColor: '#21AEA8',
  },
  testDetails: {
    flex: 1,
  },
  testName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A202C',
    marginBottom: 4,
  },
  testPrice: {
    fontSize: 14,
    color: '#21AEA8',
    fontWeight: '600',
    marginBottom: 4,
  },
  testPreparation: {
    fontSize: 12,
    color: '#4A5568',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  testDuration: {
    fontSize: 12,
    color: '#718096',
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