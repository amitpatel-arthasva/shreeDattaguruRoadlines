
import apiService from './apiService.js';

class MemoService {
  // Update memo by id
  async updateMemo(memoId, memoData) {
    const {
      memo_number,
      memo_date,
      lorry_no,
      driver_name,
      ac_no,
      address,
      from_location,
      to_location,
      lorry_hire,
      advance,
      hamali,
      balance,
      payable_at,
      broker,
      table_data
    } = memoData;

    // Serialize table_data to JSON string for SQLite
    const serializedTableData = JSON.stringify(table_data);

    const sql = `UPDATE memos SET memo_number = ?, memo_date = ?, lorry_no = ?, driver_name = ?, ac_no = ?, address = ?, from_location = ?, to_location = ?, lorry_hire = ?, advance = ?, hamali = ?, balance = ?, payable_at = ?, broker = ?, table_data = ? WHERE id = ?`;
    const values = [
      memo_number,
      memo_date,
      lorry_no,
      driver_name,
      ac_no,
      address,
      from_location,
      to_location,
      lorry_hire,
      advance,
      hamali,
      balance,
      payable_at,
      broker,
      serializedTableData,
      memoId
    ];
    console.log('[updateMemo] SQL:', sql);
    console.log('[updateMemo] Values:', values);
    try {
      // Use apiService for DB query, matching other methods
      const result = await apiService.query(sql, values);
      console.log('[updateMemo] SQL result:', result);
      return result;
    } catch (error) {
      console.error('[updateMemo] SQL error:', error);
      throw error;
    }
  }
  // Delete memo by id (robust version)
  async deleteMemo(id) {
    try {
      // Check if memos table exists (database health check)
      const tableCheck = await apiService.query("SELECT name FROM sqlite_master WHERE type='table' AND name='memos'");
      if (!Array.isArray(tableCheck) || tableCheck.length === 0) {
        return { success: false, error: 'Memos table does not exist in the database.' };
      }
      // Attempt delete
      const result = await apiService.query('DELETE FROM memos WHERE id = ?', [id]);
      console.log('[deleteMemo] Raw result:', result);
      if (!result || typeof result !== 'object') {
        return { success: false, error: 'No response or invalid response from backend' };
      }
      if (typeof result.changes === 'number' && result.changes > 0) {
        return { success: true, changes: result.changes };
      } else if (result.success === true) {
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Memo not found or not deleted' };
      }
    } catch (error) {
      console.error('[deleteMemo] Error:', error);
      return { success: false, error: 'Failed to delete memo: ' + (error?.message || error) };
    }
  }
  // Get all memos with filtering and pagination
  async getMemos(params = {}) {
    try {
      const { page = 1, limit = 10, search } = params;

      // Build WHERE clause for search
      let whereClause = '';
      let whereParams = [];
      if (search) {
        whereClause = 'WHERE memo_number LIKE ?';
        whereParams.push(`%${search}%`);
      }

      // Get total count for pagination
      const countSql = `SELECT COUNT(*) as count FROM memos ${whereClause}`;
      const countResult = await apiService.query(countSql, whereParams);
      const totalRecords = countResult && countResult[0] ? countResult[0].count : 0;
      const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

      // Get paginated memos
      let sql = `SELECT * FROM memos ${whereClause} ORDER BY memo_date DESC, created_at DESC LIMIT ? OFFSET ?`;
      const offset = (page - 1) * limit;
      const queryParams = [...whereParams, limit, offset];
      let memos = await apiService.query(sql, queryParams);
      // If backend returns array, wrap it in expected object
      if (Array.isArray(memos)) {
        memos = memos;
      } else if (memos && memos.data && Array.isArray(memos.data.memos)) {
        memos = memos.data.memos;
      } else {
        memos = [];
      }

      return {
        success: true,
        data: {
          memos,
          currentPage: page,
          totalPages,
          totalRecords,
          hasMore: page < totalPages
        }
      };
    } catch (error) {
      console.error('Error fetching memos:', error);
      return {
        success: false,
        error: 'Failed to fetch memos'
      };
    }
  }

  // Get memo by ID
  async getMemoById(id) {
    try {
      const sql = `SELECT * FROM memos WHERE id = ?`;
      const result = await apiService.query(sql, [id]);
      if (result.length === 0) {
        return {
          success: false,
          error: 'Memo not found'
        };
      }
      // Parse table_data JSON to tableData array for UI compatibility
      let memo = result[0];
      if (memo.table_data) {
        try {
          memo.tableData = JSON.parse(memo.table_data);
        } catch (e) {
          memo.tableData = [];
        }
      } else {
        memo.tableData = [];
      }
      return {
        success: true,
        data: memo
      };
    } catch (error) {
      console.error('Error fetching memo by ID:', error);
      return {
        success: false,
        error: 'Failed to fetch memo details'
      };
    }
  }

  // Create new memo
  async createMemo(memoData) {
    try {
      // Extract all fields that match the memos table
      let {
        memo_number,
        memo_date,
        company_id,
        to_company,
        from_company,
        subject,
        content,
        priority,
        status,
        memo_type,
        reference_number,
        remarks,
        ...extraFields
      } = memoData;

      // Set safe defaults for NOT NULL fields if missing or empty
      memo_number = memo_number || `TRP-${Date.now().toString().slice(-6)}`;
      memo_date = memo_date || new Date().toISOString().split('T')[0];
      to_company = to_company || 'N/A';
      from_company = from_company || 'Shree Dattaguru Roadlines';
      subject = subject || 'N/A';
      content = content || 'N/A';
      priority = priority || 'medium';
      status = status || 'draft';
      memo_type = memo_type || 'internal';

      // Store any extra fields as JSON in remarks (if remarks is empty)
      let finalRemarks = remarks;
      if ((!remarks || remarks === '') && Object.keys(extraFields).length > 0) {
        finalRemarks = JSON.stringify(extraFields);
      }

      // Map advance_rs to advance
      const advance = memoData.advance_rs || memoData.advance || 0;
      // Store tableRows as JSON in table_data column
      const table_data = JSON.stringify(memoData.table_data || []);
      const sql = `
        INSERT INTO memos (
          memo_number, memo_date, lorry_no, driver_name, ac_no, address, from_location, to_location, lorry_hire, advance, hamali, balance, payable_at, broker, table_data, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `;

      const result = await apiService.query(sql, [
        memo_number, memo_date, memoData.lorry_no, memoData.driver_name, memoData.ac_no, memoData.address, memoData.from_location, memoData.to_location, memoData.lorry_hire, advance, memoData.hamali, memoData.balance, memoData.payable_at, memoData.broker, table_data
      ]);

      return {
        success: true,
        data: {
          id: result.insertId,
          memo_number
        }
      };
    } catch (error) {
      console.error('Error creating memo:', error);
      return {
        success: false,
        error: 'Failed to create memo'
      };
    }
  }

  // ...existing code...

  // Delete memo
  async deleteMemo(id) {
    try {
      const sql = 'DELETE FROM memos WHERE id = ?';
      await apiService.query(sql, [id]);

      return {
        success: true,
        data: { id }
      };
    } catch (error) {
      console.error('Error deleting memo:', error);
      return {
        success: false,
        error: 'Failed to delete memo'
      };
    }
  }

  // Generate memo number
  async generateMemoNumber() {
    try {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      
      // Get the latest memo number for current year
      const sql = `
        SELECT memo_number 
        FROM memos 
        WHERE memo_number LIKE ? 
        ORDER BY memo_number DESC 
        LIMIT 1
      `;
      
      const pattern = `MEMO-${year}${month}-%`;
      const result = await apiService.query(sql, [pattern]);
      
      let nextNumber = 1;
      if (result.length > 0) {
        const lastNumber = result[0].memo_number;
        const lastSequence = parseInt(lastNumber.split('-').pop());
        nextNumber = lastSequence + 1;
      }
      
      const memoNumber = `MEMO-${year}${month}-${String(nextNumber).padStart(4, '0')}`;
      return memoNumber;
    } catch (error) {
      console.error('Error generating memo number:', error);
      // Fallback number
      const timestamp = Date.now().toString().slice(-6);
      return `MEMO-${timestamp}`;
    }
  }

  // Get memo statistics
  async getMemoStats() {
    try {
      const totalSql = 'SELECT COUNT(*) as total FROM memos';
      const pendingSql = 'SELECT COUNT(*) as pending FROM memos WHERE status = ?';
      const completedSql = 'SELECT COUNT(*) as completed FROM memos WHERE status = ?';
      
      const [totalResult, pendingResult, completedResult] = await Promise.all([
        apiService.query(totalSql),
        apiService.query(pendingSql, ['pending']),
        apiService.query(completedSql, ['completed'])
      ]);
      
      return {
        success: true,
        data: {
          total: totalResult[0].total,
          pending: pendingResult[0].pending,
          completed: completedResult[0].completed
        }
      };
    } catch (error) {
      console.error('Error fetching memo statistics:', error);
      return {
        success: false,
        error: 'Failed to fetch memo statistics'
      };
    }
  }
}

export default new MemoService();
