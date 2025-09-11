import { CheckCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const ContactSuccess = () => {
  return (
    <div className="contact-success-container">
      <div className="success-content">
        <CheckCircle className="success-icon" />
        <h1>Message Sent Successfully!</h1>
        <p>Thank you for contacting us. We've received your message and will get back to you within 24 hours.</p>
        
        <div className="success-actions">
          <Link to="/" className="btn-primary">
            <ArrowLeft className="btn-icon" />
            Back to Home
          </Link>
          <Link to="/tracking" className="btn-secondary">
            Continue to Tracking
          </Link>
        </div>
        
        <div className="next-steps">
          <h3>What happens next?</h3>
          <ul>
            <li>We'll review your message within 2-4 hours</li>
            <li>You'll receive a response via email</li>
            <li>For urgent matters, check our FAQ section</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ContactSuccess