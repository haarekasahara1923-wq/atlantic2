import Link from "next/link";
import styles from "./Footer.module.css";

interface FooterProps {
  schoolName?: string;
  tagline?: string;
  address?: string;
  phone?: string;
  email?: string;
  logoUrl?: string;
}

export default function Footer({
  schoolName = "Atlantic-2 School",
  tagline = "Empowering Minds · Shaping Futures · Building Leaders",
  address = "Factory Road, Pinto Park, Gwalior",
  phone = "918962678915",
  email = "atlantic2@gmail.com",
  logoUrl,
}: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "15px" }}>
            <img 
              src={logoUrl || "/images/logo.jpg"} 
              alt={`${schoolName} Logo`} 
              style={{ width: '180px', height: '68px', borderRadius: '8px', objectFit: 'contain' }}
            />

          </div>
          <p className={styles.footerText}>{tagline}</p>
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <li><Link href="/about" className={styles.footerLink}>About Us</Link></li>
            <li><Link href="/gallery" className={styles.footerLink}>Gallery</Link></li>
            <li><Link href="/contact" className={styles.footerLink}>Contact Us</Link></li>
            <li><Link href="/admin/login" className={styles.footerLink}>Admin Login</Link></li>
          </ul>
        </div>
        
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Contact</h3>
          <p className={styles.footerText}>
            📍 {address}<br />
            📞 {phone}<br />
            ✉️ {email}
          </p>
        </div>
      </div>
      
      <div className={styles.copyright}>
        &copy; {new Date().getFullYear()} {schoolName}. All rights reserved.
      </div>
    </footer>
  );
}

