"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import LeadForm from "@/components/LeadForm";

function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

export default function Home() {
  const [isLeadFormOpen, setIsLeadFormOpen] = useState(false);
  const [heroUrl, setHeroUrl] = useState<string>('');
  const years   = useCountUp(15);
  const students = useCountUp(500);
  const teachers = useCountUp(40);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const h = data.settings.find((s: any) => s.key === 'hero_image_url');
          if (h && h.value) setHeroUrl(h.value);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ===== HERO ===== */}
      <section 
        className={styles.hero} 
        style={heroUrl ? { backgroundImage: `url(${heroUrl})`, backgroundColor: 'var(--primary)' } : {}}
      >
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={`${styles.heroBadge} animate-fade-in`}>
            🏆 &nbsp; Affiliated & Recognized School — Gwalior, MP
          </div>
          <h1 className={`${styles.heroSchoolName} animate-fade-in-2`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span>Firststeps</span>
            <span style={{ fontSize: '0.45em', letterSpacing: '4px', fontWeight: 600, marginTop: '5px' }}>Excellence Academy</span>
          </h1>
          <p className={`${styles.heroTagline} animate-fade-in-2`}>
            ✦ Empowering Minds &nbsp;·&nbsp; Shaping Futures &nbsp;·&nbsp; Building Leaders ✦
          </p>
          <p className={`${styles.heroSubtitle} animate-fade-in-3`}>
            Where vision meets modern education — nurturing confident, compassionate leaders of tomorrow in Gwalior, MP.
          </p>
          <div className={`${styles.ctaGroup} animate-fade-in-3`}>
            <button className="btn-primary" onClick={() => setIsLeadFormOpen(true)}>
              ✨ Admissions Open
            </button>
            <Link href="/about" className="btn-secondary">
              Explore Our School →
            </Link>
          </div>
        </div>
        <div className={styles.heroScrollIndicator}>
          <div className={styles.scrollDot} />
        </div>
      </section>

      {/* ===== STATS BAR ===== */}
      <section className={styles.statsBar}>
        <div className={styles.statItem} ref={years.ref}>
          <div className={styles.statNumber}>{years.count}+</div>
          <div className={styles.statLabel}>Years of Excellence</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem} ref={students.ref}>
          <div className={styles.statNumber}>{students.count}+</div>
          <div className={styles.statLabel}>Happy Students</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem} ref={teachers.ref}>
          <div className={styles.statNumber}>{teachers.count}+</div>
          <div className={styles.statLabel}>Expert Teachers</div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div className={styles.statNumber}>100%</div>
          <div className={styles.statLabel}>Pass Rate</div>
        </div>
      </section>

      {/* ===== ABOUT SECTION ===== */}
      <section className={styles.aboutSection}>
        <div className={`${styles.aboutText} animate-slide-left`}>
          <span className="section-label">Our Story</span>
          <h2 className={`section-title-display ${styles.aboutHeading}`}>
            A Legacy of <span className="gradient-text">Excellence</span> in Education
          </h2>
          <p className={styles.aboutPara}>
            At Firststeps Excellence Academy, we believe every child is a unique gift. With a holistic approach — blending academic rigor, cultural values, and modern innovation, we nurture every student to reach their full potential.
          </p>
          <p className={styles.aboutPara}>
            Our dedicated faculty, state-of-the-art facilities, and vibrant co-curricular programs ensure that every student reaches their full potential and steps out as a confident, compassionate global citizen.
          </p>
          <div className={styles.aboutActions}>
            <Link href="/about" className="btn-outline">Read Our Story →</Link>
          </div>
        </div>
        <div className={`${styles.aboutImageWrap} animate-slide-right`}>
          <img
            src="/images/about_kids.jpg"
            alt="School Activities & Events at Firststeps Excellence Academy"
            className={styles.aboutImg}
          />
          <div className={styles.aboutImageBadge}>
            <span className={styles.badgeIcon}>🎓</span>
            <div>
              <div className={styles.badgeNum}>15+</div>
              <div className={styles.badgeText}>Years of Trust</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES / WHY US ===== */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresSectionHeader}>
          <span className="section-label">Why Choose Us</span>
          <h2 className="section-title-display">
            What Makes Us <span className="gradient-text">Special</span>
          </h2>
        </div>
        <div className={styles.featuresGrid}>
          {[
            { image: "/images/feature_kids_play.jpg", title: "Play & Learn", desc: "Rigorous curriculum designed to challenge and inspire every student to reach their highest potential." },
            { image: "/images/feature_kids_study.jpg", title: "Creative Activities", desc: "Rich co-curricular programs — dance, music, art, drama — celebrating India's diverse heritage." },
            { image: "/images/about_kids.jpg", title: "Fun & Games", desc: "State-of-the-art sports facilities encouraging physical health, teamwork, and competitive spirit." },
            { image: "/images/feature_kids_study.jpg", title: "Interactive Learning", desc: "Fully equipped science and computer labs giving hands-on learning experiences to students." },
            { image: "/images/feature_kids_play.jpg", title: "Holistic Development", desc: "We nurture character, confidence, and compassion alongside academic skills." },
            { image: "/images/hero_kids.jpg", title: "Happy Kids", desc: "We keep parents closely involved through regular PTMs, digital updates, and open communication." },
          ].map((f) => (
            <div key={f.title} className={`${styles.featureCard} card-hover`}>
              <img src={f.image} alt={f.title} className={styles.featureImage} />
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA BANNER ===== */}
      <section 
        className={styles.ctaBanner}
        style={heroUrl ? { backgroundImage: `url(${heroUrl})`, backgroundColor: 'var(--primary)' } : {}}
      >
        <div className={styles.ctaBannerContent}>
          <h2 className={styles.ctaBannerTitle}>Admissions are Now Open!</h2>
          <p className={styles.ctaBannerSub}>
            Give your child the best start in life. Limited seats available for 2025-26.
          </p>
          <button className={styles.ctaBannerBtn} onClick={() => setIsLeadFormOpen(true)}>
            Apply for Admission →
          </button>
        </div>
      </section>

      <LeadForm isOpen={isLeadFormOpen} onClose={() => setIsLeadFormOpen(false)} />
    </>
  );
}
