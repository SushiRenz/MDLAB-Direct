const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');

// Test the exact validation rules with the user's data
async function testUserValidation() {
    try {
        // User's exact data from the error log
        const userData = {
            patientId: null,
            patientName: 'jas',
            contactNumber: '09496858361',
            email: 'renz09358@gmail.com',
            age: 22,
            sex: 'Female',
            serviceIds: [
                '68e8f9f78c0dab521aeb1bfe', '68e8f9f78c0dab521aeb1bff', 
                '68e8f9f78c0dab521aeb1c00', '68e8f9f78c0dab521aeb1c01', 
                '68e8f9f78c0dab521aeb1c03', '68e8f9f78c0dab521aeb1c02', 
                '68e8f9f78c0dab521aeb1c05', '68e8f9f78c0dab521aeb1c04', 
                '68e8f9f78c0dab521aeb1c06', '68e8f9f78c0dab521aeb1c07', 
                '68e8f9f78c0dab521aeb1c08', '68e8f9f78c0dab521aeb1c09', 
                '68e8f9f78c0dab521aeb1c0b', '68e8f9f78c0dab521aeb1c0a', 
                '68e8f9f78c0dab521aeb1bf0', '68e8f9f78c0dab521aeb1bf1', 
                '68e8f9f78c0dab521aeb1bf3', '68e8f9f78c0dab521aeb1bf2', 
                '68e8f9f78c0dab521aeb1bf4', '68e8f9f78c0dab521aeb1bf5'
            ],
            appointmentDate: '2025-10-13',
            totalPrice: 11460,
            serviceName: 'CBC (Complete Blood Count), Urinalysis, Fecalysis, Sputum Examination, HBsAg, Anti HCV, VDRL, Chest X-Ray (PA), ECG, Blood Typing, FBS/RBS, BUN, Creatinine, Uric Acid, Total Cholesterol, Triglycerides, HDL Cholesterol, LDL Cholesterol, SGPT (ALT), SGOT (AST)',
            appointmentTime: '10:00 AM',
            type: 'scheduled',
            priority: 'regular',
            notes: 'Scheduled by receptionist - 20 tests',
            reasonForVisit: 'CBC (Complete Blood Count), Urinalysis, Fecalysis, Sputum Examination, HBsAg, Anti HCV, VDRL, Chest X-Ray (PA), ECG, Blood Typing, FBS/RBS, BUN, Creatinine, Uric Acid, Total Cholesterol, Triglycerides, HDL Cholesterol, LDL Cholesterol, SGPT (ALT), SGOT (AST) - Scheduled by receptionist',
            receptionistNotes: 'Scheduled via receptionist portal by undefined'
        };

        console.log('Testing user data validation...');
        console.log('Data summary:');
        console.log('- patientName:', userData.patientName, '(length:', userData.patientName.length, ')');
        console.log('- contactNumber:', userData.contactNumber, '(length:', userData.contactNumber.length, ')');
        console.log('- email:', userData.email);
        console.log('- age:', userData.age, typeof userData.age);
        console.log('- sex:', userData.sex);
        console.log('- serviceIds count:', userData.serviceIds.length);
        console.log('- appointmentDate:', userData.appointmentDate);
        console.log('- totalPrice:', userData.totalPrice, typeof userData.totalPrice);
        console.log('- serviceName length:', userData.serviceName.length);
        console.log('- notes length:', userData.notes ? userData.notes.length : 'null');
        console.log('- reasonForVisit length:', userData.reasonForVisit ? userData.reasonForVisit.length : 'null');

        // Check individual validations
        console.log('\n=== INDIVIDUAL VALIDATION CHECKS ===');

        // Check patientName
        const nameValid = userData.patientName && userData.patientName.length >= 2 && userData.patientName.length <= 100;
        console.log('✓ patientName valid:', nameValid);

        // Check contactNumber with regex
        const phoneRegex = /^(\+63|63|0)?[0-9]{9,11}$/;
        const phoneValid = phoneRegex.test(userData.contactNumber);
        console.log('✓ contactNumber valid:', phoneValid, '(regex test)');

        // Check email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailValid = emailRegex.test(userData.email);
        console.log('✓ email valid:', emailValid);

        // Check age
        const ageValid = !isNaN(parseInt(userData.age)) && userData.age >= 1 && userData.age <= 120;
        console.log('✓ age valid:', ageValid);

        // Check sex
        const sexValid = ['Male', 'Female'].includes(userData.sex);
        console.log('✓ sex valid:', sexValid);

        // Check serviceIds
        let serviceIdsValid = true;
        let invalidServiceId = null;
        if (!Array.isArray(userData.serviceIds) || userData.serviceIds.length === 0) {
            serviceIdsValid = false;
            invalidServiceId = 'Not an array or empty';
        } else {
            for (let i = 0; i < userData.serviceIds.length; i++) {
                const id = userData.serviceIds[i];
                const idStr = typeof id === 'string' ? id : String(id);
                if (!mongoose.Types.ObjectId.isValid(idStr)) {
                    serviceIdsValid = false;
                    invalidServiceId = `ID at position ${i}: ${id}`;
                    break;
                }
            }
        }
        console.log('✓ serviceIds valid:', serviceIdsValid, invalidServiceId ? `(${invalidServiceId})` : '');

        // Check appointmentDate
        const dateValid = !isNaN(new Date(userData.appointmentDate).getTime());
        console.log('✓ appointmentDate valid:', dateValid);

        // Check totalPrice
        const priceValid = !isNaN(parseFloat(userData.totalPrice)) && userData.totalPrice >= 0;
        console.log('✓ totalPrice valid:', priceValid);

        // Check field lengths that might cause issues
        console.log('\n=== FIELD LENGTH CHECKS ===');
        if (userData.serviceName) console.log('- serviceName length:', userData.serviceName.length);
        if (userData.notes) console.log('- notes length:', userData.notes.length, 'vs limit 500');
        if (userData.reasonForVisit) console.log('- reasonForVisit length:', userData.reasonForVisit.length, 'vs limit 300');

        // Check for length violations
        const notesTooLong = userData.notes && userData.notes.length > 500;
        const reasonTooLong = userData.reasonForVisit && userData.reasonForVisit.length > 300;

        console.log('✓ notes length OK:', !notesTooLong);
        console.log('✓ reasonForVisit length OK:', !reasonTooLong);

        if (notesTooLong) console.log('❌ NOTES TOO LONG:', userData.notes.length, '> 500');
        if (reasonTooLong) console.log('❌ REASON FOR VISIT TOO LONG:', userData.reasonForVisit.length, '> 300');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testUserValidation();