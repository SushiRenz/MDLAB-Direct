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

const CATEGORY_DISPLAY_NAMES = {
  clinical_chemistry: 'Clinical Chemistry',
  hematology: 'Hematology',
  clinical_microscopy: 'Clinical Microscopy',
  serology_immunology: 'Serology / Immunology',
  other: 'Other Tests',
};

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
    clinical_chemistry: true,
    hematology: true,
    clinical_microscopy: true,
    serology_immunology: true,
    other: true,
  });

  // Reset when modal opens
  useEffect(() => {
    if (isVisible) {
      setSelectedTests([]);
      setSearchTerm('');
    }
  }, [isVisible]);

  // Group services by category
  const groupedServices = useMemo(() => {
    console.log('🧪 TestSelectionModal - Processing services:', availableServices.length);
    console.log('🧪 Sample services:', availableServices.slice(0, 2));
    
    if (!availableServices || availableServices.length === 0) {
      console.log('⚠️ No services available to group');
      return {};
    }

    const filtered = availableServices.filter(service =>
      service.isActive && 
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    console.log('🧪 Filtered services:', filtered.length);

    const grouped = filtered.reduce((groups: {[key: string]: Service[]}, service) => {
      const category = service.category || 'other';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(service);
      return groups;
    }, {});

    console.log('🧪 Grouped services by category:', Object.keys(grouped).map(cat => `${cat}: ${grouped[cat].length}`));
    return grouped;
  }, [availableServices, searchTerm]);

  const handleTestSelection = (service: Service, isChecked: boolean) => {
    if (isChecked) {
      setSelectedTests(prev => [...prev, service]);
    } else {
      setSelectedTests(prev => prev.filter(test => test._id !== service._id));
    }
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const calculateTotalPrice = () => {
    return selectedTests.reduce((sum, test) => sum + test.price, 0);
  };

  const removeSelectedTest = (testId: string) => {
    setSelectedTests(prev => prev.filter(test => test._id !== testId));
  };

  const handleConfirm = () => {
    if (selectedTests.length > 0) {
      onConfirm(selectedTests);
      onClose();
    } else {
      Alert.alert('No Tests Selected', 'Please select at least one test to continue.');
    }
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
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.selectedTestsList}
                contentContainerStyle={styles.selectedTestsContent}
              >
                {selectedTests.map(test => (
                  <View key={test._id} style={styles.selectedTestItem}>
                    <ThemedText style={styles.selectedTestName} numberOfLines={1}>
                      {test.serviceName}
                    </ThemedText>
                    <ThemedText style={styles.selectedTestPrice}>
                      ₱{test.price.toFixed(2)}
                    </ThemedText>
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
                  Total: ₱{calculateTotalPrice().toFixed(2)}
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
            ) : Object.entries(groupedServices).length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText style={styles.emptyText}>No tests available</ThemedText>
              </View>
            ) : (
              Object.entries(groupedServices).map(([category, services]) => (
              <View key={category} style={styles.categorySection}>
                <TouchableOpacity 
                  style={styles.categoryHeader}
                  onPress={() => toggleCategory(category)}
                >
                  <Ionicons 
                    name={expandedCategories[category] ? "chevron-down" : "chevron-forward"} 
                    size={20} 
                    color="#21AEA8" 
                  />
                  <ThemedText style={styles.categoryTitle}>
                    {CATEGORY_DISPLAY_NAMES[category as keyof typeof CATEGORY_DISPLAY_NAMES] || category} ({services.length})
                  </ThemedText>
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
                          <View style={styles.testItemHeader}>
                            <View style={styles.checkboxContainer}>
                              <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                              </View>
                            </View>
                            <View style={styles.testDetails}>
                              <ThemedText style={styles.testName}>{service.serviceName}</ThemedText>
                              <ThemedText style={styles.testPrice}>₱{service.price.toFixed(2)}</ThemedText>
                            </View>
                          </View>
                          {service.preparationInstructions && (
                            <ThemedText style={styles.testPreparation}>
                              {service.preparationInstructions}
                            </ThemedText>
                          )}
                          {service.duration && (
                            <ThemedText style={styles.testDuration}>
                              Duration: {service.duration}
                            </ThemedText>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
              ))
            )}
          </ScrollView>

          {/* No Results */}
          {Object.keys(groupedServices).length === 0 && (
            <View style={styles.noResults}>
              <ThemedText style={styles.noResultsText}>
                No tests found matching "{searchTerm}". Try adjusting your search.
              </ThemedText>
            </View>
          )}

          {/* Footer */}
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
                Confirm Selection ({selectedTests.length} test{selectedTests.length !== 1 ? 's' : ''})
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
    borderRadius: 16,
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
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A202C',
  },
  selectedTestsSummary: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#21AEA8',
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
  selectedTestsContent: {
    paddingHorizontal: 4,
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
    position: 'absolute',
    top: 4,
    right: 4,
  },
  totalPriceContainer: {
    alignItems: 'flex-end',
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F7FAFC',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginLeft: 8,
  },
  testsGrid: {
    gap: 12,
  },
  testItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  testItemSelected: {
    borderColor: '#21AEA8',
    backgroundColor: '#F0F9FF',
  },
  testItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#21AEA8',
    borderColor: '#21AEA8',
  },
  testDetails: {
    flex: 1,
  },
  testName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A202C',
    marginBottom: 4,
  },
  testPrice: {
    fontSize: 16,
    color: '#21AEA8',
    fontWeight: '600',
  },
  testPreparation: {
    fontSize: 12,
    color: '#718096',
    marginTop: 8,
    fontStyle: 'italic',
  },
  testDuration: {
    fontSize: 12,
    color: '#4A5568',
    marginTop: 4,
  },
  noResults: {
    padding: 40,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});