import React from 'react';

// Simple fallback component to test if React is working
const SimpleApp = () => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e293b, #7c3aed, #3730a3)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
        🎯 Line OA Dashboard
      </h1>
      
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(10px)',
        maxWidth: '600px'
      }}>
        <h2 style={{ color: '#a78bfa', marginBottom: '15px' }}>
          ✅ Dashboard โหลดสำเร็จแล้ว!
        </h2>
        
        <p style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
          ระบบ React ทำงานปกติ กำลังรอ Backend เพื่อเชื่อมต่อกับ LINE API
        </p>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '15px',
          marginTop: '20px'
        }}>
          <div style={{ 
            backgroundColor: 'rgba(34, 197, 94, 0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            <div style={{ fontSize: '2rem' }}>📱</div>
            <div>Frontend</div>
            <div style={{ color: '#4ade80' }}>Ready</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(239, 68, 68, 0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <div style={{ fontSize: '2rem' }}>🖥️</div>
            <div>Backend</div>
            <div style={{ color: '#f87171' }}>Pending</div>
          </div>
          
          <div style={{ 
            backgroundColor: 'rgba(168, 85, 247, 0.2)', 
            padding: '15px', 
            borderRadius: '10px',
            border: '1px solid rgba(168, 85, 247, 0.3)'
          }}>
            <div style={{ fontSize: '2rem' }}>🤖</div>
            <div>LINE API</div>
            <div style={{ color: '#a78bfa' }}>Waiting</div>
          </div>
        </div>
        
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '10px',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <h3 style={{ color: '#60a5fa', marginBottom: '10px' }}>
            🚀 ขั้นตอนถัดไป
          </h3>
          <p style={{ fontSize: '0.9rem', textAlign: 'left' }}>
            1. Deploy Backend Server บน Vercel<br/>
            2. ตั้งค่า Environment Variables<br/>
            3. เชื่อมต่อ LINE Webhook<br/>
            4. ทดสอบระบบ Real-time
          </p>
        </div>
      </div>
      
      <p style={{ 
        marginTop: '20px', 
        fontSize: '0.8rem', 
        opacity: 0.7 
      }}>
        Dashboard Version: {new Date().toLocaleString('th-TH')}
      </p>
    </div>
  );
};

export default SimpleApp;