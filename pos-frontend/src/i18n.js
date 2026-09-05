// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      LOGIN: {
        TITLE: "تسجيل الدخول إلى النظام",
        SUBTITLE: "أدخل بياناتك للوصول إلى نظام الكاشير",
        USERNAME: "اسم المستخدم",
        USERNAME_PLACEHOLDER: "أدخل اسم المستخدم",
        PASSWORD: "كلمة المرور",
        PASSWORD_PLACEHOLDER: "أدخل كلمة المرور",
        SUBMIT: "تسجيل الدخول",
        AUTHENTICATING: "جاري التحقق...",
        DEMO_ACCOUNTS: "الحسابات التجريبية"
      },
      ERRORS: {
        MISSING_CREDENTIALS: "يرجى إدخال اسم المستخدم وكلمة المرور",
        USER_NOT_FOUND: "المستخدم غير موجود",
        INVALID_PASSWORD: "كلمة المرور غير صحيحة",
        CONNECTION_ERROR: "تعذر الاتصال بالسيرفر. يرجى التأكد من تشغيل الـ Backend",
        INTERNAL_SERVER_ERROR: "حدث خطأ غير متوقع في السيرفر"
      }
    }
  },
  en: {
    translation: {
      LOGIN: {
        TITLE: "Sign In to POS",
        SUBTITLE: "Enter your credentials to access the register",
        USERNAME: "Username",
        USERNAME_PLACEHOLDER: "Enter your username",
        PASSWORD: "Password",
        PASSWORD_PLACEHOLDER: "Enter your password",
        SUBMIT: "Sign In",
        AUTHENTICATING: "Authenticating...",
        DEMO_ACCOUNTS: "Demo Accounts"
      },
      ERRORS: {
        MISSING_CREDENTIALS: "Please enter username and password",
        USER_NOT_FOUND: "User not found",
        INVALID_PASSWORD: "Incorrect password",
        CONNECTION_ERROR: "Connection error. Please check your backend server",
        INTERNAL_SERVER_ERROR: "An unexpected server error occurred"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ar', 
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;