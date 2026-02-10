@@ -11,6 +11,26 @@ import Script from "next/script"
import { RECAPTCHA_SITE_KEY } from "@/lib/recaptcha-config"

function SignupContent() {
  // Helper to render reCAPTCHA widget reliably
  const renderRecaptcha = () => {
    if (typeof window === 'undefined' || !(window as any).grecaptcha) return false;
    const container = document.getElementById('recaptcha-container');
    if (container && !container.hasChildNodes()) {
      (window as any).grecaptcha.render('recaptcha-container', {
        sitekey: RECAPTCHA_SITE_KEY,
        callback: handleRecaptchaChange,
        'expired-callback': () => handleRecaptchaChange(null),
        'error-callback': () => {
          console.error('[v0] reCAPTCHA error occurred');
          setError('reCAPTCHA verification failed. Please try again.');
        },
      });
      console.log('[v0] reCAPTCHA widget rendered');
      return true;
    }
    return false;
  };

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
@@ -85,38 +105,32 @@ function SignupContent() {
    }
  }

  // Improved loadRecaptcha with retry
  const loadRecaptcha = () => {
    if (!RECAPTCHA_SITE_KEY) {
      console.log("[v0] reCAPTCHA not configured - skipping")
      return
      console.log('[v0] reCAPTCHA not configured - skipping');
      return;
    }

    console.log("[v0] reCAPTCHA API script loaded successfully")
    setRecaptchaLoaded(true)
    
    // Wait for DOM to be ready, then render reCAPTCHA
    setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).grecaptcha) {
        try {
          const container = document.getElementById('recaptcha-container')
          if (container && !container.hasChildNodes()) {
            (window as any).grecaptcha.render('recaptcha-container', {
              sitekey: RECAPTCHA_SITE_KEY,
              callback: handleRecaptchaChange,
              'expired-callback': () => handleRecaptchaChange(null),
              'error-callback': () => {
                console.error("[v0] reCAPTCHA error occurred")
                setError("reCAPTCHA verification failed. Please try again.")
              }
            })
            console.log("[v0] reCAPTCHA widget rendered")
          }
        } catch (err) {
          console.error("[v0] reCAPTCHA render error:", err)
        }
      }
    }, 100)
  }
    console.log('[v0] reCAPTCHA API script loaded successfully');
    setRecaptchaLoaded(true);
    // Try rendering immediately, then retry if not ready
    let attempts = 0;
    const maxAttempts = 10;
    const tryRender = () => {
      if (renderRecaptcha()) return;
      attempts++;
      if (attempts < maxAttempts) setTimeout(tryRender, 300);
      else console.error('[v0] reCAPTCHA failed to render after retries');
    };
    tryRender();
  };

  // Ensure reCAPTCHA renders after mount (for client navigation)
  useEffect(() => {
    if (window.grecaptcha && document.getElementById('recaptcha-container')) {
      renderRecaptcha();
    }
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
