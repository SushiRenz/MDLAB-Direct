const mongoose = require('mongoose');
const Service = require('../models/Service');
const User = require('../models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/MDLAB_DIRECT');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// MDLAB Direct Price List Services
const priceListServices = [
  // Clinical Chemistry
  {
    serviceName: 'Chem 10',
    description: 'Comprehensive chemistry panel including glucose, BUN, creatinine, electrolytes, and liver enzymes.',
    category: 'clinical_chemistry',
    price: 1950.00,
    duration: '30 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 8-12 hours. Only water is allowed during fasting period.',
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageItems: ['Glucose', 'BUN', 'Creatinine', 'Sodium', 'Potassium', 'Chloride', 'CO2', 'ALT', 'AST', 'Total Protein'],
    methodology: 'Enzymatic Method',
    tags: ['comprehensive', 'chemistry', 'metabolic', 'liver'],
    availability: '24_7'
  },
  {
    serviceName: 'Lipid Profile (TC, Trig, HDL, LDL)',
    description: 'Complete lipid assessment including total cholesterol, triglycerides, HDL, and LDL cholesterol.',
    category: 'clinical_chemistry',
    price: 950.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 9-12 hours. No food, alcohol, or beverages except water.',
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageItems: ['Total Cholesterol', 'Triglycerides', 'HDL Cholesterol', 'LDL Cholesterol'],
    methodology: 'Enzymatic Method',
    tags: ['cholesterol', 'cardiovascular', 'lipids', 'heart'],
    availability: '24_7'
  },
  {
    serviceName: 'Electrolytes (Na, K, Cl, tCa, TCo)',
    description: 'Essential electrolyte panel for monitoring fluid and acid-base balance.',
    category: 'clinical_chemistry',
    price: 1000.00,
    duration: '15 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    isPackage: true,
    packageItems: ['Sodium', 'Potassium', 'Chloride', 'Total Calcium', 'Total CO2'],
    methodology: 'Ion Selective Electrode',
    tags: ['electrolytes', 'sodium', 'potassium', 'calcium'],
    availability: '24_7'
  },
  {
    serviceName: 'FBS/RBS',
    description: 'Fasting Blood Sugar or Random Blood Sugar test for diabetes screening.',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Fluoride tube)',
    preparationInstructions: 'For FBS: Fast for 8-12 hours. For RBS: No preparation required.',
    isActive: true,
    isPopular: true,
    methodology: 'Enzymatic Method',
    tags: ['diabetes', 'glucose', 'screening'],
    availability: '24_7'
  },
  {
    serviceName: 'Total Cholesterol',
    description: 'Measurement of total cholesterol levels for cardiovascular risk assessment.',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 9-12 hours for accurate results.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['cholesterol', 'cardiovascular'],
    availability: '24_7'
  },
  {
    serviceName: 'Triglycerides',
    description: 'Measurement of triglyceride levels for cardiovascular and metabolic assessment.',
    category: 'clinical_chemistry',
    price: 280.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 9-12 hours. Avoid alcohol 24 hours before test.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['triglycerides', 'cardiovascular', 'fat'],
    availability: '24_7'
  },
  {
    serviceName: 'HDL Cholesterol',
    description: 'High-density lipoprotein cholesterol measurement (good cholesterol).',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 9-12 hours for accurate results.',
    isActive: true,
    methodology: 'Direct Method',
    tags: ['hdl', 'good cholesterol', 'cardiovascular'],
    availability: '24_7'
  },
  {
    serviceName: 'LDL Cholesterol',
    description: 'Low-density lipoprotein cholesterol measurement (bad cholesterol).',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 9-12 hours for accurate results.',
    isActive: true,
    methodology: 'Direct Method',
    tags: ['ldl', 'bad cholesterol', 'cardiovascular'],
    availability: '24_7'
  },
  {
    serviceName: 'Uric Acid',
    description: 'Measurement of uric acid levels for gout and kidney disease assessment.',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['uric acid', 'gout', 'kidney'],
    availability: '24_7'
  },
  {
    serviceName: 'Creatinine',
    description: 'Kidney function test measuring creatinine levels in blood.',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['creatinine', 'kidney', 'renal'],
    availability: '24_7'
  },
  {
    serviceName: 'BUN (Blood Urea Nitrogen)',
    description: 'Kidney function test measuring blood urea nitrogen levels.',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['bun', 'kidney', 'urea'],
    availability: '24_7'
  },
  {
    serviceName: 'ALT / SGPT',
    description: 'Alanine aminotransferase test for liver function assessment.',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['alt', 'sgpt', 'liver', 'enzyme'],
    availability: '24_7'
  },
  {
    serviceName: 'AST / SGOT',
    description: 'Aspartate aminotransferase test for liver and heart function assessment.',
    category: 'clinical_chemistry',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['ast', 'sgot', 'liver', 'enzyme'],
    availability: '24_7'
  },
  {
    serviceName: 'OGTT (Oral Glucose Tolerance Test)',
    description: '2-hour glucose tolerance test for diabetes diagnosis.',
    category: 'clinical_chemistry',
    price: 900.00,
    duration: '3 hours',
    sampleType: 'Blood (Fluoride tube)',
    preparationInstructions: 'Fast for 8-12 hours. Patient will drink glucose solution during test.',
    isActive: true,
    methodology: 'Enzymatic Method',
    tags: ['diabetes', 'glucose tolerance', 'oral'],
    availability: 'appointment_only'
  },
  {
    serviceName: 'HBA1c (Glycosylated Hemoglobin)',
    description: 'Average blood sugar control over past 2-3 months for diabetes monitoring.',
    category: 'clinical_chemistry',
    price: 900.00,
    duration: '15 minutes',
    sampleType: 'Blood (EDTA tube)',
    preparationInstructions: 'No fasting required. Can be done at any time.',
    isActive: true,
    isPopular: true,
    methodology: 'HPLC Method',
    tags: ['diabetes', 'hemoglobin', 'monitoring'],
    availability: '24_7'
  },

  // Hematology
  {
    serviceName: 'Complete Blood Count (CBC)',
    description: 'Comprehensive blood test evaluating overall health and detecting blood disorders.',
    category: 'hematology',
    price: 280.00,
    duration: '20 minutes',
    sampleType: 'Blood (EDTA tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageItems: ['White Blood Cell Count', 'Red Blood Cell Count', 'Hemoglobin', 'Hematocrit', 'Platelet Count', 'Differential Count'],
    methodology: 'Automated Cell Counter',
    tags: ['blood', 'complete', 'anemia', 'infection'],
    availability: '24_7'
  },
  {
    serviceName: 'ESR (Erythrocyte Sedimentation Rate)',
    description: 'Test to detect inflammation in the body.',
    category: 'hematology',
    price: 250.00,
    duration: '60 minutes',
    sampleType: 'Blood (EDTA tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Westergren Method',
    tags: ['esr', 'inflammation', 'sedimentation'],
    availability: '24_7'
  },
  {
    serviceName: 'PT (Prothrombin Time)',
    description: 'Blood clotting test for monitoring anticoagulant therapy.',
    category: 'hematology',
    price: 200.00,
    duration: '2-4 hours',
    sampleType: 'Blood (Sodium citrate tube)',
    preparationInstructions: 'No special preparation required. Patient should inform lab staff of any anticoagulant medications.',
    isActive: true,
    methodology: 'Photo-optical Method',
    tags: ['clotting', 'coagulation', 'warfarin', 'anticoagulant'],
    availability: '24_7'
  },
  {
    serviceName: 'APTT (Activated Partial Thromboplastin Time)',
    description: 'Blood clotting test for monitoring heparin therapy and detecting clotting disorders.',
    category: 'hematology',
    price: 250.00,
    duration: '2-4 hours',
    sampleType: 'Blood (Sodium citrate tube)',
    preparationInstructions: 'No special preparation required. Patient should not be on anticoagulant therapy unless specifically being monitored.',
    isActive: true,
    methodology: 'Photo-optical Method',
    tags: ['clotting', 'coagulation', 'heparin', 'bleeding disorders'],
    availability: '24_7'
  },

  // Clinical Microscopy
  {
    serviceName: 'Urinalysis (10 parameter)',
    description: 'Complete urine examination including physical, chemical, and microscopic analysis.',
    category: 'clinical_microscopy',
    price: 180.00,
    duration: '20 minutes',
    sampleType: 'Urine (Mid-stream clean catch)',
    preparationInstructions: 'Collect first morning urine sample in sterile container.',
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageItems: ['Physical Examination', 'Chemical Analysis', 'Microscopic Examination'],
    methodology: 'Dipstick and Microscopy',
    tags: ['urine', 'microscopy', 'uti', 'kidney'],
    availability: '24_7'
  },
  {
    serviceName: 'Fecalysis',
    description: 'Stool examination for parasites, bacteria, and other abnormalities.',
    category: 'clinical_microscopy',
    price: 100.00,
    duration: '30 minutes',
    sampleType: 'Stool sample',
    preparationInstructions: 'Collect fresh stool sample in clean container. Avoid contamination with urine.',
    isActive: true,
    methodology: 'Direct Microscopy',
    tags: ['stool', 'parasites', 'microscopy'],
    availability: '24_7'
  },
  {
    serviceName: 'FOBT (Fecal Occult Blood Test)',
    description: 'Test to detect hidden blood in stool for colorectal cancer screening.',
    category: 'clinical_microscopy',
    price: 250.00,
    duration: '15 minutes',
    sampleType: 'Stool sample',
    preparationInstructions: 'Avoid red meat, vitamin C supplements 3 days before test.',
    isActive: true,
    methodology: 'Immunochemical Method',
    tags: ['occult blood', 'cancer screening', 'colorectal'],
    availability: '24_7'
  },
  {
    serviceName: 'Pregnancy Test (Urine)',
    description: 'Rapid urine pregnancy test for early pregnancy detection.',
    category: 'clinical_microscopy',
    price: 250.00,
    duration: '10 minutes',
    sampleType: 'Urine sample',
    preparationInstructions: 'First morning urine preferred for best results.',
    isActive: true,
    isPopular: true,
    gender: 'female',
    methodology: 'Lateral Flow Immunoassay',
    tags: ['pregnancy', 'urine', 'rapid test'],
    availability: '24_7'
  },
  {
    serviceName: 'Pregnancy Test (Serum)',
    description: 'Quantitative blood pregnancy test (Beta hCG) for accurate pregnancy detection.',
    category: 'clinical_microscopy',
    price: 350.00,
    duration: '1-2 hours',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    gender: 'female',
    methodology: 'ELISA / Immunoassay',
    tags: ['pregnancy', 'serum', 'beta hCG', 'blood test'],
    availability: '24_7'
  },

  // Serology / Immunology
  {
    serviceName: 'Blood Typing (ABO Rh)',
    description: 'Determination of ABO blood group and Rh factor using immunological methods.',
    category: 'serology_immunology',
    price: 150.00,
    duration: '15 minutes',
    sampleType: 'Blood (EDTA tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    isPopular: true,
    methodology: 'Agglutination Method (Immunohematology)',
    tags: ['blood type', 'abo', 'rh factor', 'transfusion'],
    availability: '24_7'
  },
  {
    serviceName: 'Hepatitis B Antigen (HbsAg)',
    description: 'Screening test for Hepatitis B virus infection.',
    category: 'serology_immunology',
    price: 250.00,
    duration: '30 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['hepatitis b', 'infection', 'screening'],
    availability: '24_7'
  },
  {
    serviceName: 'VDRL (Syphilis)',
    description: 'Screening test for syphilis infection.',
    category: 'serology_immunology',
    price: 300.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'VDRL Flocculation Test',
    tags: ['syphilis', 'std', 'screening'],
    availability: '24_7'
  },
  {
    serviceName: 'Salmonella Test (Typhoid IgG/IgM)',
    description: 'Antibody test for typhoid fever diagnosis.',
    category: 'serology_immunology',
    price: 650.00,
    duration: '30 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Lateral Flow Immunoassay',
    tags: ['typhoid', 'salmonella', 'fever'],
    availability: '24_7'
  },
  {
    serviceName: 'Rapid Antigen Test (COVID-19)',
    description: 'Quick test for COVID-19 antigen detection.',
    category: 'serology_immunology',
    price: 660.00,
    duration: '15 minutes',
    sampleType: 'Nasopharyngeal swab',
    preparationInstructions: 'No eating, drinking, or brushing teeth 30 minutes before test.',
    isActive: true,
    isPopular: true,
    methodology: 'Lateral Flow Immunoassay',
    tags: ['covid-19', 'antigen', 'rapid test'],
    availability: '24_7'
  },
  {
    serviceName: 'TSH (Thyroid Stimulating Hormone)',
    description: 'Primary test for thyroid function assessment.',
    category: 'serology_immunology',
    price: 750.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    isPopular: true,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['thyroid', 'hormone', 'tsh'],
    availability: '24_7'
  },
  {
    serviceName: 'FT4 (Free Thyroxine)',
    description: 'Active thyroid hormone measurement for thyroid function.',
    category: 'serology_immunology',
    price: 750.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['thyroid', 'hormone', 'free t4'],
    availability: '24_7'
  },
  {
    serviceName: 'FT3 (Free Triiodothyronine)',
    description: 'Active thyroid hormone measurement for complete thyroid assessment.',
    category: 'serology_immunology',
    price: 750.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['thyroid', 'hormone', 'free t3'],
    availability: '24_7'
  },
  {
    serviceName: 'T4 (Total Thyroxine)',
    description: 'Total thyroid hormone measurement including bound and free forms.',
    category: 'serology_immunology',
    price: 750.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['thyroid', 'hormone', 'total t4'],
    availability: '24_7'
  },
  {
    serviceName: 'T3 (Total Triiodothyronine)',
    description: 'Total thyroid hormone measurement for comprehensive thyroid evaluation.',
    category: 'serology_immunology',
    price: 750.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['thyroid', 'hormone', 'total t3'],
    availability: '24_7'
  },
  {
    serviceName: 'PSA (Prostate Specific Antigen)',
    description: 'Prostate cancer screening test for men.',
    category: 'serology_immunology',
    price: 1000.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Avoid ejaculation 48 hours before test. No vigorous exercise 24 hours before.',
    isActive: true,
    gender: 'male',
    minAge: 40,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['prostate', 'cancer screening', 'psa', 'men'],
    availability: '24_7'
  },
  {
    serviceName: 'Dengue Duo (NS1 IgG/IgM)',
    description: 'Comprehensive dengue test detecting both antigen and antibodies.',
    category: 'serology_immunology',
    price: 1000.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    isPackage: true,
    packageItems: ['Dengue NS1 Antigen', 'Dengue IgG Antibody', 'Dengue IgM Antibody'],
    methodology: 'Lateral Flow Immunoassay',
    tags: ['dengue', 'fever', 'tropical disease'],
    availability: '24_7'
  },
  {
    serviceName: 'Dengue NS1',
    description: 'Early dengue antigen detection test.',
    category: 'serology_immunology',
    price: 800.00,
    duration: '15 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Lateral Flow Immunoassay',
    tags: ['dengue', 'ns1', 'antigen', 'early detection'],
    availability: '24_7'
  },
  {
    serviceName: 'H. Pylori Antibody / Antigen',
    description: 'Test for Helicobacter pylori infection causing stomach ulcers.',
    category: 'serology_immunology',
    price: 600.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    methodology: 'Lateral Flow Immunoassay',
    tags: ['h pylori', 'ulcer', 'stomach', 'infection'],
    availability: '24_7'
  },
  {
    serviceName: 'HIV Screening',
    description: 'Confidential HIV antibody screening test.',
    category: 'serology_immunology',
    price: 300.00,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required. Confidential testing available.',
    isActive: true,
    methodology: 'Chemiluminescent Immunoassay',
    tags: ['hiv', 'aids', 'screening', 'confidential'],
    availability: '24_7'
  }
];

// Seed services function
const seedPriceListServices = async () => {
  try {
    // Connect to database
    await connectDB();

    // Find an admin user to use as createdBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('❌ No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing services
    await Service.deleteMany({});
    console.log('🗑️  Cleared existing services');

    // Add createdBy field to all services
    const servicesWithCreator = priceListServices.map((service, index) => ({
      ...service,
      serviceId: `SRV-2025-${String(Date.now() + index).slice(-6)}`, // Unique serviceId
      createdBy: adminUser._id,
      lastModifiedBy: adminUser._id
    }));

    // Insert new services
    const insertedServices = await Service.insertMany(servicesWithCreator);
    console.log(`✅ Successfully inserted ${insertedServices.length} services:`);
    
    // Group and display by category
    const categories = {
      'clinical_chemistry': 'Clinical Chemistry',
      'hematology': 'Hematology', 
      'clinical_microscopy': 'Clinical Microscopy',
      'serology_immunology': 'Serology / Immunology'
    };

    Object.keys(categories).forEach(categoryKey => {
      const categoryServices = insertedServices.filter(service => service.category === categoryKey);
      if (categoryServices.length > 0) {
        console.log(`\n📋 ${categories[categoryKey]} (${categoryServices.length} services):`);
        categoryServices.forEach(service => {
          console.log(`   - ${service.serviceName} - ₱${service.price.toFixed(2)}`);
        });
      }
    });

    console.log('\n🎉 MDLAB Direct price list services seeding completed successfully!');
    console.log(`💰 Total services: ${insertedServices.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the seeder
if (require.main === module) {
  seedPriceListServices();
}

module.exports = { seedPriceListServices, priceListServices };