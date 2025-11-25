import { useState } from 'react';
import axios from 'axios';

const API_URL = '/api';

const ExcelUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('excelFile', file);

    try {
      const response = await axios.post(`${API_URL}/upload-excel`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage({ 
        type: 'success', 
        text: `Successfully imported ${response.data.items.length} food items!` 
      });
      setFile(null);
      // Reset file input
      document.getElementById('excel-file').value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to upload file' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="card">
        <h2>Upload Excel File</h2>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          Upload an Excel file containing food items with their nutritional information.
          The file should have columns: <strong>Dish</strong>, <strong>Protein</strong>, <strong>Carbs</strong>, <strong>Fats</strong>, and <strong>Calories</strong>.
        </p>
        <div className="alert" style={{ 
          background: '#fff3cd', 
          color: '#856404', 
          border: '1px solid #ffc107',
          marginBottom: '20px'
        }}>
          <strong>Important:</strong> All nutritional values in your Excel file should be <strong>per 100 grams</strong>. 
          When you add food to meals, you'll specify the quantity in grams, and the app will calculate the exact values automatically.
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label>Select Excel File (.xlsx or .xls)</label>
            <div className="upload-area" onClick={() => document.getElementById('excel-file').click()}>
              <input
                id="excel-file"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
              />
              {file ? (
                <div>
                  <p style={{ fontWeight: '600', color: '#2563eb' }}>{file.name}</p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    margin: '0 auto 15px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: 'bold'
                  }}>XLS</div>
                  <p>Click to select an Excel file</p>
                  <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
                    Supports .xlsx and .xls formats
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Excel File Format</h3>
        <p style={{ marginBottom: '15px' }}>
          Your Excel file should have the following columns (column names are case-insensitive).
          <strong> All nutritional values must be per 100 grams.</strong>
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8f9fa' }}>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Column Name</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Description</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'left' }}>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Dish / Food / Name</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Name of the food item</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Chicken Breast</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Protein / P</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Protein in grams <strong>(per 100g)</strong></td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>31</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Carbs / C</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Carbohydrates in grams <strong>(per 100g)</strong></td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>0</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Fats / F</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Fats in grams <strong>(per 100g)</strong></td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>3.6</td>
            </tr>
            <tr>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Calories / Cal</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>Total calories <strong>(per 100g)</strong></td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>165</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelUpload;

