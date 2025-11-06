import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Service {
  _id: string;
  serviceName: string;
  price: number;
  category: string;
  description?: string;
  preparationInstructions?: string;
  duration?: string;
  isActive: boolean;
}

interface TestSelectionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: (selectedTests: Service[]) => void;
  availableServices: Service[];
  isLoading?: boolean;
}

export default function TestSelectionModal({
  isVisible,
  onClose,
  onConfirm,
  availableServices = [],
  isLoading = false,
}: TestSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTests, setSelectedTests] = useState<Service[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    clinical_chemistry: false,
    hematology: false,
    clinical_microscopy: false,
    serology_immunology: false,
    other: false
  });

  // Debug logging
  console.log('🧪 Modal render - isVisible:', isVisible);
  console.log('🧪 Modal render - availableServices length:', availableServices.length);
  console.log('🧪 Modal render - isLoading:', isLoading);
  console.log('🧪 Modal render - services sample:', availableServices.slice(0, 2));

  // Category display names (exactly matching frontend)
  const categoryDisplayNames = {
    clinical_chemistry: 'Clinical Chemistry',
    hematology: 'Hematology', 
    clinical_microscopy: 'Clinical Microscopy',
    serology_immunology: 'Serology / Immunology',
    other: 'Other Tests'
  };

  // Reset when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedTests([]);
      setSearchTerm('');
    }
  }, [isVisible]);

  // Filter and group services (exactly like frontend)
  const groupedServices = useMemo(() => {
    console.log('🔍 useMemo groupedServices - Starting with services:', availableServices?.length || 0);
    
    if (!availableServices || availableServices.length === 0) {
      console.log('🔍 useMemo groupedServices - No services, returning empty');
      return {};
    }

    console.log('🔍 useMemo groupedServices - First service:', availableServices[0]);
    console.log('🔍 useMemo groupedServices - Search term:', searchTerm);

    const filtered = availableServices.filter(service => {
      const isActive = service.isActive;
      const matchesSearch = service.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
      console.log(`🔍 Service "${service.serviceName}": isActive=${isActive}, matchesSearch=${matchesSearch}`);
      return isActive && matchesSearch;
    });

    console.log('🔍 useMemo groupedServices - Filtered count:', filtered.length);
    console.log('🔍 useMemo groupedServices - Filtered services:', filtered.map(s => s.serviceName));

    const grouped = filtered.reduce((groups: {[key: string]: Service[]}, service) => {
      const category = service.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
      return groups;
    }, {});

    console.log('🔍 useMemo groupedServices - Final categories:', Object.keys(grouped));
    console.log('🔍 useMemo groupedServices - Category counts:', Object.entries(grouped).map(([cat, services]) => `${cat}: ${services.length}`));
    
    return grouped;
  }, [availableServices, searchTerm]);

  // Handle test selection
  const handleTestSelection = (service: Service, isChecked: boolean) => {
    if (isChecked) {
      setSelectedTests(prev => [...prev, service]);
    } else {
      setSelectedTests(prev => prev.filter(test => test._id !== service._id));
    }
  };

  // Handle category expansion (like frontend)
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Calculate total price
  const totalPrice = selectedTests.reduce((sum, test) => sum + test.price, 0);

  // Handle confirmation
  const handleConfirm = () => {
    if (selectedTests.length > 0) {
      onConfirm(selectedTests);
      onClose();
    } else {
      Alert.alert('No Tests Selected', 'Please select at least one test.');
    }
  };

  // Remove selected test
  const removeSelectedTest = (testId: string) => {
    setSelectedTests(prev => prev.filter(test => test._id !== testId));
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>Select Laboratory Tests</ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#1A202C" />
            </TouchableOpacity>
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
            <View style={styles.selectedTestsSummary}>
              <ThemedText style={styles.summaryTitle}>
                Selected Tests ({selectedTests.length})
              </ThemedText>
              <ScrollView style={styles.selectedTestsList} horizontal showsHorizontalScrollIndicator={false}>
                {selectedTests.map(test => (
                  <View key={test._id} style={styles.selectedTestItem}>
                    <ThemedText style={styles.selectedTestName}>{test.serviceName}</ThemedText>
                    <ThemedText style={styles.selectedTestPrice}>₱{test.price.toFixed(2)}</ThemedText>
                    <TouchableOpacity 
                      onPress={() => removeSelectedTest(test._id)}
                      style={styles.removeTestButton}
                    >
                      <Ionicons name="close-circle" size={16} color="#E53E3E" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.totalPriceContainer}>
                <ThemedText style={styles.totalPrice}>
                  Total: ₱{totalPrice.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          )}

          {/* Test Categories */}
          <ScrollView style={styles.categoriesContainer} showsVerticalScrollIndicator={false}>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ThemedText style={styles.loadingText}>Loading available tests...</ThemedText>
              </View>
            ) : !availableServices || availableServices.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No tests available</ThemedText>
                <ThemedText style={styles.emptySubText}>Please check your internet connection</ThemedText>
              </View>
            ) : Object.entries(groupedServices).length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No tests match your search</ThemedText>
                <ThemedText style={styles.emptySubText}>Try adjusting your search term</ThemedText>
              </View>
            ) : (
              Object.entries(groupedServices).map(([category, services]) => (
                <View key={category} style={styles.categorySection}>
                  <TouchableOpacity 
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <View style={styles.categoryHeaderContent}>
                      <Ionicons 
                        name={expandedCategories[category] ? "chevron-down" : "chevron-forward"} 
                        size={20} 
                        color="#1A202C" 
                        style={styles.categoryToggle}
                      />
                      <ThemedText style={styles.categoryTitle}>
                        {categoryDisplayNames[category as keyof typeof categoryDisplayNames] || category} ({services.length})
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                  
                  {expandedCategories[category] && (
                    <View style={styles.testsGrid}>
                      {services.map(service => {
                        const isSelected = selectedTests.some(test => test._id === service._id);
                        return (
                          <TouchableOpacity
                            key={service._id}
                            style={[styles.testItem, isSelected && styles.testItemSelected]}
                            onPress={() => handleTestSelection(service, !isSelected)}
                          >
                            <View style={[styles.testCheckbox, isSelected && styles.testCheckboxSelected]}>
                              {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                            </View>
                            <View style={styles.testDetails}>
                              <ThemedText style={styles.testName}>{service.serviceName}</ThemedText>
                              <ThemedText style={styles.testPrice}>₱{service.price.toFixed(2)}</ThemedText>
                              {service.preparationInstructions && (
                                <ThemedText style={styles.testPrep}>{service.preparationInstructions}</ThemedText>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, selectedTests.length === 0 && styles.confirmButtonDisabled]} 
              onPress={handleConfirm}
              disabled={selectedTests.length === 0}
            >
              <ThemedText style={[styles.confirmButtonText, selectedTests.length === 0 && styles.confirmButtonTextDisabled]}>
                Confirm Selection ({selectedTests.length} tests)
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '95%',
    maxHeight: '90%',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  closeButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A202C',
  },
  selectedTestsSummary: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 12,
  },
  selectedTestsList: {
    marginBottom: 12,
  },
  selectedTestItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#21AEA8',
  },
  selectedTestName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A202C',
    marginBottom: 4,
  },
  selectedTestPrice: {
    fontSize: 14,
    color: '#21AEA8',
    fontWeight: '600',
    marginBottom: 8,
  },
  removeTestButton: {
    alignSelf: 'flex-end',
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#21AEA8',
    paddingTop: 12,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#21AEA8',
  },
  categoriesContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    backgroundColor: '#F7FAFC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryToggle: {
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
  },
  testsGrid: {
    gap: 8,
  },
  testItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'flex-start',
  },
  testItemSelected: {
    borderColor: '#21AEA8',
    backgroundColor: '#F0F9FF',
  },
  testCheckbox: {
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
  testCheckboxSelected: {
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
  testPrep: {
    fontSize: 12,
    color: '#4A5568',
    fontStyle: 'italic',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#4A5568',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F7FAFC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
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