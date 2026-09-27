"use client";
import { useState, useEffect } from "react";
import styles from "./contact.module.css";

export default function ContactPage() {
  const [phone, setPhone] = useState("07513164168");
  const [whatsapp, setWhatsapp] = useState("917697276999");
  const [email, setEmail] = useState("Atlanticexcellenceacademy@gmail.com");
  const [address, setAddress] = useState(
    "Atlantic Public School, GH-1744, Gate No.-2, D.D.Nagar, Gwalior (MP)"
  );
  const [mapUrl, setMapUrl] = useState(
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14316.517336782298!2d78.22687135!3d26.22495865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3976c6b3e9458fcd%3A0xc6651261d7b05615!2sMorar%2C%20Gwalior%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
  );

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.info) {
          const info = data.info;
          if (info.phone) setPhone(info.phone);
          if (info.whatsapp) setWhatsapp(info.whatsapp);
          if (info.email) setEmail(info.email);
          if (info.address) setAddress(info.address);
          if (info.mapEmbedUrl) setMapUrl(info.mapEmbedUrl);
        }
      })
      .catch(() => {
        // keep default values if API fails
      });
  }, []);

  return (
    <div className={styles.container}>
      {/* Hero Banner */}
      <div className={styles.hero}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.heroSub}>
          We&apos;d love to hear from you — reach out for admissions, queries, or feedback.
        </p>
      </div>

      <div className={styles.grid}>
        {/* Info Card */}
        <div className={styles.infoCard}>
          <h3>Get In Touch</h3>
          <p>Our team is available Monday to Saturday, 8 AM – 4 PM. We&apos;ll get back to you as soon as possible.</p>

          <div className={styles.contactDetails}>
            <div className={styles.detailItem}>
              <span className={styles.icon}>📍</span>
              <div>
                <strong>Address</strong>
                <p>{address}</p>
              </div>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.icon}>📞</span>
              <div>
                <strong>Phone</strong>
                <p><a href={`tel:${phone}`}>{phone}</a></p>
              </div>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.icon}>✉️</span>
              <div>
                <strong>Email</strong>
                <p><a href={`mailto:${email}`}>{email}</a></p>
              </div>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.icon}>🕐</span>
              <div>
                <strong>School Hours</strong>
                <p>Monday – Saturday: 8:00 AM – 4:00 PM</p>
              </div>
            </div>
          </div>

          <a
            href={`https://wa.me/${whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappBtn}
          >
            📱 Message on WhatsApp
          </a>
        </div>

        {/* Map Card */}
        <div className={styles.mapCard}>
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0, minHeight: "480px" }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </div>
  );
}

