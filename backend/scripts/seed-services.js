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

// Sample services data for MDLAB Direct
const sampleServices = [
  {
    serviceName: 'Complete Blood Count (CBC)',
    description: 'Comprehensive blood test that evaluates overall health and detects various disorders including anemia, infection, and leukemia.',
    category: 'blood_tests',
    price: 350,
    discountPrice: 300,
    duration: '30 minutes',
    sampleType: 'Blood (EDTA tube)',
    preparationInstructions: 'No special preparation required. Can be done at any time.',
    isActive: true,
    isPopular: true,
    packageItems: ['White Blood Cell Count', 'Red Blood Cell Count', 'Hemoglobin', 'Hematocrit', 'Platelet Count'],
    normalRange: {
      general: 'WBC: 4,500-11,000/μL, RBC: 4.5-5.5 million/μL, Hgb: 12-16 g/dL'
    },
    methodology: 'Automated Cell Counter',
    equipment: 'Sysmex XN-1000',
    tags: ['blood', 'complete', 'anemia', 'infection'],
    availability: '24_7'
  },
  {
    serviceName: 'Fasting Blood Sugar (FBS)',
    description: 'Measures blood glucose levels after an 8-12 hour fast to screen for diabetes and prediabetes.',
    category: 'blood_tests',
    price: 150,
    duration: '15 minutes',
    sampleType: 'Blood (Fluoride tube)',
    preparationInstructions: 'Fast for 8-12 hours. Only water is allowed during fasting period.',
    isActive: true,
    isPopular: true,
    normalRange: {
      general: 'Normal: 70-100 mg/dL, Prediabetes: 100-125 mg/dL, Diabetes: ≥126 mg/dL'
    },
    methodology: 'Enzymatic Method',
    equipment: 'Cobas c311',
    tags: ['diabetes', 'glucose', 'fasting'],
    availability: '24_7'
  },
  {
    serviceName: 'Lipid Profile',
    description: 'Comprehensive test to assess cardiovascular risk by measuring cholesterol and triglyceride levels.',
    category: 'blood_tests',
    price: 450,
    discountPrice: 380,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 9-12 hours. No food, alcohol, or beverages except water.',
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageItems: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides', 'VLDL'],
    normalRange: {
      general: 'Total Cholesterol: <200 mg/dL, HDL: >40 mg/dL (M), >50 mg/dL (F), LDL: <100 mg/dL, Triglycerides: <150 mg/dL'
    },
    methodology: 'Enzymatic Method',
    equipment: 'Cobas c311',
    tags: ['cholesterol', 'cardiovascular', 'lipids', 'heart'],
    availability: '24_7'
  },
  {
    serviceName: 'Liver Function Test (LFT)',
    description: 'Panel of blood tests to assess liver health and detect liver damage or disease.',
    category: 'blood_tests',
    price: 550,
    discountPrice: 480,
    duration: '25 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required. Avoid alcohol 24 hours before test.',
    isActive: true,
    isPackage: true,
    packageItems: ['ALT', 'AST', 'ALP', 'Total Bilirubin', 'Direct Bilirubin', 'Total Protein', 'Albumin'],
    normalRange: {
      general: 'ALT: 7-56 U/L, AST: 10-40 U/L, ALP: 44-147 U/L, Total Bilirubin: 0.3-1.2 mg/dL'
    },
    methodology: 'Enzymatic Method',
    equipment: 'Cobas c311',
    tags: ['liver', 'hepatic', 'enzymes'],
    availability: '24_7'
  },
  {
    serviceName: 'Kidney Function Test (KFT)',
    description: 'Blood tests to evaluate kidney function and detect kidney disease.',
    category: 'blood_tests',
    price: 400,
    discountPrice: 350,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required. Maintain normal fluid intake.',
    isActive: true,
    isPackage: true,
    packageItems: ['Blood Urea Nitrogen (BUN)', 'Creatinine', 'Uric Acid', 'BUN/Creatinine Ratio'],
    normalRange: {
      general: 'BUN: 7-20 mg/dL, Creatinine: 0.7-1.3 mg/dL (M), 0.6-1.1 mg/dL (F), Uric Acid: 3.5-7.2 mg/dL (M), 2.6-6.0 mg/dL (F)'
    },
    methodology: 'Enzymatic Method',
    equipment: 'Cobas c311',
    tags: ['kidney', 'renal', 'creatinine', 'urea'],
    availability: '24_7'
  },
  {
    serviceName: 'Thyroid Function Test (TFT)',
    description: 'Tests to evaluate thyroid gland function and diagnose thyroid disorders.',
    category: 'blood_tests',
    price: 650,
    discountPrice: 550,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required. Inform if taking thyroid medications.',
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageItems: ['TSH', 'Free T3', 'Free T4'],
    normalRange: {
      general: 'TSH: 0.4-4.0 mIU/L, Free T3: 2.3-4.2 pg/mL, Free T4: 0.8-1.8 ng/dL'
    },
    methodology: 'Chemiluminescent Immunoassay',
    equipment: 'Cobas e411',
    tags: ['thyroid', 'hormone', 'metabolism'],
    availability: '24_7'
  },
  {
    serviceName: 'HbA1c (Glycated Hemoglobin)',
    description: 'Test that shows average blood sugar levels over the past 2-3 months for diabetes monitoring.',
    category: 'blood_tests',
    price: 300,
    duration: '15 minutes',
    sampleType: 'Blood (EDTA tube)',
    preparationInstructions: 'No fasting required. Can be done at any time of the day.',
    isActive: true,
    isPopular: true,
    normalRange: {
      general: 'Normal: <5.7%, Prediabetes: 5.7-6.4%, Diabetes: ≥6.5%'
    },
    methodology: 'HPLC Method',
    equipment: 'Bio-Rad D-10',
    tags: ['diabetes', 'glucose', 'hemoglobin', 'monitoring'],
    availability: '24_7'
  },
  {
    serviceName: 'Urinalysis (Complete Urine Examination)',
    description: 'Comprehensive urine test to detect urinary tract infections, kidney disease, and other conditions.',
    category: 'urine_tests',
    price: 200,
    duration: '20 minutes',
    sampleType: 'Urine (Mid-stream clean catch)',
    preparationInstructions: 'Collect first morning urine sample in sterile container. Clean genital area before collection.',
    isActive: true,
    isPopular: true,
    packageItems: ['Physical Examination', 'Chemical Examination', 'Microscopic Examination'],
    normalRange: {
      general: 'Specific Gravity: 1.005-1.030, pH: 4.6-8.0, Protein: Negative, Glucose: Negative'
    },
    methodology: 'Dipstick and Microscopy',
    equipment: 'Sysmex UF-1000i',
    tags: ['urine', 'infection', 'kidney', 'uti'],
    availability: '24_7'
  },
  {
    serviceName: 'Hepatitis B Surface Antigen (HBsAg)',
    description: 'Test to screen for Hepatitis B infection and determine immune status.',
    category: 'blood_tests',
    price: 250,
    duration: '30 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'No special preparation required.',
    isActive: true,
    normalRange: {
      general: 'Non-reactive (Negative)'
    },
    methodology: 'Chemiluminescent Immunoassay',
    equipment: 'Cobas e411',
    tags: ['hepatitis', 'infection', 'screening', 'vaccine'],
    availability: '24_7'
  },
  {
    serviceName: 'Basic Metabolic Panel (BMP)',
    description: 'Group of blood tests that provide information about body metabolism and organ function.',
    category: 'blood_tests',
    price: 500,
    discountPrice: 420,
    duration: '20 minutes',
    sampleType: 'Blood (Serum tube)',
    preparationInstructions: 'Fast for 8-12 hours for accurate glucose measurement.',
    isActive: true,
    isPackage: true,
    packageItems: ['Glucose', 'Sodium', 'Potassium', 'Chloride', 'CO2', 'BUN', 'Creatinine'],
    normalRange: {
      general: 'Glucose: 70-100 mg/dL, Sodium: 136-145 mEq/L, Potassium: 3.5-5.1 mEq/L'
    },
    methodology: 'Ion Selective Electrode',
    equipment: 'Cobas c311',
    tags: ['metabolic', 'electrolytes', 'kidney', 'basic'],
    availability: '24_7'
  }
];

// Seed services function
const seedServices = async () => {
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
    const servicesWithCreator = sampleServices.map(service => ({
      ...service,
      createdBy: adminUser._id,
      lastModifiedBy: adminUser._id
    }));

    // Insert new services
    const insertedServices = await Service.insertMany(servicesWithCreator);
    console.log(`✅ Successfully inserted ${insertedServices.length} services:`);
    
    insertedServices.forEach(service => {
      console.log(`   - ${service.serviceName} (₱${service.price})`);
    });

    console.log('\n🎉 Service seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    mongoose.connection.close();
    console.log('📦 Database connection closed');
  }
};

// Run the seeder
if (require.main === module) {
  seedServices();
}

module.exports = { seedServices, sampleServices };