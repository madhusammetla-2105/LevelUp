import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PinModal.css';

const PinModal = ({ onUnlock, onForgotPin }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [isSetup, setIsSetup] = useState(false);
  const [setupStep, setSetupStep] = useState(1);
  const [tempPin, setTempPin] = useState('');
  
  const navigate = useNavigate();

  const savedPin = localStorage.getItem('parent_pin') || '1234';

  useEffect(() => {
    const isFirstTime = !localStorage.getItem('parent_pin_set');
    if (isFirstTime) {
      setIsSetup(true);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleInput = (index, value) => {
    if (lockoutTime > 0) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleUnlock = () => {
    const enteredPin = pin.join('');
    if (enteredPin.length !== 4) return;

    if (isSetup) {
      if (setupStep === 1) {
        setTempPin(enteredPin);
        setSetupStep(2);
        setPin(['', '', '', '']);
      } else {
        if (enteredPin === tempPin) {
          localStorage.setItem('parent_pin', enteredPin);
          localStorage.setItem('parent_pin_set', 'true');
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setError(false), 500);
          setSetupStep(1);
          setPin(['', '', '', '']);
          alert("PINs don't match. Try again.");
        }
      }
    } else {
      if (enteredPin === savedPin) {
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(true);
        setTimeout(() => setError(false), 500);
        setPin(['', '', '', '']);

        if (newAttempts >= 3) {
          setLockoutTime(30);
          setAttempts(0);
        }
      }
    }
  };

  return (
    <div className="pin-modal-overlay">
      <button 
        className="pin-modal-back-btn" 
        onClick={() => navigate(-1)}
        title="Go Back"
      >
        <span className="material-symbols-outlined">arrow_back</span>
      </button>
      
      <div className={`pin-modal-card ${error ? 'shake' : ''}`}>
        <div className="pin-icon-container">
          <span className="material-symbols-outlined shield-icon">
            {lockoutTime > 0 ? 'lock_clock' : 'shield_lock'}
          </span>
        </div>
        
        <h2>{isSetup ? 'Setup Parent PIN' : 'Parent Corner'}</h2>
        <p className="pin-subtitle">
          {lockoutTime > 0 
            ? `Too many attempts. Locked for ${lockoutTime}s`
            : isSetup 
              ? (setupStep === 1 ? 'Create a 4-digit PIN for security.' : 'Confirm your new PIN.')
              : 'This section is protected. Enter your Parent PIN to continue.'}
        </p>

        <div className="pin-inputs">
          {pin.map((digit, i) => (
            <div key={i} className={`pin-box ${digit ? 'filled' : ''}`}>
              <input
                id={`pin-${i}`}
                type="password"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInput(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                disabled={lockoutTime > 0}
                autoComplete="off"
              />
              <div className="pin-dot"></div>
            </div>
          ))}
        </div>

        {!isSetup && attempts > 0 && lockoutTime === 0 && (
          <p className="attempts-text">Remaining attempts: {3 - attempts}</p>
        )}

        <button 
          className="unlock-btn" 
          onClick={handleUnlock}
          disabled={pin.join('').length !== 4 || lockoutTime > 0}
        >
          {isSetup ? (setupStep === 1 ? 'Next' : 'Save PIN') : 'Unlock'}
        </button>

        <button className="forgot-link" onClick={onForgotPin}>
          Forgot PIN? Contact Support
        </button>
      </div>
    </div>
  );
};

export default PinModal;
