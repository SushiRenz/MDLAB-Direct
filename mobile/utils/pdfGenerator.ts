import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

/**
 * Generate and share/print a payment receipt PDF
 */
export async function generateReceiptPDF(receiptData: {
  receiptNumber: string;
  patientName: string;
  date: string;
  testName: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}) {
  const { receiptNumber, patientName, date, testName, amount, paymentMethod, transactionId } = receiptData;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #21AEA8;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #21AEA8;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
          }
          .receipt-title {
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #21AEA8;
            margin: 20px 0;
          }
          .receipt-number {
            text-align: center;
            font-size: 16px;
            color: #666;
            margin-bottom: 30px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #21AEA8;
            margin-bottom: 10px;
            text-transform: uppercase;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .info-label {
            font-weight: bold;
            color: #666;
          }
          .info-value {
            color: #333;
          }
          .amount-section {
            background-color: #E8F5F3;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .amount-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .amount-value {
            font-size: 32px;
            font-weight: bold;
            color: #21AEA8;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
          }
          .footer-text {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .thank-you {
            font-size: 16px;
            font-weight: bold;
            color: #21AEA8;
            margin-top: 15px;
          }
          .watermark {
            text-align: center;
            margin-top: 20px;
            font-size: 10px;
            color: #ccc;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MDLAB Direct</div>
          <div class="subtitle">Medical Laboratory Services</div>
          <div class="subtitle">Nueva Vizcaya, Philippines</div>
        </div>

        <div class="receipt-title">PAYMENT RECEIPT</div>
        <div class="receipt-number">Receipt No: ${receiptNumber}</div>

        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="info-row">
            <span class="info-label">Patient Name:</span>
            <span class="info-value">${patientName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${date}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Service Details</div>
          <div class="info-row">
            <span class="info-label">Test/Service:</span>
            <span class="info-value">${testName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${paymentMethod}</span>
          </div>
          ${transactionId ? `
          <div class="info-row">
            <span class="info-label">Transaction ID:</span>
            <span class="info-value">${transactionId}</span>
          </div>
          ` : ''}
        </div>

        <div class="amount-section">
          <div class="amount-label">Total Amount Paid</div>
          <div class="amount-value">₱${amount.toFixed(2)}</div>
        </div>

        <div class="footer">
          <div class="footer-text">This is an official receipt from MDLAB Direct</div>
          <div class="footer-text">For inquiries, please contact us at (078) 123-4567</div>
          <div class="footer-text">Email: info@mdlabdirect.com</div>
          <div class="thank-you">Thank you for choosing MDLAB Direct!</div>
          <div class="watermark">Generated on ${new Date().toLocaleString()}</div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    
    // Check if sharing is available
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Print Receipt',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Success', 'Receipt PDF generated successfully!');
    }
    
    return uri;
  } catch (error) {
    console.error('Error generating receipt PDF:', error);
    Alert.alert('Error', 'Failed to generate receipt PDF');
    throw error;
  }
}

/**
 * Generate and share/print a test result PDF
 */
export async function generateTestResultPDF(resultData: {
  testName: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: string;
  resultItems: Array<{
    parameter: string;
    result: string;
    unit: string;
    normalRange: string;
    status?: 'normal' | 'high' | 'low';
  }>;
  doctorName?: string;
  labTechnician?: string;
  remarks?: string;
}) {
  const { testName, patientName, patientAge, patientGender, date, resultItems, doctorName, labTechnician, remarks } = resultData;

  const resultRowsHTML = resultItems.map(item => {
    const statusColor = item.status === 'high' ? '#ff6b6b' : item.status === 'low' ? '#ffa94d' : '#51cf66';
    const statusText = item.status === 'high' ? 'HIGH' : item.status === 'low' ? 'LOW' : 'NORMAL';
    
    return `
      <tr>
        <td class="result-cell">${item.parameter}</td>
        <td class="result-cell result-value">${item.result}</td>
        <td class="result-cell">${item.unit}</td>
        <td class="result-cell">${item.normalRange}</td>
        <td class="result-cell">
          <span class="status-badge" style="background-color: ${statusColor}20; color: ${statusColor};">
            ${statusText}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #21AEA8;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #21AEA8;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
          }
          .result-title {
            text-align: center;
            font-size: 22px;
            font-weight: bold;
            color: #21AEA8;
            margin: 20px 0;
            text-transform: uppercase;
          }
          .patient-info {
            background-color: #E8F5F3;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
          }
          .patient-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .info-item {
            display: flex;
            flex-direction: column;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            font-weight: bold;
            margin-bottom: 3px;
          }
          .info-value {
            font-size: 14px;
            color: #333;
          }
          .results-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          .results-table th {
            background-color: #21AEA8;
            color: white;
            padding: 12px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
          }
          .result-cell {
            padding: 12px;
            border-bottom: 1px solid #eee;
            font-size: 13px;
          }
          .result-value {
            font-weight: bold;
            color: #21AEA8;
          }
          .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
          }
          .remarks-section {
            margin-top: 30px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }
          .remarks-title {
            font-weight: bold;
            color: #21AEA8;
            margin-bottom: 8px;
          }
          .signatures {
            margin-top: 40px;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 40px;
          }
          .signature-box {
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #333;
            margin: 40px 20px 10px 20px;
          }
          .signature-label {
            font-size: 12px;
            color: #666;
          }
          .signature-name {
            font-weight: bold;
            margin-bottom: 3px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            font-size: 11px;
            color: #666;
          }
          .confidential {
            color: #ff6b6b;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .watermark {
            margin-top: 15px;
            font-size: 10px;
            color: #ccc;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MDLAB Direct</div>
          <div class="subtitle">Medical Laboratory Services</div>
          <div class="subtitle">Nueva Vizcaya, Philippines</div>
          <div class="subtitle">License No: LAB-2024-001 | Contact: (078) 123-4567</div>
        </div>

        <div class="result-title">${testName}</div>

        <div class="patient-info">
          <div class="patient-info-grid">
            <div class="info-item">
              <span class="info-label">Patient Name</span>
              <span class="info-value">${patientName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date</span>
              <span class="info-value">${date}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Age</span>
              <span class="info-value">${patientAge} years</span>
            </div>
            <div class="info-item">
              <span class="info-label">Gender</span>
              <span class="info-value">${patientGender}</span>
            </div>
          </div>
        </div>

        <table class="results-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Result</th>
              <th>Unit</th>
              <th>Normal Range</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${resultRowsHTML}
          </tbody>
        </table>

        ${remarks ? `
        <div class="remarks-section">
          <div class="remarks-title">Remarks:</div>
          <div>${remarks}</div>
        </div>
        ` : ''}

        <div class="signatures">
          ${labTechnician ? `
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">${labTechnician}</div>
            <div class="signature-label">Medical Technologist</div>
          </div>
          ` : ''}
          ${doctorName ? `
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">${doctorName}</div>
            <div class="signature-label">Pathologist</div>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <div class="confidential">CONFIDENTIAL MEDICAL DOCUMENT</div>
          <div>This report is intended solely for the patient named above.</div>
          <div>Results should be interpreted by a qualified physician.</div>
          <div class="watermark">Generated on ${new Date().toLocaleString()}</div>
        </div>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Save or Print Test Result',
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Success', 'Test result PDF generated successfully!');
    }
    
    return uri;
  } catch (error) {
    console.error('Error generating test result PDF:', error);
    Alert.alert('Error', 'Failed to generate test result PDF');
    throw error;
  }
}

/**
 * Print directly (if available on the platform)
 */
export async function printHTML(html: string) {
  try {
    await Print.printAsync({ html });
  } catch (error) {
    console.error('Error printing:', error);
    Alert.alert('Error', 'Failed to print document');
    throw error;
  }
}
