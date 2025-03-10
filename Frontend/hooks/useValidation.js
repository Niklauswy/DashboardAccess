import { useState } from 'react';

export function useValidation() {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  
  const validatePassword = (password) => {
    if (!password) {
      return "La contraseña es obligatoria";
    }
    
    if (!passwordRegex.test(password)) {
      return "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una minúscula y un número";
    }
    
    return null; // Sin error
  };
  
  const validateField = (value, fieldName) => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `El campo ${fieldName} es obligatorio`;
    }
    return null;
  };
  
  const validateArray = (array, fieldName) => {
    if (!Array.isArray(array) || array.length === 0) {
      return `Debe seleccionar al menos un ${fieldName}`;
    }
    return null;
  };
  
  return {
    validatePassword,
    validateField,
    validateArray,
    passwordRegex,
  };
}
