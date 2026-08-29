import React, { useState } from 'react';
import { useNavigate as useNav } from 'react-router-dom';
import api from '../api/axiosInstance'; // استيراد ملف axios الذي أنشأناه

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNav();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // إرسال طلب تسجيل الدخول للباك إند
      const response = await api.post('/login', { username, password });

      // 1. حفظ التوكن والدور في localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);

      // 2. التوجيه الذكي حسب الدور
      if (response.data.role === 'manager') {
        navigate('/inventory');
      } else {
        navigate('/');
      }
    } catch (err) {
      // عرض رسالة الخطأ القادمة من الباك إند
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError('حدث خطأ في الاتصال بالسيرفر');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2>تسجيل الدخول للنظام</h2>
        
        {error && <div style={styles.errorMessage}>{error}</div>}

        <div style={styles.inputGroup}>
          <label>اسم المستخدم:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="أدخل اسم المستخدم"
            style={styles.input}
          />
        </div>

        <div style={styles.inputGroup}>
          <label>كلمة السر:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="أدخل كلمة السر"
            style={styles.input}
          />
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'جاري التحقق...' : 'دخول'}
        </button>

        <div style={styles.hint}>
          <small>حساب التجربة للمدير: admin / 123456</small><br/>
          <small>حساب التجربة للكاشير: cashier / 123456</small>
        </div>
      </form>
    </div>
  );
}

// تنسيقات بسيطة وسريعة
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f6f8',
    direction: 'rtl'
  },
  card: {
    padding: '30px',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '320px',
    textAlign: 'center'
  },
  inputGroup: {
    marginBottom: '15px',
    textAlign: 'right'
  },
  input: {
    width: '100%',
    padding: '10px',
    marginTop: '5px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    boxSizing: 'border-box'
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px'
  },
  errorMessage: {
    color: 'red',
    marginBottom: '15px',
    fontSize: '14px'
  },
  hint: {
    marginTop: '20px',
    color: '#6c757d',
    borderTop: '1px solid #eee',
    paddingTop: '10px'
  }
};

export default Login;