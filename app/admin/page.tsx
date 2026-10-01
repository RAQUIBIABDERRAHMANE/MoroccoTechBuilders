'use client';

import React, { useState, useEffect } from 'react';
import MTBLogo from '@/components/MTBLogo';
import Link from 'next/link';
import styles from './admin.module.css';

interface Attendee {
  ticketId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  classe: string;
  year: string;
  status: string;
  registeredAt: string;
  attendedAt: string | null;
}

interface EventItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  speaker: string;
  speakerRole?: string;
  location: string;
  date: string;
  startTime?: string;
  endTime?: string;
  capacity: number;
  isActive: boolean;
  reminderSent: boolean;
  thankYouSent: boolean;
  createdAt: string;
}

interface StatsData {
  totalRegistered: number;
  totalAttended: number;
  attendanceRate: number;
  classesBreakdown: Record<string, { registered: number; attended: number }>;
  recentScans: Array<{
    ticketId: string;
    userId: string;
    fullName: string;
    classe: string;
    status: string;
    attendedAt: string | null;
    registeredAt: string;
  }>;
}

export default function AdminPage() {
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinError, setPinError] = useState('');

  // Dashboard Data
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('mtb-2026-online-presence');
  const [stats, setStats] = useState<StatsData | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);

  // UI Navigation
  const [activeTab, setActiveTab] = useState<'attendees' | 'scans' | 'events' | 'campaigns'>('attendees');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // New Event Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventSlug, setNewEventSlug] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventSpeaker, setNewEventSpeaker] = useState('');
  const [newEventLocation, setNewEventLocation] = useState('Amphithéâtre OFPPT Marrakech');
  const [newEventCapacity, setNewEventCapacity] = useState(150);
  const [newEventIsActive, setNewEventIsActive] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Broadcast campaign states
  const [testEmailReminder, setTestEmailReminder] = useState('');
  const [testEmailThankYou, setTestEmailThankYou] = useState('');
  const [broadcastingReminder, setBroadcastingReminder] = useState(false);
  const [broadcastingThankYou, setBroadcastingThankYou] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Check stored admin session
  useEffect(() => {
    const savedPin = sessionStorage.getItem('mtb_admin_pin');
    if (savedPin) {
      verifyAndLoad(savedPin);
    }
  }, []);

  // Auto refresh every 15s if enabled and authenticated
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;
    const interval = setInterval(() => {
      const pin = sessionStorage.getItem('mtb_admin_pin');
      if (pin) loadData(pin, false, selectedEventId);
    }, 15000);
    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, selectedEventId]);

  const verifyAndLoad = async (pin: string, eventId?: string) => {
    setLoading(true);
    setPinError('');
    try {
      const url = eventId ? `/api/admin/stats?eventId=${encodeURIComponent(eventId)}` : '/api/admin/stats';
      const res = await fetch(url, {
        headers: { 'x-admin-pin': pin },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Code PIN incorrect.');
      }

      sessionStorage.setItem('mtb_admin_pin', pin);
      setIsAuthenticated(true);
      setEvents(data.events || []);
      setSelectedEventId(data.currentEventId || 'mtb-2026-online-presence');
      setStats(data.stats);
      setAttendees(data.attendees || []);
    } catch (err: any) {
      setPinError(err.message || 'Erreur d’authentification.');
      sessionStorage.removeItem('mtb_admin_pin');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async (pin: string, showSpinner = true, eventId = selectedEventId) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?eventId=${encodeURIComponent(eventId)}`, {
        headers: { 'x-admin-pin': pin },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEvents(data.events || []);
        setSelectedEventId(data.currentEventId || eventId);
        setStats(data.stats);
        setAttendees(data.attendees || []);
      }
    } catch {
      // ignore
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;
    verifyAndLoad(pinInput.trim());
  };

  const handleLogout = () => {
    sessionStorage.removeItem('mtb_admin_pin');
    setIsAuthenticated(false);
    setPinInput('');
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const pin = sessionStorage.getItem('mtb_admin_pin');
    if (pin) {
      loadData(pin, true, eventId);
    }
  };

  // Set active event
  const handleSetActiveEvent = async (event: EventItem) => {
    const pin = sessionStorage.getItem('mtb_admin_pin');
    if (!pin) return;

    try {
      const res = await fetch(`/api/admin/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({ isActive: true }),
      });
      const data = await res.json();
      if (data.success) {
        loadData(pin, true, event.id);
      } else {
        alert(data.error || 'Erreur lors du changement');
      }
    } catch {
      alert('Erreur serveur');
    }
  };

  // Create new event
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    const pin = sessionStorage.getItem('mtb_admin_pin');
    if (!pin) return;

    setModalLoading(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({
          name: newEventName,
          slug: newEventSlug || newEventName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          date: newEventDate,
          speaker: newEventSpeaker,
          location: newEventLocation,
          capacity: newEventCapacity,
          isActive: newEventIsActive,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowEventModal(false);
        setNewEventName('');
        setNewEventSlug('');
        setNewEventDate('');
        setNewEventSpeaker('');
        loadData(pin, true, data.event.id);
      } else {
        alert(data.error || 'Erreur lors de la création');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setModalLoading(false);
    }
  };

  // Broadcast campaigns
  const handleSendCampaign = async (type: 'reminder' | 'thank_you', isTest = false, testEmail?: string) => {
    const pin = sessionStorage.getItem('mtb_admin_pin');
    if (!pin) return;

    if (type === 'reminder') setBroadcastingReminder(true);
    else setBroadcastingThankYou(true);
    setCampaignMessage(null);

    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-pin': pin,
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          campaignType: type,
          isTest,
          testEmail,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCampaignMessage({ text: data.message, type: 'success' });
        loadData(pin, false, selectedEventId);
      } else {
        setCampaignMessage({ text: data.error || 'Erreur lors de l’envoi', type: 'error' });
      }
    } catch {
      setCampaignMessage({ text: 'Erreur réseau lors de la diffusion', type: 'error' });
    } finally {
      setBroadcastingReminder(false);
      setBroadcastingThankYou(false);
    }
  };

  // CSV Export with UTF-8 BOM for Excel compatibility
  const exportToCsv = () => {
    if (attendees.length === 0) return;

    const headers = [
      'Ticket ID',
      'Nom & Prénom',
      'Classe',
      'Année',
      'Email',
      'Téléphone',
      'Statut',
      'Date Inscription',
      'Heure Entrée',
    ];

    const rows = attendees.map((a) => [
      `"${a.ticketId}"`,
      `"${a.fullName.replace(/"/g, '""')}"`,
      `"${a.classe}"`,
      `"${a.year}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.status === 'attended' ? 'Présent' : 'Inscrit'}"`,
      `"${new Date(a.registeredAt).toLocaleString('fr-FR')}"`,
      `"${a.attendedAt ? new Date(a.attendedAt).toLocaleTimeString('fr-FR') : '-'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `MTB-Participants-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter attendees
  const filteredAttendees = attendees.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      a.fullName.toLowerCase().includes(q) ||
      a.email.toLowerCase().includes(q) ||
      a.ticketId.toLowerCase().includes(q) ||
      a.classe.toLowerCase().includes(q);

    const matchesClass = classFilter === 'ALL' || a.classe === classFilter;
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ATTENDED' && a.status === 'attended') ||
      (statusFilter === 'REGISTERED' && a.status !== 'attended');

    return matchesSearch && matchesClass && matchesStatus;
  });

  const availableClasses = Object.keys(stats?.classesBreakdown || {});
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // 1. PIN Lock Screen
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.pinWrapper}>
          <div className={styles.pinCard}>
            <Link href="/" aria-label="Accueil" style={{ display: 'inline-block', marginBottom: 16 }}>
              <MTBLogo size={36} variant="dark" />
            </Link>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Espace Administration</h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-dark-b)', margin: 0 }}>
              Saisissez le code PIN pour accéder au tableau de bord des opérations.
            </p>

            {pinError && (
              <div style={{ color: '#ff7b72', fontSize: '0.85rem', marginTop: 16 }}>
                {pinError}
              </div>
            )}

            <form onSubmit={handlePinSubmit}>
              <input
                type="password"
                maxLength={6}
                autoFocus
                placeholder="• • • •"
                className={styles.pinInput}
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
              />
              <button
                type="submit"
                className="btn-red"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Vérification...' : 'Déverrouiller le Tableau de Bord'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Authenticated Dashboard
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Top Header */}
        <header className={styles.header}>
          <div className={styles.titleArea}>
            <MTBLogo size={32} variant="dark" />
            <div className={styles.titleText}>
              <h1>Administration · Morocco Tech Builders</h1>
              <p>Supervision des événements, gestion multi-éditions et campagnes d'emails</p>
            </div>
          </div>

          <div className={styles.headerActions}>
            {/* Event Selector Dropdown */}
            {events.length > 0 && (
              <select
                className={styles.eventSelect}
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                aria-label="Sélectionner l'événement"
              >
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.isActive ? '🟢 ' : ''}{evt.name} ({evt.date})
                  </option>
                ))}
              </select>
            )}

            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => {
                const pin = sessionStorage.getItem('mtb_admin_pin');
                if (pin) loadData(pin, true);
              }}
              title="Rafraîchir les données"
            >
              🔄
            </button>

            <Link href="/scan" className={styles.actionBtn} style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: '#10b981', color: '#6ee7b7' }}>
              📲 Scanner Entrée
            </Link>

            <Link href="/connect" className={styles.actionBtn} style={{ background: 'rgba(59, 130, 246, 0.2)', borderColor: '#3b82f6', color: '#93c5fd' }}>
              🤝 Scanner Réseau
            </Link>

            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleLogout}
              title="Déconnexion"
            >
              🔒 Quitter
            </button>
          </div>
        </header>

        {/* Global Statistics Cards */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Inscrits ({currentEvent?.name || 'Actif'})</div>
            <div className={styles.statValue}>{stats?.totalRegistered ?? 0}</div>
            <div className={styles.statSub}>Capacité : {currentEvent?.capacity || 120} places</div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Présences Confirmées</div>
            <div className={styles.statValue} style={{ color: '#10B981' }}>
              {stats?.totalAttended ?? 0}
            </div>
            <div className={styles.statSub}>
              {(stats?.totalRegistered || 0) - (stats?.totalAttended || 0)} en attente d'arrivée
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Taux de Présence</div>
            <div className={styles.statValue} style={{ color: 'var(--mtb-blue)' }}>
              {stats?.attendanceRate ?? 0}%
            </div>
            <div className={styles.progressBarBg}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${stats?.attendanceRate ?? 0}%` }}
              />
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statLabel}>Événement Sélectionné</div>
            <div className={styles.statValue} style={{ fontSize: '1.2rem', color: currentEvent?.isActive ? '#10b981' : '#94a3b8' }}>
              {currentEvent?.isActive ? 'En cours (Actif)' : 'Édition Archivée'}
            </div>
            <div className={styles.statSub}>Date : {currentEvent?.date || 'N/A'}</div>
          </div>
        </div>

        {/* Campaign Feedback Message */}
        {campaignMessage && (
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            background: campaignMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${campaignMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: campaignMessage.type === 'success' ? '#34d399' : '#f87171',
            fontSize: '0.9rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>{campaignMessage.text}</span>
            <button
              onClick={() => setCampaignMessage(null)}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className={styles.tabsHeader}>
          <div className={styles.tabsList}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'attendees' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('attendees')}
            >
              👥 Participants ({filteredAttendees.length})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'scans' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('scans')}
            >
              ⏱️ Historique Scans ({stats?.recentScans.length ?? 0})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'events' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('events')}
            >
              🏛️ Gestion Événements ({events.length})
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'campaigns' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('campaigns')}
            >
              ✉️ Campagnes d'Emails
            </button>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'events' && (
              <button
                type="button"
                className="btn-green"
                onClick={() => setShowEventModal(true)}
                style={{ padding: '8px 14px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600 }}
              >
                + Nouvel Événement
              </button>
            )}
            {activeTab === 'attendees' && (
              <button
                type="button"
                className={styles.exportBtn}
                onClick={exportToCsv}
                disabled={attendees.length === 0}
              >
                📥 Exporter CSV
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Attendees List */}
        {activeTab === 'attendees' && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.searchBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher par nom, email, classe, ticket..."
                  className={styles.searchInput}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className={styles.filterGroup}>
                <select
                  className={styles.filterSelect}
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="ALL">Toutes les classes</option>
                  {availableClasses.map((cls) => (
                    <option key={cls} value={cls}>
                      {cls} ({stats?.classesBreakdown[cls]?.registered})
                    </option>
                  ))}
                </select>

                <select
                  className={styles.filterSelect}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="ATTENDED">Présents uniquement</option>
                  <option value="REGISTERED">En attente uniquement</option>
                </select>
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Participant</th>
                      <th>Classe & Niveau</th>
                      <th>Billet / Ticket</th>
                      <th>Contact</th>
                      <th>Statut</th>
                      <th>Heure Validation</th>
                      <th>Profil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendees.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>
                          Aucun participant ne correspond aux filtres.
                        </td>
                      </tr>
                    ) : (
                      filteredAttendees.map((a) => (
                        <tr key={a.ticketId}>
                          <td>
                            <strong>{a.fullName}</strong>
                          </td>
                          <td>
                            {a.classe} · <span style={{ fontSize: '0.78rem' }}>{a.year}</span>
                          </td>
                          <td>
                            <span className={styles.ticketBadge}>{a.ticketId}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem' }}>{a.email}</div>
                            {a.phone && (
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-dark-f)' }}>{a.phone}</div>
                            )}
                          </td>
                          <td>
                            {a.status === 'attended' ? (
                              <span className={styles.badgeAttended}>✓ Présent</span>
                            ) : (
                              <span className={styles.badgeRegistered}>Inscrit</span>
                            )}
                          </td>
                          <td>
                            {a.attendedAt ? (
                              <span style={{ color: '#10B981', fontWeight: 600 }}>
                                {new Date(a.attendedAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-dark-f)' }}>—</span>
                            )}
                          </td>
                          <td>
                            <Link
                              href={`/u/${a.userId}`}
                              target="_blank"
                              style={{ color: 'var(--mtb-blue)', textDecoration: 'underline', fontSize: '0.82rem' }}
                            >
                              Voir
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Tab 2: Recent Scans Log */}
        {activeTab === 'scans' && (
          <div className={styles.tableCard}>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Participant</th>
                    <th>Classe</th>
                    <th>Ticket ID</th>
                    <th>Statut</th>
                    <th>Date & Heure</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.recentScans || []).length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '32px' }}>
                        Aucun scan enregistré pour cet événement.
                      </td>
                    </tr>
                  ) : (
                    (stats?.recentScans || []).map((s, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{s.fullName}</strong>
                        </td>
                        <td>{s.classe}</td>
                        <td>
                          <span className={styles.ticketBadge}>{s.ticketId}</span>
                        </td>
                        <td>
                          {s.status === 'attended' ? (
                            <span className={styles.badgeAttended}>✓ Validé</span>
                          ) : (
                            <span className={styles.badgeRegistered}>{s.status}</span>
                          )}
                        </td>
                        <td>
                          {s.attendedAt
                            ? new Date(s.attendedAt).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })
                            : new Date(s.registeredAt).toLocaleTimeString('fr-FR')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Multi-Event Management */}
        {activeTab === 'events' && (
          <div className={styles.eventsGrid}>
            {events.map((evt) => (
              <div
                key={evt.id}
                className={`${styles.eventCard} ${evt.isActive ? styles.eventCardActive : ''}`}
              >
                <div className={styles.eventCardHeader}>
                  <h3 className={styles.eventTitle}>{evt.name}</h3>
                  {evt.isActive ? (
                    <span className={styles.badgeAttended}>🟢 Actif</span>
                  ) : (
                    <span className={styles.badgeRegistered}>Archivé</span>
                  )}
                </div>

                <div className={styles.eventMetaList}>
                  <div className={styles.eventMetaItem}>
                    <strong>📅 Date :</strong> {evt.date} ({evt.startTime || '14:00'} - {evt.endTime || '17:30'})
                  </div>
                  <div className={styles.eventMetaItem}>
                    <strong>🎤 Intervenant :</strong> {evt.speaker}
                  </div>
                  <div className={styles.eventMetaItem}>
                    <strong>📍 Lieu :</strong> {evt.location}
                  </div>
                  <div className={styles.eventMetaItem}>
                    <strong>👥 Capacité :</strong> {evt.capacity} places
                  </div>
                </div>

                <div className={styles.eventActions}>
                  {!evt.isActive ? (
                    <button
                      type="button"
                      onClick={() => handleSetActiveEvent(evt)}
                      className={styles.btnSetActive}
                    >
                      Définir comme Événement Actif
                    </button>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>
                      ✓ Actuellement mis en avant sur la page d'accueil
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Email Campaigns */}
        {activeTab === 'campaigns' && (
          <div className={styles.campaignsGrid}>
            {/* Campaign 1: J-1 Reminder */}
            <div className={styles.campaignCard}>
              <h3 className={styles.campaignTitle}>
                <span>⏰</span>
                Rappel J-1 (24h avant)
              </h3>
              <p className={styles.campaignDesc}>
                Envoie un email avec le pass digital, le QR code, et la checklist à tous les participants inscrits à <strong>{currentEvent?.name}</strong>.
              </p>

              <div>
                <span className={`${styles.campaignStatus} ${currentEvent?.reminderSent ? styles.statusSent : styles.statusPending}`}>
                  {currentEvent?.reminderSent ? '✓ Déjà Diffusé' : '● Prêt pour Diffusion'}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dark-b)', marginLeft: 8 }}>
                  ({attendees.length} inscrits ciblés)
                </span>
              </div>

              {/* Test Email */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-dark-f)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Tester l'aperçu du mail :
                </label>
                <div className={styles.testForm}>
                  <input
                    type="email"
                    placeholder="votre-email@ofppt.ma"
                    className={styles.testInput}
                    value={testEmailReminder}
                    onChange={(e) => setTestEmailReminder(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.btnTest}
                    onClick={() => handleSendCampaign('reminder', true, testEmailReminder)}
                    disabled={broadcastingReminder || !testEmailReminder}
                  >
                    Tester
                  </button>
                </div>
              </div>

              {/* Live Broadcast */}
              <button
                type="button"
                className={styles.btnBroadcast}
                onClick={() => {
                  if (confirm(`Confirmez-vous l'envoi du Rappel J-1 à ${attendees.length} participants ?`)) {
                    handleSendCampaign('reminder', false);
                  }
                }}
                disabled={broadcastingReminder || attendees.length === 0}
              >
                {broadcastingReminder ? 'Diffusion en cours...' : `🚀 Diffuser à tous les ${attendees.length} Inscrits`}
              </button>
            </div>

            {/* Campaign 2: Post-Event Thank You */}
            <div className={styles.campaignCard}>
              <h3 className={styles.campaignTitle}>
                <span>🎓</span>
                Remerciements & Réseau Post-Événement
              </h3>
              <p className={styles.campaignDesc}>
                Envoie un email de félicitations avec le badge de présence validé et le lien vers l'annuaire aux participants ayant assisté à l'atelier.
              </p>

              <div>
                <span className={`${styles.campaignStatus} ${currentEvent?.thankYouSent ? styles.statusSent : styles.statusPending}`}>
                  {currentEvent?.thankYouSent ? '✓ Déjà Diffusé' : '● Prêt pour Diffusion'}
                </span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-dark-b)', marginLeft: 8 }}>
                  ({stats?.totalAttended ?? 0} participants présents)
                </span>
              </div>

              {/* Test Email */}
              <div style={{ marginTop: '16px' }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-dark-f)', fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Tester l'aperçu du mail :
                </label>
                <div className={styles.testForm}>
                  <input
                    type="email"
                    placeholder="votre-email@ofppt.ma"
                    className={styles.testInput}
                    value={testEmailThankYou}
                    onChange={(e) => setTestEmailThankYou(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.btnTest}
                    onClick={() => handleSendCampaign('thank_you', true, testEmailThankYou)}
                    disabled={broadcastingThankYou || !testEmailThankYou}
                  >
                    Tester
                  </button>
                </div>
              </div>

              {/* Live Broadcast */}
              <button
                type="button"
                className={styles.btnBroadcast}
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                onClick={() => {
                  if (confirm(`Confirmez-vous l'envoi du mail de remerciements aux ${stats?.totalAttended ?? 0} participants présents ?`)) {
                    handleSendCampaign('thank_you', false);
                  }
                }}
                disabled={broadcastingThankYou || (stats?.totalAttended || 0) === 0}
              >
                {broadcastingThankYou ? 'Diffusion en cours...' : `🎉 Diffuser aux ${stats?.totalAttended ?? 0} Présents`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create Event */}
      {showEventModal && (
        <div className={styles.modalOverlay} onClick={() => setShowEventModal(false)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Créer une Nouvelle Édition</h2>
              <button
                type="button"
                onClick={() => setShowEventModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Nom de l'événement *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: MTB Hackathon 2026"
                  className={styles.formInput}
                  value={newEventName}
                  onChange={(e) => setNewEventName(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Date *</label>
                <input
                  type="date"
                  required
                  className={styles.formInput}
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Intervenant / Speaker *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Abderrahmane Raquibi"
                  className={styles.formInput}
                  value={newEventSpeaker}
                  onChange={(e) => setNewEventSpeaker(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Lieu</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Capacité maximale (places)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={newEventCapacity}
                  onChange={(e) => setNewEventCapacity(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={newEventIsActive}
                  onChange={(e) => setNewEventIsActive(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                />
                <label htmlFor="activeCheck" style={{ fontSize: '0.86rem', color: '#fff', cursor: 'pointer' }}>
                  Activer immédiatement comme événement principal
                </label>
              </div>

              <button
                type="submit"
                className="btn-green"
                disabled={modalLoading}
                style={{ width: '100%', padding: '12px', marginTop: '12px', borderRadius: '6px', fontWeight: 700 }}
              >
                {modalLoading ? 'Création...' : 'Créer l’Événement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
