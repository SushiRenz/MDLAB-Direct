const mongoose = require('mongoose');
const Service = require('./models/Service');
const User = require('./models/User');
require('dotenv').config();

// Sample services data for MDLAB Direct
const sampleServices = [
  {
    serviceName: "Complete Blood Count (CBC)",
    description: "A comprehensive blood test that evaluates overall health and screens for a variety of disorders including anemia, infection, and leukemia.",
    category: "blood_tests",
    price: 350.00,
    discountPrice: 300.00,
    duration: 30,
    sampleType: "blood",
    instructions: "Patient should fast for 8-12 hours before the test.",
    isActive: true,
    isPopular: true,
    tags: ["blood", "CBC", "anemia", "infection", "leukemia"],
    preparationNotes: "No special preparation required unless ordered with other tests requiring fasting."
  },
  {
    serviceName: "Lipid Profile",
    description: "Measures cholesterol and triglyceride levels to assess cardiovascular risk.",
    category: "blood_tests",
    price: 450.00,
    discountPrice: 400.00,
    duration: 45,
    sampleType: "blood",
    instructions: "Patient must fast for 12 hours before the test.",
    isActive: true,
    isPopular: true,
    tags: ["cholesterol", "triglycerides", "cardiovascular", "heart"],
    preparationNotes: "Fast for 12 hours. Only water is allowed during fasting period."
  },
  {
    serviceName: "Glucose Test (Fasting)",
    description: "Measures blood sugar levels after fasting to screen for diabetes.",
    category: "blood_tests",
    price: 200.00,
    duration: 15,
    sampleType: "blood",
    instructions: "Patient must fast for 8-12 hours before the test.",
    isActive: true,
    isPopular: true,
    tags: ["glucose", "diabetes", "blood sugar", "fasting"],
    preparationNotes: "Fast for 8-12 hours. Only water is permitted."
  },
  {
    serviceName: "Liver Function Test (LFT)",
    description: "Assesses liver health and function through various enzyme and protein measurements.",
    category: "blood_tests",
    price: 550.00,
    discountPrice: 500.00,
    duration: 60,
    sampleType: "blood",
    instructions: "No special preparation required.",
    isActive: true,
    isPopular: false,
    tags: ["liver", "enzymes", "hepatitis", "liver function"],
    preparationNotes: "No fasting required. Continue regular medications unless advised otherwise."
  },
  {
    serviceName: "Kidney Function Test",
    description: "Evaluates kidney function through creatinine, BUN, and other kidney markers.",
    category: "blood_tests",
    price: 400.00,
    duration: 45,
    sampleType: "blood",
    instructions: "No special preparation required.",
    isActive: true,
    isPopular: false,
    tags: ["kidney", "creatinine", "BUN", "renal function"],
    preparationNotes: "Stay well hydrated before the test."
  },
  {
    serviceName: "Urinalysis (Complete)",
    description: "Comprehensive urine examination to detect urinary tract infections, kidney disease, and diabetes.",
    category: "urine_tests",
    price: 250.00,
    duration: 30,
    sampleType: "urine",
    instructions: "Collect first morning urine sample in sterile container.",
    isActive: true,
    isPopular: true,
    tags: ["urine", "UTI", "kidney", "diabetes", "protein"],
    preparationNotes: "Use the sterile container provided. Collect mid-stream urine sample."
  },
  {
    serviceName: "Urine Culture",
    description: "Identifies bacteria in urine and determines antibiotic sensitivity.",
    category: "urine_tests",
    price: 350.00,
    duration: 45,
    sampleType: "urine",
    instructions: "Collect clean-catch midstream urine sample.",
    isActive: true,
    isPopular: false,
    tags: ["urine culture", "bacteria", "antibiotic", "UTI"],
    preparationNotes: "Clean genital area thoroughly before collection. Use sterile container."
  },
  {
    serviceName: "X-Ray Chest (PA View)",
    description: "Standard chest X-ray to examine lungs, heart, and chest wall.",
    category: "imaging",
    price: 800.00,
    discountPrice: 750.00,
    duration: 15,
    sampleType: "none",
    instructions: "Remove all metal objects and jewelry from chest area.",
    isActive: true,
    isPopular: true,
    tags: ["X-ray", "chest", "lungs", "heart"],
    preparationNotes: "Wear comfortable clothing without metal fasteners."
  },
  {
    serviceName: "Ultrasound Abdomen",
    description: "Non-invasive imaging of abdominal organs including liver, gallbladder, kidneys, and spleen.",
    category: "imaging",
    price: 1200.00,
    discountPrice: 1100.00,
    duration: 30,
    sampleType: "none",
    instructions: "Fast for 8 hours before the examination.",
    isActive: true,
    isPopular: true,
    tags: ["ultrasound", "abdomen", "liver", "gallbladder", "kidneys"],
    preparationNotes: "Fast for 8 hours. Drink water 1 hour before exam and hold urine."
  },
  {
    serviceName: "ECG (Electrocardiogram)",
    description: "Records electrical activity of the heart to detect heart problems.",
    category: "imaging",
    price: 500.00,
    duration: 20,
    sampleType: "none",
    instructions: "Wear loose-fitting clothing for easy chest access.",
    isActive: true,
    isPopular: true,
    tags: ["ECG", "EKG", "heart", "cardiac", "arrhythmia"],
    preparationNotes: "Avoid lotions or oils on chest. Remove jewelry from neck and arms."
  },
  {
    serviceName: "Pap Smear",
    description: "Cervical cancer screening test for women to detect abnormal cells.",
    category: "pathology",
    price: 600.00,
    discountPrice: 550.00,
    duration: 15,
    sampleType: "tissue",
    instructions: "Schedule during non-menstrual days, avoid douching or intercourse 24 hours before.",
    isActive: true,
    isPopular: true,
    tags: ["pap smear", "cervical", "cancer screening", "women's health"],
    preparationNotes: "Schedule when not menstruating. Avoid douching, tampons, or intercourse 24 hours prior."
  },
  {
    serviceName: "Biopsy Examination",
    description: "Microscopic examination of tissue samples to diagnose diseases including cancer.",
    category: "pathology",
    price: 1500.00,
    discountPrice: 1400.00,
    duration: 120,
    sampleType: "tissue",
    instructions: "Tissue sample must be properly preserved and labeled.",
    isActive: true,
    isPopular: false,
    tags: ["biopsy", "tissue", "cancer", "microscopic", "diagnosis"],
    preparationNotes: "Follow specific instructions provided by referring physician."
  },
  {
    serviceName: "Thyroid Function Test (T3, T4, TSH)",
    description: "Comprehensive thyroid function assessment including T3, T4, and TSH levels.",
    category: "special_tests",
    price: 650.00,
    discountPrice: 600.00,
    duration: 45,
    sampleType: "blood",
    instructions: "No special preparation required unless taking thyroid medications.",
    isActive: true,
    isPopular: true,
    tags: ["thyroid", "T3", "T4", "TSH", "hormone"],
    preparationNotes: "Inform lab of any thyroid medications. No fasting required."
  },
  {
    serviceName: "Vitamin D Test",
    description: "Measures 25-hydroxyvitamin D levels to assess vitamin D status.",
    category: "special_tests",
    price: 400.00,
    duration: 30,
    sampleType: "blood",
    instructions: "No special preparation required.",
    isActive: true,
    isPopular: false,
    tags: ["vitamin D", "25-hydroxyvitamin", "bone health"],
    preparationNotes: "No fasting required. Continue regular medications."
  },
  {
    serviceName: "Basic Health Package",
    description: "Comprehensive health checkup including CBC, glucose, lipid profile, and urinalysis.",
    category: "package_deals",
    price: 1200.00,
    discountPrice: 999.00,
    duration: 90,
    sampleType: "multiple",
    instructions: "Fast for 12 hours before blood tests.",
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageServices: ["Complete Blood Count (CBC)", "Glucose Test (Fasting)", "Lipid Profile", "Urinalysis (Complete)"],
    tags: ["health package", "checkup", "comprehensive", "basic"],
    preparationNotes: "Fast for 12 hours. Bring first morning urine sample."
  },
  {
    serviceName: "Executive Health Package",
    description: "Premium health checkup with advanced tests including imaging and cardiac assessment.",
    category: "package_deals",
    price: 2500.00,
    discountPrice: 2200.00,
    duration: 180,
    sampleType: "multiple",
    instructions: "Fast for 12 hours before blood tests.",
    isActive: true,
    isPopular: true,
    isPackage: true,
    packageServices: ["Basic Health Package", "ECG", "X-Ray Chest", "Ultrasound Abdomen", "Thyroid Function Test"],
    tags: ["executive package", "premium", "comprehensive", "advanced"],
    preparationNotes: "Fast for 12 hours. Follow ultrasound preparation instructions."
  },
  {
    serviceName: "Emergency Troponin Test",
    description: "Rapid cardiac enzyme test to detect heart attack.",
    category: "emergency_tests",
    price: 800.00,
    duration: 60,
    sampleType: "blood",
    instructions: "Urgent test - no preparation time required.",
    isActive: true,
    isPopular: false,
    tags: ["troponin", "heart attack", "cardiac", "emergency"],
    preparationNotes: "Emergency test - immediate processing."
  },
  {
    serviceName: "Emergency D-Dimer",
    description: "Rapid test to rule out blood clots and pulmonary embolism.",
    category: "emergency_tests",
    price: 600.00,
    duration: 45,
    sampleType: "blood",
    instructions: "Urgent test - no preparation time required.",
    isActive: true,
    isPopular: false,
    tags: ["D-dimer", "blood clot", "pulmonary embolism", "emergency"],
    preparationNotes: "Emergency test - immediate processing."
  }
];

async function seedServices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Find an admin user to set as createdBy
    let adminUser = await User.findOne({ role: 'admin' });
    
    if (!adminUser) {
      console.log('⚠️  No admin user found, creating a default admin user...');
      // Create a default admin user for seeding
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      adminUser = await User.create({
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@mdlab.com',
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Created default admin user');
    }

    // Add createdBy to all sample services
    const servicesWithCreator = sampleServices.map(service => ({
      ...service,
      createdBy: adminUser._id
    }));

    // Clear existing services
    await Service.deleteMany({});
    console.log('🧹 Cleared existing services');

    // Insert sample services one by one to handle any conflicts
    const createdServices = [];
    for (const serviceData of servicesWithCreator) {
      try {
        const service = await Service.create(serviceData);
        createdServices.push(service);
      } catch (error) {
        if (error.code === 11000) {
          console.log(`⚠️  Skipping duplicate service: ${serviceData.serviceName}`);
        } else {
          console.error(`❌ Error creating service ${serviceData.serviceName}:`, error.message);
        }
      }
    }
    console.log(`✨ Successfully seeded ${createdServices.length} services`);

    // Display summary by category
    const categories = await Service.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          averagePrice: { $avg: '$price' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    console.log('\n📊 Services by Category:');
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} services (Avg price: $${cat.averagePrice.toFixed(2)})`);
    });

    // Display popular services
    const popularServices = await Service.find({ isPopular: true }).select('serviceName price category');
    console.log('\n⭐ Popular Services:');
    popularServices.forEach(service => {
      console.log(`   ${service.serviceName} - $${service.price} (${service.category})`);
    });

    // Display package deals
    const packages = await Service.find({ isPackage: true }).select('serviceName price discountPrice');
    console.log('\n📦 Package Deals:');
    packages.forEach(pkg => {
      const savings = pkg.price - (pkg.discountPrice || pkg.price);
      console.log(`   ${pkg.serviceName} - $${pkg.discountPrice || pkg.price} (Save $${savings})`);
    });

    console.log('\n🎉 Service seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding services:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('📴 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedServices();