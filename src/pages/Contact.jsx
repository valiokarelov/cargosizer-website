const Contact = () => {
  return (
    <div style={{
      maxWidth: '600px',
      margin: '2rem auto',
      padding: '2rem',
      background: '#f8fafc',
      minHeight: '100vh'
    }}>
      <h1 style={{
        textAlign: 'center',
        fontSize: '2.5rem',
        color: '#1f2937',
        marginBottom: '2rem'
      }}>Contact Us</h1>
      
      <form 
        name="contact" 
        method="POST" 
        data-netlify="true"
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb'
        }}
      >
        <input type="hidden" name="form-name" value="contact" />
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="name" style={{
            display: 'block',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Name</label>
          <input 
            type="text" 
            id="name" 
            name="name" 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="email" style={{
            display: 'block',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Email</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="subject" style={{
            display: 'block',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Subject</label>
          <input 
            type="text" 
            id="subject" 
            name="subject" 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="message" style={{
            display: 'block',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '0.5rem'
          }}>Message</label>
          <textarea 
            id="message" 
            name="message" 
            rows="5" 
            required 
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '2px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '1rem',
              boxSizing: 'border-box',
              minHeight: '120px'
            }}
          />
        </div>
        
        <button 
          type="submit"
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            fontWeight: '600',
            width: '100%',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Send Message
        </button>
      </form>
    </div>
  )
}

export default Contact