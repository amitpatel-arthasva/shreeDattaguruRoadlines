import apiService from './apiService.js';

class InvoiceService {
  // Get all invoices (generated from lorry receipts) with filtering and pagination
  async getInvoices(params = {}) {
    try {
      const { page = 1, limit = 10, search } = params;

      let sql = `
        SELECT 
          lr.id,
          lr.cn_number as lorryReceiptNumber,
          lr.lr_date as date,
          lr.freight,
          lr.hamali,
          lr.aoc,
          lr.door_delivery,
          lr.detention,
          lr.collection,
          lr.st_charge as service_charge,
          lr.extra_loading,
          lr.total as totalAmount,
          lr.payment_type,
          lr.from_location,
          lr.to_location,
          lr.truck_number,
          lr.actual_weight,
          lr.chargeable_weight,
          lr.delivery_at,
          lr.remarks,
          cons_or.name as consignor_name,
          cons_or.address as consignor_address,
          cons_or.city as consignor_city,
          cons_or.state as consignor_state,
          cons_or.pin_code as consignor_pincode,
          cons_or.gstin as consignor_gstin,
          cons_or.pan as consignor_pan,
          cons_ee.name as consignee_name,
          cons_ee.address as consignee_address,
          cons_ee.city as consignee_city,
          cons_ee.state as consignee_state,
          cons_ee.pin_code as consignee_pincode,
          cons_ee.gstin as consignee_gstin,
          cons_ee.pan as consignee_pan,
          t.truck_number as truck_reg_number,
          t.truck_type,
          t.capacity_ton,
          t.owner_name,
          d.name as driver_name,
          d.phone as driver_phone,
          d.license_number,
          d.address as driver_address
        FROM lorry_receipts lr
        LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
        LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
        LEFT JOIN trucks t ON lr.truck_id = t.id
        LEFT JOIN drivers d ON lr.driver_id = d.id
        WHERE 1=1
      `;
      
      const queryParams = [];      // Add search filters
      if (search) {
        sql += ` AND (
          cons_or.name LIKE ? OR 
          cons_ee.name LIKE ? OR 
          lr.truck_number LIKE ? OR
          t.truck_number LIKE ? OR
          lr.cn_number LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      sql += ` ORDER BY lr.lr_date DESC, lr.created_at DESC`;
      
      // Add pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total
        FROM lorry_receipts lr
        LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
        LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
        LEFT JOIN trucks t ON lr.truck_id = t.id
        WHERE 1=1
      `;
        const countParams = [];
      if (search) {
        countSql += ` AND (
          cons_or.name LIKE ? OR 
          cons_ee.name LIKE ? OR 
          lr.truck_number LIKE ? OR
          t.truck_number LIKE ? OR
          lr.cn_number LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      const lorryReceipts = await apiService.query(sql, queryParams);
      const countResult = await apiService.query(countSql, countParams);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Transform data to invoice format
      const invoices = lorryReceipts.map(lr => {
        // Parse JSON fields safely
        let nosArray = [];
        let particularsArray = [];
        
        try {
          if (lr.nos && lr.nos !== 'null' && lr.nos.trim() !== '') {
            nosArray = JSON.parse(lr.nos);
          }
        } catch (error) {
          console.warn('Failed to parse nos JSON:', lr.nos, error);
          nosArray = [];
        }
        
        try {
          if (lr.particulars && lr.particulars !== 'null' && lr.particulars.trim() !== '') {
            particularsArray = JSON.parse(lr.particulars);
          }
        } catch (error) {
          console.warn('Failed to parse particulars JSON:', lr.particulars, error);
          particularsArray = [];
        }

        // Calculate total amount
        const freight = parseFloat(lr.freight || 0);
        const hamali = parseFloat(lr.hamali || 0);
        const aoc = parseFloat(lr.aoc || 0);
        const doorDelivery = parseFloat(lr.door_delivery || 0);
        const detention = parseFloat(lr.detention || 0);
        const collection = parseFloat(lr.collection || 0);
        const serviceCharge = parseFloat(lr.service_charge || 0);
        const extraLoading = parseFloat(lr.extra_loading || 0);
        
        const totalAmount = freight + hamali + aoc + doorDelivery + detention + collection + serviceCharge + extraLoading;

        return {
          id: lr.id,
          invoiceNumber: `INV-${lr.lorryReceiptNumber}`,
          lorryReceiptNumber: lr.lorryReceiptNumber,
          date: lr.date,
          status: lr.payment_type === 'paid' ? 'completed' : 'pending',
          consignor: {
            consignorName: lr.consignor_name,
            address: lr.consignor_address,
            city: lr.consignor_city,
            state: lr.consignor_state,
            pinCode: lr.consignor_pincode,
            gstin: lr.consignor_gstin,
            pan: lr.consignor_pan
          },
          consignee: {
            consigneeName: lr.consignee_name,
            address: lr.consignee_address,
            city: lr.consignee_city,
            state: lr.consignee_state,
            pinCode: lr.consignee_pincode,
            gstin: lr.consignee_gstin,
            pan: lr.consignee_pan
          },
          truckNumber: lr.truck_number || lr.truck_reg_number,
          driverName: lr.driver_name,
          driverPhone: lr.driver_phone,
          fromLocation: lr.from_location,
          toLocation: lr.to_location,
          freight: freight,
          hamali: hamali,
          aoc: aoc,
          doorDelivery: doorDelivery,
          detention: detention,
          collection: collection,
          serviceCharge: serviceCharge,
          extraLoading: extraLoading,
          totalAmount: totalAmount,
          paymentType: lr.payment_type,
          actualWeight: lr.actual_weight,
          chargeableWeight: lr.chargeable_weight,
          deliveryAt: lr.delivery_at,
          remarks: lr.remarks,
          nos: nosArray,
          particulars: particularsArray
        };
      });
      
      return {
        success: true,
        data: {
          invoices,
          totalPages,
          currentPage: page,
          total
        }
      };
    } catch (error) {
      console.error('Error in getInvoices:', error);
      throw error;
    }
  }

  // Get invoice by ID (from lorry receipt ID)
  async getInvoiceById(id) {
    try {
      const sql = `
        SELECT 
          lr.*,
          cons_or.name as consignor_name,
          cons_or.address as consignor_address,
          cons_or.city as consignor_city,
          cons_or.state as consignor_state,
          cons_or.pin_code as consignor_pincode,
          cons_or.gstin as consignor_gstin,
          cons_or.pan as consignor_pan,
          cons_ee.name as consignee_name,
          cons_ee.address as consignee_address,
          cons_ee.city as consignee_city,
          cons_ee.state as consignee_state,
          cons_ee.pin_code as consignee_pincode,
          cons_ee.gstin as consignee_gstin,
          cons_ee.pan as consignee_pan,
          t.truck_number as truck_reg_number,
          t.truck_type,
          t.capacity_ton,
          t.owner_name,
          d.name as driver_name,
          d.phone as driver_phone,
          d.license_number,
          d.address as driver_address
        FROM lorry_receipts lr
        LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
        LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
        LEFT JOIN trucks t ON lr.truck_id = t.id
        LEFT JOIN drivers d ON lr.driver_id = d.id
        WHERE lr.id = ?
      `;
      
      const result = await apiService.query(sql, [id]);
      
      if (!result || result.length === 0) {
        throw new Error('Invoice not found');
      }

      const lr = result[0];

      // Parse JSON fields safely
      let nosArray = [];
      let particularsArray = [];
      
      try {
        if (lr.nos && lr.nos !== 'null' && lr.nos.trim() !== '') {
          nosArray = JSON.parse(lr.nos);
        }
      } catch (error) {
        console.warn('Failed to parse nos JSON:', lr.nos, error);
        nosArray = [];
      }
      
      try {
        if (lr.particulars && lr.particulars !== 'null' && lr.particulars.trim() !== '') {
          particularsArray = JSON.parse(lr.particulars);
        }
      } catch (error) {
        console.warn('Failed to parse particulars JSON:', lr.particulars, error);
        particularsArray = [];
      }

      // Calculate total amount
      const freight = parseFloat(lr.freight || 0);
      const hamali = parseFloat(lr.hamali || 0);
      const aoc = parseFloat(lr.aoc || 0);
      const doorDelivery = parseFloat(lr.door_delivery || 0);
      const detention = parseFloat(lr.detention || 0);
      const collection = parseFloat(lr.collection || 0);
      const serviceCharge = parseFloat(lr.st_charge || 0);
      const extraLoading = parseFloat(lr.extra_loading || 0);
      
      const totalAmount = freight + hamali + aoc + doorDelivery + detention + collection + serviceCharge + extraLoading;

      const invoice = {
        id: lr.id,
        invoiceNumber: `INV-${lr.cn_number}`,
        lorryReceiptNumber: lr.cn_number,
        date: lr.lr_date,
        status: lr.payment_type === 'paid' ? 'completed' : 'pending',
        consignor: {
          consignorName: lr.consignor_name,
          address: lr.consignor_address,
          city: lr.consignor_city,
          state: lr.consignor_state,
          pinCode: lr.consignor_pincode,
          gstin: lr.consignor_gstin,
          pan: lr.consignor_pan
        },
        consignee: {
          consigneeName: lr.consignee_name,
          address: lr.consignee_address,
          city: lr.consignee_city,
          state: lr.consignee_state,
          pinCode: lr.consignee_pincode,
          gstin: lr.consignee_gstin,
          pan: lr.consignee_pan
        },
        truckNumber: lr.truck_number || lr.truck_reg_number,
        driverName: lr.driver_name,
        driverPhone: lr.driver_phone,
        fromLocation: lr.from_location,
        toLocation: lr.to_location,
        freight: freight,
        hamali: hamali,
        aoc: aoc,
        doorDelivery: doorDelivery,
        detention: detention,
        collection: collection,
        serviceCharge: serviceCharge,
        extraLoading: extraLoading,
        totalAmount: totalAmount,
        paymentType: lr.payment_type,
        actualWeight: lr.actual_weight,
        chargeableWeight: lr.chargeable_weight,
        deliveryAt: lr.delivery_at,
        remarks: lr.remarks,
        nos: nosArray,
        particulars: particularsArray
      };

      return {
        success: true,
        data: invoice
      };
    } catch (error) {
      console.error('Error in getInvoiceById:', error);
      throw error;
    }
  }

  // Download invoice PDF
  async downloadInvoicePdf(id) {
    try {
      const invoice = await this.getInvoiceById(id);
      if (!invoice.success) {
        throw new Error('Failed to get invoice data');
      }

      // Use the existing PDF generation IPC handler
      if (window.electronAPI && window.electronAPI.generateInvoicePdf) {
        return await window.electronAPI.generateInvoicePdf(invoice.data);
      } else {
        // Fallback: generate PDF in the renderer process
        const { generatePdfFromTemplate } = await import('./pdfService.js');
        
        // Dynamic import to avoid top-level await issues
        let invoiceTemplate;
        try {
          const module = await import('../../electron/invoiceTemplate.js');
          invoiceTemplate = module.default;
        } catch (importError) {
          console.warn('Failed to import electron invoice template, using fallback:', importError);
          // Use a simple fallback template if import fails
          invoiceTemplate = (data) => {
            return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${data.invoiceNumber || 'Unknown'}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    .header { text-align: center; margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Shree Dattaguru Road Lines</h1>
    <h2>Invoice: ${data.invoiceNumber || 'N/A'}</h2>
    <p>Date: ${data.date || 'N/A'}</p>
  </div>
  <table>
    <tr>
      <th>Description</th>
      <th>Amount</th>
    </tr>
    <tr>
      <td>Freight</td>
      <td>₹${data.freight || 0}</td>
    </tr>
    <tr>
      <td>Total</td>
      <td><strong>₹${data.totalAmount || 0}</strong></td>
    </tr>
  </table>
</body>
</html>`;
          };
        }

        const pdfBuffer = await generatePdfFromTemplate(
          invoiceTemplate,
          invoice.data,
          {
            filename: `Invoice-${invoice.data.invoiceNumber}`,
            pdfOptions: {
              format: 'A4',
              printBackground: true,
              margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
            }
          }
        );

        return pdfBuffer;
      }
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      throw error;
    }
  }
}

export default new InvoiceService(); 