const Contact = () => {
    const containerStyle = {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  };

  const formStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb'
  };

  const inputStyle = {
    width: '100%',
    padding: '0.875rem 1rem',
    border: '2px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '1rem',
    marginBottom: '1rem',
    boxSizing: 'border-box'
  };
  return (
    <div style={containerStyle}>
      <h1 style={{textAlign: 'center', fontSize: '2.5rem', color: '#1f2937'}}>Contact Us</h1>
      <form name="contact" method="POST" data-netlify="true" style={formStyle}>
        <input type="hidden" name="form-name" value="contact" />
        
        <div>
          <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>Name</label>
          <input type="text" name="name" required style={inputStyle} />
        </div>
        
        <div>
          <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>Email</label>
          <input type="email" name="email" required style={inputStyle} />
        </div>
        
        <div>
          <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>Subject</label>
          <input type="text" name="subject" required style={inputStyle} />
        </div>
        
        <div>
          <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem'}}>Message</label>
          <textarea name="message" rows="5" required style={{...inputStyle, minHeight: '120px'}}></textarea>
        </div>
        
        <button type="submit" style={{
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          padding: '0.875rem 2rem',
          borderRadius: '8px',
          fontWeight: '600',
          width: '100%',
          cursor: 'pointer'
        }}>
          Send Message
        </button>
      </form>
    </div>
  )
}

export default Contact