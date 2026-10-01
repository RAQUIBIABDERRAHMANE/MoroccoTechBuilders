'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import Link from 'next/link';
import { downloadVCardFile } from '@/lib/vcard';
import SaveContactModal from '@/components/SaveContactModal';
import styles from './attendees.module.css';

interface Attendee {
  id: string;
  fullName: string;
  classe: string;
  year: string;
  avatarUrl?: string;
  githubUsername?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  bio?: string;
  skills: string[];
  eventStatus?: 'registered' | 'attended';
  ticketId?: string;
}

export default function AttendeesPage() {
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState('ALL');
  const [selectedSkill, setSelectedSkill] = useState('ALL');
  const [selectedContact, setSelectedContact] = useState<Attendee | null>(null);

  useEffect(() => {
    async function loadDirectory() {
      setLoading(true);
      try {
        const res = await fetch('/api/directory');
        const data = await res.json();
        if (data.success) {
          setAttendees(data.attendees || []);
          setAvailableClasses(data.availableClasses || []);
          setAvailableSkills(data.availableSkills || []);
        }
      } catch (err) {
        console.error('Failed to load directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDirectory();
  }, []);

  const filteredAttendees = useMemo(() => {
    return attendees.filter((item) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = item.fullName.toLowerCase().includes(q);
        const matchesClass = item.classe.toLowerCase().includes(q);
        const matchesBio = (item.bio || '').toLowerCase().includes(q);
        const matchesSkill = item.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchesName && !matchesClass && !matchesBio && !matchesSkill) {
          return false;
        }
      }

      // Class filter
      if (selectedClass !== 'ALL') {
        if (item.classe.toUpperCase() !== selectedClass.toUpperCase()) {
          return false;
        }
      }

      // Skill filter
      if (selectedSkill !== 'ALL') {
        if (!item.skills.some((s) => s.toLowerCase() === selectedSkill.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [attendees, search, selectedClass, selectedSkill]);

  const getInitials = (name: string) => {
    if (!name) return 'MTB';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const cleanSocialUrl = (url?: string, platform: 'github' | 'linkedin' | 'portfolio' = 'portfolio') => {
    if (!url) return null;
    const clean = url.trim();
    if (platform === 'github') {
      if (clean.startsWith('http')) return clean;
      return `https://github.com/${clean.replace('@', '')}`;
    }
    if (platform === 'linkedin') {
      if (clean.startsWith('http')) return clean;
      return `https://linkedin.com/in/${clean.replace('@', '')}`;
    }
    if (clean.startsWith('http')) return clean;
    return `https://${clean}`;
  };

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main className={styles.mainContent}>
        <div className="container">
          {/* Hero Section */}
          <div className={styles.heroSection}>
            <div className={styles.heroTag}>
              <span className={styles.liveDot} />
              Communauté & Réseau MTB
            </div>
            <h1 className={styles.heroTitle}>Annuaire des Développeurs & Stagiaires</h1>
            <p className={styles.heroDesc}>
              Découvrez les talents participant à l'événement, explorez leurs compétences tech,
              et connectez-vous directement avec vos futurs collaborateurs.
            </p>

            <div className={styles.heroActions}>
              <Link href="/connect" className={styles.scanPeerBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M8 12h8M12 8v8" />
                </svg>
                Scanner un QR code camarade
              </Link>
              <Link href="/profile" className={styles.myProfileBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Modifier mon profil public
              </Link>
            </div>
          </div>

          {/* Filters Card */}
          <div className={styles.filterCard}>
            {/* Search Input */}
            <div className={styles.searchRow}>
              <svg className={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom, classe, compétence ou bio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className={styles.clearSearchBtn}
                  aria-label="Effacer la recherche"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Class Pill Filters */}
            <div className={styles.classesRow}>
              <button
                type="button"
                onClick={() => setSelectedClass('ALL')}
                className={`${styles.classPill} ${selectedClass === 'ALL' ? styles.classPillActive : ''}`}
              >
                Toutes les classes ({attendees.length})
              </button>
              {availableClasses.map((cls) => {
                const count = attendees.filter((a) => a.classe.toUpperCase() === cls.toUpperCase()).length;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`${styles.classPill} ${selectedClass === cls ? styles.classPillActive : ''}`}
                  >
                    Classe {cls} ({count})
                  </button>
                );
              })}
            </div>

            {/* Popular Skills Pills */}
            {availableSkills.length > 0 && (
              <div className={styles.skillsRow}>
                <span className={styles.skillsLabel}>Compétences :</span>
                {availableSkills.map((sk) => {
                  const isActive = selectedSkill.toLowerCase() === sk.toLowerCase();
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => setSelectedSkill(isActive ? 'ALL' : sk)}
                      className={`${styles.skillPill} ${isActive ? styles.skillPillActive : ''}`}
                    >
                      {sk}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Results Meta */}
          <div className={styles.resultsMeta}>
            <span>
              {filteredAttendees.length} développeur{filteredAttendees.length > 1 ? 's' : ''} trouvé{filteredAttendees.length > 1 ? 's' : ''}
              {selectedClass !== 'ALL' && ` · Classe ${selectedClass}`}
              {selectedSkill !== 'ALL' && ` · ${selectedSkill}`}
            </span>

            {(selectedClass !== 'ALL' || selectedSkill !== 'ALL' || search) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedClass('ALL');
                  setSelectedSkill('ALL');
                  setSearch('');
                }}
                className={styles.resetBtn}
              >
                Réinitialiser les filtres
              </button>
            )}
          </div>

          {/* Grid or Skeleton */}
          {loading ? (
            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={styles.skeletonCard} />
              ))}
            </div>
          ) : filteredAttendees.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <h2 className={styles.emptyTitle}>Aucun profil ne correspond à vos critères</h2>
              <p className={styles.emptyDesc}>
                Essayez d'ajuster votre recherche ou sélectionnez une autre classe pour afficher les développeurs.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedClass('ALL');
                  setSelectedSkill('ALL');
                }}
                className={styles.resetBtn}
              >
                Afficher tous les participants
              </button>
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredAttendees.map((attendee) => {
                const gh = cleanSocialUrl(attendee.githubUsername, 'github');
                const li = cleanSocialUrl(attendee.linkedinUrl, 'linkedin');
                const port = cleanSocialUrl(attendee.portfolioUrl, 'portfolio');

                return (
                  <article key={attendee.id} className={styles.card}>
                    <div className={styles.cardHeader}>
                      <div className={styles.avatar}>
                        {attendee.avatarUrl ? (
                          <Image
                            src={attendee.avatarUrl}
                            alt={attendee.fullName}
                            width={52}
                            height={52}
                            style={{ objectFit: 'cover' }}
                          />
                        ) : (
                          getInitials(attendee.fullName)
                        )}
                      </div>

                      <div className={styles.headerInfo}>
                        <h2 className={styles.userName}>{attendee.fullName}</h2>
                        <div className={styles.badges}>
                          <span className={styles.classeBadge}>Classe {attendee.classe}</span>
                          {attendee.eventStatus === 'attended' ? (
                            <span className={styles.attendedBadge}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="10" />
                              </svg>
                              Présence Validée
                            </span>
                          ) : (
                            <span className={styles.registeredBadge}>Inscrit</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {attendee.bio && (
                      <p className={styles.bio}>{attendee.bio}</p>
                    )}

                    {attendee.skills && attendee.skills.length > 0 && (
                      <div className={styles.cardSkills}>
                        {attendee.skills.slice(0, 5).map((sk) => (
                          <span
                            key={sk}
                            onClick={() => setSelectedSkill(sk)}
                            className={styles.cardSkillTag}
                            title={`Filtrer par ${sk}`}
                          >
                            {sk}
                          </span>
                        ))}
                        {attendee.skills.length > 5 && (
                          <span className={styles.cardSkillTag}>
                            +{attendee.skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    <div className={styles.cardFooter}>
                      <div className={styles.socialIcons}>
                        {gh && (
                          <a
                            href={gh}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIconBtn}
                            title="GitHub"
                            aria-label={`GitHub de ${attendee.fullName}`}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                          </a>
                        )}
                        {li && (
                          <a
                            href={li}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIconBtn}
                            title="LinkedIn"
                            aria-label={`LinkedIn de ${attendee.fullName}`}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.778-.773 1.778-1.729V1.73C24 .774 23.205 0 22.225 0z" />
                            </svg>
                          </a>
                        )}
                        {port && (
                          <a
                            href={port}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.socialIconBtn}
                            title="Portfolio"
                            aria-label={`Portfolio de ${attendee.fullName}`}
                          >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <line x1="2" y1="12" x2="22" y2="12" />
                              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                          </a>
                        )}
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          onClick={() => setSelectedContact(attendee)}
                          className={styles.vcardBtn}
                          title="Ajouter directement aux contacts de votre smartphone"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <line x1="19" y1="8" x2="19" y2="14" />
                            <line x1="22" y1="11" x2="16" y2="11" />
                          </svg>
                          Contact
                        </button>
                        <Link href={`/u/${attendee.id}`} className={styles.profileBtn}>
                          Profil →
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Save Contact Modal (Direct Phone Add via QR / Google Contacts) */}
      <SaveContactModal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
      />

      <Footer />
    </div>
  );
}
