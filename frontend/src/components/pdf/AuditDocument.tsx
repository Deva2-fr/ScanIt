import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link, Image } from '@react-pdf/renderer';
import { AnalyzeResponse, SeverityLevel } from '../../types/api';

// --- STYLES SYSTEM ---
const colors = {
    primary: '#2563eb', // Blue-600
    secondary: '#475569', // Slate-600
    accent: '#7c3aed', // Violet-600
    success: '#16a34a', // Green-600
    warning: '#d97706', // Amber-600
    danger: '#dc2626', // Red-600
    dark: '#0f172a', // Slate-900
    light: '#f8fafc', // Slate-50
    border: '#e2e8f0', // Slate-200
    text: '#334155', // Slate-700
    textLight: '#64748b', // Slate-500
};

const styles = StyleSheet.create({
    page: {
        padding: 35,
        backgroundColor: '#FFFFFF',
        fontFamily: 'Helvetica',
        fontSize: 9,
        lineHeight: 1.5,
        color: colors.text,
    },
    // Typography
    title: {
        fontSize: 28,
        fontFamily: 'Helvetica-Bold',
        color: colors.dark,
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textLight,
        marginBottom: 30,
    },
    h1: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: colors.dark,
        marginBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
        paddingBottom: 5,
    },
    h2: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: colors.secondary,
        marginTop: 15,
        marginBottom: 10,
        backgroundColor: '#f1f5f9',
        padding: 6,
        borderRadius: 4,
    },
    h3: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: colors.text,
        marginTop: 8,
        marginBottom: 4,
        textDecoration: 'underline',
    },
    text: {
        fontSize: 9,
        marginBottom: 4,
    },
    bold: {
        fontFamily: 'Helvetica-Bold',
    },
    small: {
        fontSize: 8,
        color: colors.textLight,
    },
    // Components
    card: {
        backgroundColor: colors.light,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        padding: 12,
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        marginBottom: 6,
        color: colors.dark,
    },
    badge: {
        paddingVertical: 2,
        paddingHorizontal: 6,
        borderRadius: 4,
        fontSize: 7,
        fontFamily: 'Helvetica-Bold',
        color: '#fff',
        alignSelf: 'flex-start',
    },
    label: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: colors.secondary,
    },

    // Layouts
    section: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    col: {
        flexDirection: 'column',
    },
    grid2: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    col2: {
        width: '50%',
        paddingHorizontal: 6,
    },
    grid3: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -5,
    },
    col3: {
        width: '33.33%',
        paddingHorizontal: 5,
    },
    // Tables
    table: {
        width: "100%",
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 4,
        overflow: "hidden",
        marginBottom: 15,
    },
    tableHeader: {
        backgroundColor: "#f1f5f9",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 6,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingVertical: 6,
        minHeight: 25,
        alignItems: 'center',
    },
    cell: {
        paddingHorizontal: 6,
        fontSize: 8,
        justifyContent: 'center',
    },
    // Header/Footer
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingBottom: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 25,
        left: 35,
        right: 35,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    pageNumber: {
        fontSize: 8,
        color: colors.textLight,
    },
});

// --- HELPER FUNCTIONS ---

const formatScore = (val: any): number => {
    if (val === null || val === undefined) return 0;
    let score = Number(val);
    if (score <= 1) score *= 100;
    return Math.min(100, Math.max(0, Math.round(score)));
};

const getScoreColor = (score: number) => {
    if (score >= 90) return colors.success;
    if (score >= 50) return colors.warning;
    return colors.danger;
};

const getSeverityColor = (severity: string, primaryColor: string = colors.primary) => {
    switch (severity?.toLowerCase()) {
        case 'critical': return colors.danger;
        case 'high': return '#ea580c'; // Orange-600
        case 'medium': return colors.warning;
        case 'low': return primaryColor;
        default: return colors.success;
    }
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

// --- SUB-COMPONENTS ---

const ScoreBadge = ({ score }: { score: number }) => (
    <View style={{
        backgroundColor: getScoreColor(score),
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 10
    }}>
        <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Helvetica-Bold' }}>{score}/100</Text>
    </View>
);

const StatusBadge = ({ value, trueLabel = "OUI", falseLabel = "NON", inverse = false }: any) => {
    const isSuccess = inverse ? !value : value;
    return (
        <View style={[styles.badge, { backgroundColor: isSuccess ? colors.success : colors.danger }]}>
            <Text>{value ? trueLabel : falseLabel}</Text>
        </View>
    )
};

const SeverityLabel = ({ level, color }: { level: string, color?: string }) => (
    <View style={[styles.badge, { backgroundColor: getSeverityColor(level, color) }]}>
        <Text>{level.toUpperCase()}</Text>
    </View>
);

const ProgressBar = ({ percent }: { percent: number }) => (
    <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, width: '100%', overflow: 'hidden' }}>
        <View style={{ height: '100%', backgroundColor: getScoreColor(percent), width: `${percent}%` }} />
    </View>
);

// --- MAIN DOCUMENT COMPONENT ---

interface AuditDocumentProps {
    data: AnalyzeResponse;
    brandColor?: string;
    logoUrl?: string; // Optional URL for custom logo
    agencyName?: string; // Optional agency name
}

const AuditDocument: React.FC<AuditDocumentProps> = ({ data, brandColor, logoUrl, agencyName }) => {
    const globalScore = formatScore(data.global_score);
    // Use the provided brandColor or fallback to default primary color
    const primary = brandColor || colors.primary;

    // Aggregate social links from contacts
    const socialLinks = data.tech_stack.contacts ? [
        ...(data.tech_stack.contacts.twitter || []),
        ...(data.tech_stack.contacts.linkedin || []),
        ...(data.tech_stack.contacts.facebook || [])
    ] : [];

    // Footer text logic
    const footerTextElement = ({ pageNumber, totalPages }: any) => {
        const text = agencyName
            ? `Rapport généré par ${agencyName} - Page ${pageNumber} / ${totalPages}`
            : `Page ${pageNumber} / ${totalPages} - SiteAuditor Confidential`;
        return text;
    };

    return (
        <Document>

            {/* --- PAGE 1: COVER --- */}
            <Page size="A4" style={styles.page}>
                {/* Brand Header */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 60 }}>
                    {logoUrl ? (
                        // Custom Logo
                        <Image
                            src={logoUrl}
                            style={{
                                height: 60,
                                objectFit: 'contain',
                                marginRight: 15,
                                // Ensure image isn't too wide if aspect ratio is wide
                                maxWidth: 200
                            }}
                        />
                    ) : (
                        // Default Logo
                        <React.Fragment>
                            <View style={{ width: 30, height: 30, borderRadius: 6, backgroundColor: primary, marginRight: 10, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: 'white', fontFamily: 'Helvetica-Bold', fontSize: 16 }}>S</Text>
                            </View>
                            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: colors.secondary }}>SiteAuditor</Text>
                        </React.Fragment>
                    )}
                </View>

                {/* Title Section */}
                <View style={{ marginBottom: 40 }}>
                    <Text style={styles.subtitle}>RAPPORT D'AUDIT TECHNIQUE COMPLET</Text>
                    <Text style={styles.title}>{new URL(data.url).hostname}</Text>
                    <Text style={{ fontSize: 12, color: primary, marginTop: 5 }}>{data.url}</Text>
                </View>

                {/* Global Score Gauge */}
                <View style={{ alignItems: 'center', marginBottom: 50 }}>
                    <View style={{
                        width: 180, height: 180, borderRadius: 90,
                        borderWidth: 12, borderColor: getScoreColor(globalScore),
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#f8fafc' // Light background inside circle
                    }}>
                        <Text style={{ fontSize: 56, fontFamily: 'Helvetica-Bold', color: getScoreColor(globalScore) }}>
                            {globalScore}
                        </Text>
                        <Text style={{ fontSize: 12, color: colors.textLight, marginTop: 5 }}>SCORE GLOBAL</Text>
                    </View>
                </View>

                {/* High Level Metrics Grid */}
                <View style={styles.grid2}>
                    {[
                        { label: 'Sécurité', score: formatScore(data.security.score) },
                        { label: 'Performance', score: formatScore(data.seo.scores.performance) },
                        { label: 'SEO', score: formatScore(data.seo.scores.seo) },
                        { label: 'Eco-Index', score: formatScore(data.green_it.score) }
                    ].map((item, i) => (
                        <View key={i} style={styles.col2}>
                            <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 }]}>
                                <Text style={{ fontSize: 12, fontFamily: 'Helvetica-Bold' }}>{item.label}</Text>
                                <ScoreBadge score={item.score} />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Scan Meta */}
                <View style={{ marginTop: 'auto', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 20 }}>
                    <Text style={styles.small}>Rapport généré le {formatDate(data.analyzed_at)}</Text>
                    <Text style={styles.small}>Durée analyse: {data.scan_duration_seconds?.toFixed(1)} secondes</Text>
                    <Text style={styles.small}>ID Audit: {Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
                </View>
            </Page>

            {/* --- PAGE 2: EXECUTIVE SUMMARY --- */}
            <Page size="A4" style={styles.page}>
                {/* Dynamic H1 border color */}
                <Text style={[styles.h1, { borderBottomColor: primary }]}>Tableau de Bord Exécutif</Text>

                {/* Critical Issues Summary */}
                <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.danger, backgroundColor: '#fef2f2' }]}>
                    <Text style={[styles.cardTitle, { color: colors.danger }]}>ATTENTION REQUISE</Text>
                    <View style={styles.row}>
                        <Text style={[styles.text, { marginRight: 20 }]}>
                            <Text style={[styles.bold, { color: colors.danger }]}>{data.security.vulnerabilities.length}</Text> Vulnérabilités
                        </Text>
                        <Text style={[styles.text, { marginRight: 20 }]}>
                            <Text style={[styles.bold, { color: colors.danger }]}>{data.broken_links.broken_count}</Text> Liens Brisés
                        </Text>
                        <Text style={styles.text}>
                            <Text style={[styles.bold, { color: colors.danger }]}>{data.tech_stack.outdated_count}</Text> Technos Obsolètes
                        </Text>
                    </View>
                </View>

                <Text style={styles.h2}>Synthèse des Piliers</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>MODULE</Text></View>
                        <View style={[styles.cell, { flex: 4 }]}><Text style={styles.bold}>PROGRESSION</Text></View>
                        <View style={[styles.cell, { flex: 1, alignItems: 'flex-end' }]}><Text style={styles.bold}>NOTE</Text></View>
                    </View>
                    {[
                        { name: 'Sécurité & Infra', score: data.security.score },
                        { name: 'Performance (Web Core Vitals)', score: formatScore(data.seo.scores.performance) },
                        { name: 'SEO Technique', score: formatScore(data.seo.scores.seo) },
                        { name: 'Accessibilité', score: formatScore(data.seo.scores.accessibility) },
                        { name: 'Eco-Responsabilité', score: data.green_it.score },
                        { name: 'Qualité Technique (Liens/Code)', score: Math.max(0, 100 - (data.broken_links.broken_count * 5)) } // Calculated metric
                    ].map((row, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.cell, { flex: 2 }]}><Text>{row.name}</Text></View>
                            <View style={[styles.cell, { flex: 4 }]}>
                                <ProgressBar percent={formatScore(row.score)} />
                            </View>
                            <View style={[styles.cell, { flex: 1, alignItems: 'flex-end' }]}>
                                <Text style={styles.bold}>{Math.round(formatScore(row.score))}/100</Text>
                            </View>
                        </View>
                    ))}
                </View>

                <Text style={styles.h2}>Top Priorités</Text>
                {/* Combine top issues across all domains */}
                {[
                    ...data.security.vulnerabilities.map(v => ({ type: 'SÉCURITÉ', text: v.description, severity: v.severity })),
                    ...data.seo.opportunities.filter(o => o.score < 0.5).map(o => ({ type: 'PERFORMANCE', text: o.title, severity: 'high' })),
                    ...(data.broken_links.broken_count > 0 ? [{ type: 'QUALITÉ', text: `${data.broken_links.broken_count} liens brisés détectés sur le site`, severity: 'medium' }] : []),
                    ...data.security.headers.filter(h => !h.present && h.severity === 'high').map(h => ({ type: 'CONFIG', text: `Header de sécurité manquant : ${h.name}`, severity: 'high' }))
                ].slice(0, 8).map((issue: any, i) => (
                    <View key={i} style={[styles.row, { marginBottom: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                        <View style={{ width: 80 }}>
                            <SeverityLabel level={issue.severity || 'medium'} color={primary} />
                        </View>
                        <View style={{ width: 80 }}>
                            <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: colors.textLight }}>{issue.type}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.text}>{issue.text}</Text>
                        </View>
                    </View>
                ))}

                <Text style={styles.footer} render={footerTextElement} fixed />
            </Page>

            {/* --- PAGE 3: SECURITY DEEP DIVE --- */}
            <Page size="A4" style={styles.page}>
                <Text style={[styles.h1, { borderBottomColor: primary }]}>Analyse de Sécurité Complète</Text>

                <View style={styles.grid2}>
                    <View style={styles.col2}>
                        <Text style={styles.h2}>Configuration SSL/TLS</Text>
                        <View style={styles.card}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.label}>Statut Certificat</Text>
                                <StatusBadge value={data.security.ssl.valid} trueLabel="VALIDE" />
                            </View>
                            <View style={[styles.rowBetween, { marginTop: 5 }]}>
                                <Text style={styles.label}>Jours restants</Text>
                                {/* Check for null before rendering */}
                                <Text style={styles.bold}>{data.security.ssl.days_until_expiry !== null ? `${data.security.ssl.days_until_expiry} jours` : 'N/A'}</Text>
                            </View>
                            <Text style={[styles.small, { marginTop: 5 }]}>Issuer: {data.security.ssl.issuer || 'Inconnu'}</Text>
                        </View>
                    </View>
                    <View style={styles.col2}>
                        <Text style={styles.h2}>Exposition Fichiers</Text>
                        <View style={styles.card}>
                            {data.security.exposed_files.length > 0 ? (
                                data.security.exposed_files.map((f, i) => (
                                    <View key={i} style={styles.rowBetween}>
                                        <Text style={{ color: colors.danger }}>{f.path}</Text>
                                        <Text style={styles.small}>Accessible!</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={{ color: colors.success, fontSize: 9 }}>Aucun fichier sensible exposé (git, env, backup...).</Text>
                            )}
                        </View>
                    </View>
                </View>

                <Text style={styles.h2}>En-têtes HTTP de Sécurité</Text>
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>HEADER</Text></View>
                        <View style={[styles.cell, { flex: 1 }]}><Text style={styles.bold}>STATUT</Text></View>
                        <View style={[styles.cell, { flex: 4 }]}><Text style={styles.bold}>RECOMMANDATION</Text></View>
                    </View>
                    {data.security.headers.map((h, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>{h.name}</Text></View>
                            <View style={[styles.cell, { flex: 1 }]}>
                                {h.present ? <StatusBadge value={true} trueLabel="OK" /> : <SeverityLabel level={h.severity} color={primary} />}
                            </View>
                            <View style={[styles.cell, { flex: 4 }]}>
                                <Text style={{ fontSize: 8 }}>{h.present ? 'Configuration correcte' : (h.description || 'Manquant')}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Rest of Page 3 Content... (Same structure) */}
                <Text style={styles.h2}>Vulnérabilités Détectées</Text>
                {data.security.vulnerabilities.length > 0 ? (
                    data.security.vulnerabilities.map((v: any, i) => (
                        <View key={i} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.danger }]}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.cardTitle}>{v.title || 'Faille de sécurité'}</Text>
                                <SeverityLabel level={v.severity || 'high'} color={primary} />
                            </View>
                            <Text style={styles.text}>{v.description}</Text>
                            {v.remediation && (
                                <View style={{ marginTop: 5, padding: 5, backgroundColor: '#f1f5f9', borderRadius: 4 }}>
                                    <Text style={{ fontFamily: 'Courier', fontSize: 8 }}>Remédiation: {v.remediation}</Text>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View style={[styles.card, { backgroundColor: '#f0fdf4', borderColor: colors.success }]}>
                        <Text style={{ color: colors.success }}>Aucune vulnérabilité connue (CVE) détectée sur les technologies identifiées.</Text>
                    </View>
                )}

                <Text style={styles.footer} render={footerTextElement} fixed />
            </Page>

            {/* --- PAGE 4: PERFORMANCE & SEO --- */}
            <Page size="A4" style={styles.page}>
                <Text style={[styles.h1, { borderBottomColor: primary }]}>Performance & Expérience Utilisateur</Text>

                {/* Core Web Vitals Section */}
                <Text style={styles.h2}>Core Web Vitals (Signaux Web Essentiels)</Text>
                <View style={styles.grid3}>
                    <View style={styles.col3}>
                        <View style={[styles.card, { alignItems: 'center' }]}>
                            <Text style={[styles.cardTitle, { fontSize: 14 }]}>LCP</Text>
                            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: primary }}>
                                {data.seo.core_web_vitals.lcp ? `${(data.seo.core_web_vitals.lcp / 1000).toFixed(2)}s` : '-'}
                            </Text>
                            <Text style={styles.small}>Chargement</Text>
                        </View>
                    </View>
                    <View style={styles.col3}>
                        <View style={[styles.card, { alignItems: 'center' }]}>
                            <Text style={[styles.cardTitle, { fontSize: 14 }]}>CLS</Text>
                            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: primary }}>
                                {data.seo.core_web_vitals.cls || '0'}
                            </Text>
                            <Text style={styles.small}>Stabilité</Text>
                        </View>
                    </View>
                    <View style={styles.col3}>
                        <View style={[styles.card, { alignItems: 'center' }]}>
                            <Text style={[styles.cardTitle, { fontSize: 14 }]}>FID/INP</Text>
                            <Text style={{ fontSize: 18, fontFamily: 'Helvetica-Bold', color: primary }}>
                                {data.seo.core_web_vitals.inp || data.seo.core_web_vitals.fid || '-'} ms
                            </Text>
                            <Text style={styles.small}>Interactivité</Text>
                        </View>
                    </View>
                </View>

                {/* Metrics Table */}
                <Text style={styles.h2}>Toutes les Métriques de Vitesse</Text>
                <View style={styles.table}>
                    {/* ... (Same table structure) ... */}
                    <View style={styles.tableHeader}>
                        <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>METRIQUE</Text></View>
                        <View style={[styles.cell, { flex: 1.5 }]}><Text style={styles.bold}>VALEUR</Text></View>
                        <View style={[styles.cell, { flex: 4 }]}><Text style={styles.bold}>DESCRIPTION</Text></View>
                    </View>
                    {[
                        { l: 'First Contentful Paint (FCP)', v: data.seo.core_web_vitals.fcp ? `${(data.seo.core_web_vitals.fcp / 1000).toFixed(2)}s` : null, d: 'Premier élément affiché à l\'écran.' },
                        { l: 'Time to First Byte (TTFB)', v: data.seo.core_web_vitals.ttfb ? `${Math.round(data.seo.core_web_vitals.ttfb)}ms` : null, d: 'Temps de réponse du serveur.' },
                        { l: 'Speed Index', v: data.seo.audits.find(a => a.id === 'speed-index')?.displayValue, d: 'Vitesse de remplissage visuel de la page.' },
                        { l: 'Total Blocking Time (TBT)', v: data.seo.audits.find(a => a.id === 'total-blocking-time')?.displayValue, d: 'Temps où le thread principal est bloqué.' }
                    ].map((row, i) => (
                        <View key={i} style={styles.tableRow}>
                            <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>{row.l}</Text></View>
                            <View style={[styles.cell, { flex: 1.5 }]}><Text>{row.v || 'N/A'}</Text></View>
                            <View style={[styles.cell, { flex: 4 }]}><Text style={styles.small}>{row.d}</Text></View>
                        </View>
                    ))}
                </View>

                <Text style={styles.h2}>Opportunités d'Optimisation (Top 5)</Text>
                {data.seo.opportunities.slice(0, 5).map((op, i) => (
                    <View key={i} style={styles.row}>
                        <View style={{ width: 60, marginRight: 10 }}>
                            <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                                <Text>GAIN: {op.savings ? Math.round(op.savings) + 'ms' : 'High'}</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1, paddingBottom: 8, marginBottom: 8, borderBottomWidth: 1, borderBottomColor: colors.border }}>
                            <Text style={[styles.bold, { color: colors.dark }]}>{op.title}</Text>
                            <Text style={styles.small}>{op.description.substring(0, 200)}...</Text>
                        </View>
                    </View>
                ))}

                <Text style={styles.footer} render={footerTextElement} fixed />
            </Page>

            {/* --- PAGE 5: TECH STACK --- */}
            <Page size="A4" style={styles.page}>
                <Text style={[styles.h1, { borderBottomColor: primary }]}>Infrastructure & Stack Technique</Text>

                {/* Company & Contacts Info */}
                {(data.tech_stack.company?.name || (data.tech_stack.contacts && Object.values(data.tech_stack.contacts).some(arr => arr.length > 0))) && (
                    <View style={styles.section}>
                        <Text style={styles.h2}>Informations Entreprise Détectées</Text>
                        <View style={styles.card}>
                            {data.tech_stack.company?.name && <Text style={styles.text}><Text style={styles.bold}>Nom:</Text> {data.tech_stack.company.name}</Text>}
                            {data.tech_stack.company?.industry && <Text style={styles.text}><Text style={styles.bold}>Secteur:</Text> {data.tech_stack.company.industry}</Text>}
                            {/* Contacts */}
                            {(data.tech_stack.contacts?.emails?.length ?? 0) > 0 && <Text style={styles.text}><Text style={styles.bold}>Emails:</Text> {data.tech_stack.contacts?.emails?.join(', ')}</Text>}
                            {(data.tech_stack.contacts?.phones?.length ?? 0) > 0 && <Text style={styles.text}><Text style={styles.bold}>Téléphones:</Text> {data.tech_stack.contacts?.phones?.join(', ')}</Text>}
                            {socialLinks.length > 0 && <Text style={styles.text}><Text style={styles.bold}>Réseaux:</Text> {socialLinks.join(', ')}</Text>}
                        </View>
                    </View>
                )}

                <Text style={styles.h2}>Stack Technologique ({data.tech_stack.technologies.length})</Text>
                <View style={styles.grid2}>
                    {data.tech_stack.technologies.map((tech, i) => (
                        <View key={i} style={styles.col2}>
                            <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.bold}>{tech.name}</Text>
                                    <Text style={styles.small}>{tech.categories?.join(', ')}</Text>
                                    {tech.version && <Text style={styles.small}>v{tech.version}</Text>}
                                </View>
                                {tech.is_outdated && (
                                    <View style={[styles.badge, { backgroundColor: colors.warning }]}>
                                        <Text>OBSOLÈTE</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* DNS Health */}
                <Text style={styles.h2}>Santé DNS & Email</Text>
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>Enregistrement SPF</Text></View>
                        <View style={[styles.cell, { flex: 1 }]}>
                            <StatusBadge value={data.dns_health.spf.present} />
                        </View>
                        <View style={[styles.cell, { flex: 3 }]}>
                            <Text style={styles.small}>{data.dns_health.spf.record || 'Aucun enregistrement trouvé'}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>Politique DMARC</Text></View>
                        <View style={[styles.cell, { flex: 1 }]}>
                            <StatusBadge value={data.dns_health.dmarc.present} />
                        </View>
                        <View style={[styles.cell, { flex: 3 }]}>
                            <Text style={styles.small}>{data.dns_health.dmarc.record || 'Aucune politique définie'}</Text>
                        </View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>IP Serveur</Text></View>
                        <View style={[styles.cell, { flex: 4 }]}>
                            <Text style={styles.small}>{data.dns_health.server_ip || 'Non détectée'}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer} render={footerTextElement} fixed />
            </Page>

            {/* --- PAGE 6: COMPLIANCE --- */}
            <Page size="A4" style={styles.page}>
                <Text style={[styles.h1, { borderBottomColor: primary }]}>Conformité, Qualité & Green IT</Text>

                <View style={styles.grid2}>
                    <View style={styles.col2}>
                        <Text style={styles.h2}>Eco-Responsabilité</Text>
                        <View style={[styles.card, { backgroundColor: '#f0fdf4', borderColor: colors.success }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                                    <Text style={{ color: 'white', fontFamily: 'Helvetica-Bold', fontSize: 16 }}>{data.green_it.grade}</Text>
                                </View>
                                <View>
                                    <Text style={{ fontFamily: 'Helvetica-Bold', color: '#166534' }}>Eco-Grade</Text>
                                    <Text style={{ fontSize: 9, color: '#166534' }}>Score: {data.green_it.score}/100</Text>
                                </View>
                            </View>
                            <Text style={{ fontSize: 9, color: '#166534' }}>• CO2: {data.green_it.co2_grams.toFixed(2)} g/visite</Text>
                            <Text style={{ fontSize: 9, color: '#166534' }}>• Poids: {data.green_it.total_size_mb.toFixed(2)} MB</Text>
                        </View>
                    </View>
                    <View style={styles.col2}>
                        <Text style={styles.h2}>RGPD & Vie Privée</Text>
                        <View style={styles.card}>
                            <View style={styles.rowBetween}>
                                <Text style={styles.bold}>CMP Détectée</Text>
                                <StatusBadge value={!!data.gdpr.cmp_detected} trueLabel="OUI" falseLabel="NON" />
                            </View>
                            <View style={[styles.rowBetween, { marginTop: 8 }]}>
                                <Text style={styles.bold}>Politique Vie Privée</Text>
                                <StatusBadge value={data.gdpr.privacy_policy_detected} trueLabel="OUI" falseLabel="NON" />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Cookies */}
                <Text style={styles.h2}>Analyse des Cookies ({data.gdpr.cookies.length})</Text>
                {data.gdpr.cookies.length > 0 ? (
                    <View style={styles.table}>
                        <View style={styles.tableHeader}>
                            <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>NOM</Text></View>
                            <View style={[styles.cell, { flex: 2 }]}><Text style={styles.bold}>DOMAINE</Text></View>
                            <View style={[styles.cell, { flex: 1.5 }]}><Text style={styles.bold}>RISQUE</Text></View>
                        </View>
                        {data.gdpr.cookies.slice(0, 15).map((c, i) => (
                            <View key={i} style={styles.tableRow}>
                                <View style={[styles.cell, { flex: 2 }]}><Text>{c.name.substring(0, 20)}</Text></View>
                                <View style={[styles.cell, { flex: 2 }]}><Text style={styles.small}>{c.domain}</Text></View>
                                <View style={[styles.cell, { flex: 1.5 }]}>
                                    <SeverityLabel level={c.risk_level} color={primary} />
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={[styles.small, { fontStyle: 'italic', marginBottom: 15 }]}>Aucun cookie détecté avant consentement.</Text>
                )}

                {/* Broken Links */}
                <Text style={styles.h2}>Liens Brisés (Top 10)</Text>
                <View style={{ marginBottom: 15 }}>
                    {data.broken_links.broken_links.length > 0 ? (
                        data.broken_links.broken_links.slice(0, 10).map((l, i) => (
                            <View key={i} style={[styles.row, { paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                                <Text style={[styles.bold, { width: 40, color: colors.danger }]}>{l.status_code}</Text>
                                <Text style={[styles.small, { flex: 1 }]}>{l.url}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={[styles.card, { backgroundColor: '#f0fdf4', borderColor: colors.success }]}>
                            <Text style={{ color: colors.success }}>Excellent ! Aucun lien brisé détecté lors de l'exploration.</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.h2}>Social Media Optimization (SMO)</Text>
                <View style={styles.card}>
                    <View style={{ marginBottom: 8 }}>
                        <Text style={styles.label}>Titre OpenGraph</Text>
                        <Text style={styles.text}>{data.smo.title || 'Non configuré ❌'}</Text>
                    </View>
                    <View style={{ marginBottom: 8 }}>
                        <Text style={styles.label}>Image de Partage</Text>
                        <Text style={styles.text}>{data.smo.image ? '✅ Image présente' : '❌ Aucune image définie'}</Text>
                    </View>
                </View>

                <Text style={styles.footer} render={footerTextElement} fixed />
            </Page>

        </Document>
    );
};

export default AuditDocument;
