export type Language = "en" | "fr";

// Define translation structure type
interface CommonTranslations {
    analyze: string;
    analyzing: string;
    export: string;
    rescan: string;
    newScan: string;
    details: string;
    viewDetails: string;
    viewRisks: string;
    close: string;
    copy: string;
    copied: string;
    good: string;
    needsWork: string;
    poor: string;
    excellent: string;
    upToDate: string;
    outdated: string;
    passed: string;
    hoverForInfo: string;
    clickForDetails: string;
}

interface HomeTranslations {
    badge: string;
    title1: string;
    title2: string;
    subtitle: string;
    placeholder: string;
    helperText: string;
    footer: string;
    apiUnavailable: string;
    analysisFailed: string;
    analyzingTitle: string;
    analyzingSubtitle: string;
}

interface StepsTranslations {
    seo: string;
    security: string;
    tech: string;
    links: string;
    processing: string;
}

interface DashboardTranslations {
    overallScore: string;
    scannedOn: string;
    analysisCompleted: string;
    seconds: string;
    errorsTitle: string;
}

interface SEOTranslations {
    title: string;
    seoLabel: string;
    lighthouseScores: string;
    coreWebVitals: string;
    googleRankingFactor: string;
    seoAudits: string;
    optimizationOpportunities: string;
    performance: string;
    accessibility: string;
    bestPractices: string;
    performanceDesc: string;
    seoDesc: string;
    accessibilityDesc: string;
    bestPracticesDesc: string;
    opportunitiesDesc: string;
    lighthouseInfo: string;
}

interface SecurityTranslations {
    title: string;
    sslCertificate: string;
    validCertificate: string;
    invalidCertificate: string;
    expired: string;
    expiresIn: string;
    days: string;
    protocol: string;
    issuer: string;
    missingHeaders: string;
    presentHeaders: string;
    exposedFiles: string;
    evidence: string;
    securityImpact: string;
    howToFix: string;
    references: string;
    headerMissing: string;
    headerPresent: string;
    exposedFile: string;
    headerNotFound: string;
    securityHeaders: Record<string, {
        description: string;
        impact: string;
        remediation: string;
        references?: string[];
    }>;
    exposedFilesDetail: Record<string, {
        description: string;
        impact: string;
        remediation: string;
    }>;
}

interface TechTranslations {
    title: string;
    currentVersion: string;
    latestVersion: string;
    updateRecommended: string;
    securityRisks: string;
    detectionConfidence: string;
    visitWebsite: string;
    noTechnologies: string;
    unknown: string;
}

interface LinksTranslations {
    title: string;
    checked: string;
    broken: string;
    allOk: string;
    internal: string;
    external: string;
    brokenLinks: string;
    allLinksWorking: string;
    linksCheckedValid: string;
    linkText: string;
}

interface CWVMetricTranslations {
    name: string;
    description: string;
    goodThreshold: string;
    impact: string;
}

interface CWVTranslations {
    lcp: CWVMetricTranslations;
    fid: CWVMetricTranslations;
    cls: CWVMetricTranslations;
    fcp: CWVMetricTranslations;
    ttfb: CWVMetricTranslations;
    inp: CWVMetricTranslations;
}

export interface TranslationKeys {
    common: CommonTranslations;
    home: HomeTranslations;
    steps: StepsTranslations;
    dashboard: DashboardTranslations;
    seo: SEOTranslations;
    security: SecurityTranslations;
    tech: TechTranslations;
    links: LinksTranslations;
    cwv: CWVTranslations;
}

export const translations: Record<Language, TranslationKeys> = {
    en: {
        common: {
            analyze: "Analyze",
            analyzing: "Analyzing...",
            export: "Export",
            rescan: "Rescan",
            newScan: "New Scan",
            details: "Details",
            viewDetails: "View Details",
            viewRisks: "View Risks",
            close: "Close",
            copy: "Copy",
            copied: "Copied!",
            good: "Good",
            needsWork: "Needs Work",
            poor: "Poor",
            excellent: "Excellent",
            upToDate: "Up to date",
            outdated: "outdated",
            passed: "passed",
            hoverForInfo: "Hover for info",
            clickForDetails: "Click for details",
        },

        home: {
            badge: "Free Website Audit Tool",
            title1: "Audit Any Website",
            title2: "In Seconds",
            subtitle: "Get a comprehensive analysis of SEO, security, performance, and technology stack for any website.",
            placeholder: "Enter a URL to audit (e.g., example.com)",
            helperText: "Free website audit for SEO, security, performance & technology stack",
            footer: "Built with Next.js, FastAPI, and ❤️",
            apiUnavailable: "Backend API is not available. Make sure the FastAPI server is running on port 8000.",
            analysisFailed: "Analysis Failed",
            analyzingTitle: "Analyzing Website...",
            analyzingSubtitle: "This usually takes 30-60 seconds",
        },

        steps: {
            seo: "Analyzing SEO & Performance (Lighthouse)",
            security: "Checking Security Headers & SSL",
            tech: "Detecting Technology Stack",
            links: "Scanning for Broken Links",
            processing: "Processing...",
        },

        dashboard: {
            overallScore: "Overall Score",
            scannedOn: "Scanned on",
            analysisCompleted: "Analysis completed in",
            seconds: "seconds",
            errorsTitle: "Errors During Scan",
        },

        seo: {
            title: "SEO & Performance",
            seoLabel: "SEO",
            lighthouseScores: "Lighthouse Scores",
            coreWebVitals: "Core Web Vitals",
            googleRankingFactor: "Google Ranking Factor",
            seoAudits: "SEO Audits",
            optimizationOpportunities: "Optimization Opportunities",
            performance: "Performance",
            accessibility: "Accessibility",
            bestPractices: "Best Practices",
            performanceDesc: "Measures how fast your page loads and becomes interactive. Includes metrics like FCP, LCP, Speed Index, and TTI.",
            seoDesc: "Checks if your page is optimized for search engine results ranking. Includes meta tags, structured data, and crawlability.",
            accessibilityDesc: "Evaluates if your page is accessible to users with disabilities. Checks color contrast, ARIA labels, and keyboard navigation.",
            bestPracticesDesc: "Checks for common web development best practices including HTTPS, image optimization, and modern JavaScript.",
            opportunitiesDesc: "These optimizations could improve your page load time. Sorted by potential impact.",
            lighthouseInfo: "Scores from Google Lighthouse. Hover over any metric for details.",
        },

        security: {
            title: "Security Analysis",
            sslCertificate: "SSL/TLS Certificate",
            validCertificate: "Valid Certificate",
            invalidCertificate: "Invalid Certificate",
            expired: "Expired!",
            expiresIn: "Expires in",
            days: "days",
            protocol: "Protocol",
            issuer: "Issuer",
            missingHeaders: "Missing Security Headers",
            presentHeaders: "Present Security Headers",
            exposedFiles: "Exposed Sensitive Files",
            evidence: "Evidence",
            securityImpact: "Security Impact",
            howToFix: "How to Fix",
            references: "References",
            headerMissing: "Header Missing",
            headerPresent: "Header Present",
            exposedFile: "Exposed File",
            headerNotFound: "was not found in the HTTP response headers.",
            securityHeaders: {
                "Strict-Transport-Security": {
                    description: "HTTP Strict Transport Security (HSTS) tells browsers to only use HTTPS for future requests to this domain.",
                    impact: "Without HSTS, attackers can intercept and modify traffic using man-in-the-middle attacks, even if your site uses HTTPS.",
                    remediation: `# For Nginx\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n\n# For Apache\nHeader always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
                        "https://hstspreload.org/"
                    ]
                },
                "Content-Security-Policy": {
                    description: "Content Security Policy (CSP) prevents XSS attacks by specifying which sources of content are allowed to be loaded.",
                    impact: "Without CSP, your site is vulnerable to Cross-Site Scripting (XSS) attacks that can steal user data or hijack sessions.",
                    remediation: `# Basic CSP for Nginx\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;\n\n# Start with report-only to test\nadd_header Content-Security-Policy-Report-Only "default-src 'self'; report-uri /csp-report;"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
                        "https://csp-evaluator.withgoogle.com/"
                    ]
                },
                "X-Frame-Options": {
                    description: "X-Frame-Options prevents your page from being embedded in iframes on other sites.",
                    impact: "Without this header, attackers can use clickjacking to trick users into clicking hidden elements on your page.",
                    remediation: `# For Nginx\nadd_header X-Frame-Options "DENY" always;\n# Or to allow same-origin\nadd_header X-Frame-Options "SAMEORIGIN" always;\n\n# For Apache\nHeader always set X-Frame-Options "DENY"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"
                    ]
                },
                "X-Content-Type-Options": {
                    description: "This header prevents browsers from MIME-sniffing a response away from the declared content-type.",
                    impact: "Without this, browsers might interpret files as a different MIME type, potentially executing malicious code.",
                    remediation: `# For Nginx\nadd_header X-Content-Type-Options "nosniff" always;\n\n# For Apache\nHeader always set X-Content-Type-Options "nosniff"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"
                    ]
                },
                "X-XSS-Protection": {
                    description: "Legacy header that enables the browser's built-in XSS filter.",
                    impact: "While deprecated in modern browsers, it provides protection for older browsers against reflected XSS attacks.",
                    remediation: `# For Nginx\nadd_header X-XSS-Protection "1; mode=block" always;\n\n# For Apache\nHeader always set X-XSS-Protection "1; mode=block"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection"
                    ]
                },
                "Referrer-Policy": {
                    description: "Controls how much referrer information is sent with requests.",
                    impact: "Without proper Referrer-Policy, sensitive URLs and query parameters may leak to third-party sites.",
                    remediation: `# For Nginx\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\n# For Apache\nHeader always set Referrer-Policy "strict-origin-when-cross-origin"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
                    ]
                },
                "Permissions-Policy": {
                    description: "Controls which browser features and APIs can be used on your site.",
                    impact: "Without Permissions-Policy, third-party scripts could access sensitive APIs like camera, microphone, or geolocation.",
                    remediation: `# For Nginx\nadd_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;\n\n# For Apache\nHeader always set Permissions-Policy "geolocation=(), microphone=(), camera=()"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"
                    ]
                },
                "X-Permitted-Cross-Domain-Policies": {
                    description: "Controls cross-domain policies for Flash and PDF documents.",
                    impact: "Without this header, Flash or PDF plugins might allow data leakage across domains.",
                    remediation: `# For Nginx\nadd_header X-Permitted-Cross-Domain-Policies "none" always;\n\n# For Apache\nHeader always set X-Permitted-Cross-Domain-Policies "none"`,
                    references: [
                        "https://owasp.org/www-project-secure-headers/"
                    ]
                }
            },
            exposedFilesDetail: {
                "/.git/config": {
                    description: "Git repository configuration file is exposed.",
                    impact: "Attackers can download the entire source code, including sensitive credentials and intellectual property.",
                    remediation: `# For Nginx - Block .git access\nlocation ~ /\\.git {\n    deny all;\n    return 404;\n}\n\n# For Apache - Add to .htaccess\nRedirectMatch 404 /\\.git`
                },
                "/.git/HEAD": {
                    description: "Git HEAD file is exposed, indicating git repository is accessible.",
                    impact: "Full source code can be reconstructed using git-dumper tools. May expose secrets, API keys, and passwords.",
                    remediation: `# Remove .git from production or block access\nrm -rf .git\n\n# Or block in web server configuration`
                },
                "/.env": {
                    description: "Environment configuration file is publicly accessible.",
                    impact: "CRITICAL: May contain database passwords, API keys, secret tokens, and other sensitive configuration.",
                    remediation: `# For Nginx\nlocation ~ /\\.env {\n    deny all;\n    return 404;\n}\n\n# Move .env outside web root\n# Never commit .env to version control`
                },
                "/robots.txt": {
                    description: "Robots.txt file is accessible (this is normal for SEO).",
                    impact: "Low risk. However, review contents to ensure you're not accidentally exposing sensitive paths.",
                    remediation: "Review robots.txt to ensure no sensitive paths are disclosed. This file being accessible is expected."
                },
                "/sitemap.xml": {
                    description: "XML sitemap is accessible (this is expected for SEO).",
                    impact: "Sitemaps are meant to be public. Verify no internal/admin URLs are listed.",
                    remediation: "This is expected behavior. Ensure only public URLs are included in the sitemap."
                }
            },
        },

        tech: {
            title: "Technology Stack",
            currentVersion: "Current Version",
            latestVersion: "Latest Version",
            updateRecommended: "Update Recommended",
            securityRisks: "Security Risks",
            detectionConfidence: "Detection Confidence",
            visitWebsite: "Visit Website",
            noTechnologies: "No technologies detected",
            unknown: "Unknown",
        },

        links: {
            title: "Broken Links",
            checked: "checked",
            broken: "broken",
            allOk: "All OK",
            internal: "Internal",
            external: "External",
            brokenLinks: "Broken Links",
            allLinksWorking: "All Links Working",
            linksCheckedValid: "links were checked and all are valid",
            linkText: "Link text",
        },

        cwv: {
            lcp: {
                name: "Largest Contentful Paint (LCP)",
                description: "Measures loading performance. LCP marks the point when the page's main content has likely loaded.",
                goodThreshold: "≤ 2.5 seconds",
                impact: "LCP is a Core Web Vital that directly impacts Google Search rankings. Poor LCP leads to higher bounce rates.",
            },
            fid: {
                name: "First Input Delay (FID)",
                description: "Measures interactivity. FID measures the time from when a user first interacts with your page to when the browser responds.",
                goodThreshold: "≤ 100 milliseconds",
                impact: "FID affects user experience and is considered in Google's page experience signals.",
            },
            cls: {
                name: "Cumulative Layout Shift (CLS)",
                description: "Measures visual stability. CLS measures unexpected layout shifts that occur during the page's lifecycle.",
                goodThreshold: "≤ 0.1",
                impact: "CLS is a Core Web Vital. High CLS causes frustrating user experiences when elements move unexpectedly.",
            },
            fcp: {
                name: "First Contentful Paint (FCP)",
                description: "Measures the time from page load to when any part of the page's content is rendered on screen.",
                goodThreshold: "≤ 1.8 seconds",
                impact: "FCP provides feedback that the page is loading. Slow FCP may cause users to abandon the page.",
            },
            ttfb: {
                name: "Time to First Byte (TTFB)",
                description: "Measures the time between the request for a resource and when the first byte of response arrives.",
                goodThreshold: "≤ 800 milliseconds",
                impact: "TTFB affects all other metrics. Slow TTFB indicates server-side performance issues.",
            },
            inp: {
                name: "Interaction to Next Paint (INP)",
                description: "Measures overall page responsiveness by observing all interactions throughout the page lifecycle.",
                goodThreshold: "≤ 200 milliseconds",
                impact: "INP is replacing FID as a Core Web Vital. It provides a fuller picture of page responsiveness.",
            },
        },
    },

    fr: {
        common: {
            analyze: "Analyser",
            analyzing: "Analyse en cours...",
            export: "Exporter",
            rescan: "Réanalyser",
            newScan: "Nouvelle analyse",
            details: "Détails",
            viewDetails: "Voir détails",
            viewRisks: "Voir risques",
            close: "Fermer",
            copy: "Copier",
            copied: "Copié !",
            good: "Bon",
            needsWork: "À améliorer",
            poor: "Mauvais",
            excellent: "Excellent",
            upToDate: "À jour",
            outdated: "obsolète",
            passed: "réussi",
            hoverForInfo: "Survolez pour plus d'infos",
            clickForDetails: "Cliquez pour les détails",
        },

        home: {
            badge: "Outil d'audit web gratuit",
            title1: "Auditez n'importe quel site",
            title2: "En quelques secondes",
            subtitle: "Obtenez une analyse complète du SEO, de la sécurité, des performances et de la stack technique de n'importe quel site web.",
            placeholder: "Entrez une URL à auditer (ex: exemple.com)",
            helperText: "Audit gratuit : SEO, sécurité, performance et stack technique",
            footer: "Créé avec Next.js, FastAPI et ❤️",
            apiUnavailable: "L'API backend n'est pas disponible. Assurez-vous que le serveur FastAPI tourne sur le port 8000.",
            analysisFailed: "Échec de l'analyse",
            analyzingTitle: "Analyse du site en cours...",
            analyzingSubtitle: "Cela prend généralement 30 à 60 secondes",
        },

        steps: {
            seo: "Analyse SEO & Performance (Lighthouse)",
            security: "Vérification des en-têtes de sécurité & SSL",
            tech: "Détection de la stack technique",
            links: "Recherche de liens cassés",
            processing: "Traitement...",
        },

        dashboard: {
            overallScore: "Score Global",
            scannedOn: "Analysé le",
            analysisCompleted: "Analyse complétée en",
            seconds: "secondes",
            errorsTitle: "Erreurs durant l'analyse",
        },

        seo: {
            title: "SEO & Performance",
            seoLabel: "SEO",
            lighthouseScores: "Scores Lighthouse",
            coreWebVitals: "Core Web Vitals",
            googleRankingFactor: "Facteur de classement Google",
            seoAudits: "Audits SEO",
            optimizationOpportunities: "Opportunités d'optimisation",
            performance: "Performance",
            accessibility: "Accessibilité",
            bestPractices: "Bonnes pratiques",
            performanceDesc: "Mesure la vitesse de chargement et d'interactivité de votre page. Inclut les métriques FCP, LCP, Speed Index et TTI.",
            seoDesc: "Vérifie si votre page est optimisée pour le classement dans les moteurs de recherche. Inclut les balises meta, les données structurées et l'indexabilité.",
            accessibilityDesc: "Évalue si votre page est accessible aux personnes handicapées. Vérifie le contraste des couleurs, les labels ARIA et la navigation au clavier.",
            bestPracticesDesc: "Vérifie les bonnes pratiques de développement web incluant HTTPS, l'optimisation des images et le JavaScript moderne.",
            opportunitiesDesc: "Ces optimisations pourraient améliorer le temps de chargement de votre page. Triées par impact potentiel.",
            lighthouseInfo: "Scores de Google Lighthouse. Survolez une métrique pour plus de détails.",
        },

        security: {
            title: "Analyse de sécurité",
            sslCertificate: "Certificat SSL/TLS",
            validCertificate: "Certificat valide",
            invalidCertificate: "Certificat invalide",
            expired: "Expiré !",
            expiresIn: "Expire dans",
            days: "jours",
            protocol: "Protocole",
            issuer: "Émetteur",
            missingHeaders: "En-têtes de sécurité manquants",
            presentHeaders: "En-têtes de sécurité présents",
            exposedFiles: "Fichiers sensibles exposés",
            evidence: "Preuve",
            securityImpact: "Impact sur la sécurité",
            howToFix: "Comment corriger",
            references: "Références",
            headerMissing: "En-tête manquant",
            headerPresent: "En-tête présent",
            exposedFile: "Fichier exposé",
            headerNotFound: "n'a pas été trouvé dans les en-têtes de réponse HTTP.",
            securityHeaders: {
                "Strict-Transport-Security": {
                    description: "HTTP Strict Transport Security (HSTS) indique aux navigateurs de n'utiliser que HTTPS pour les futures requêtes vers ce domaine.",
                    impact: "Sans HSTS, les attaquants peuvent intercepter et modifier le trafic via des attaques man-in-the-middle, même si votre site utilise HTTPS.",
                    remediation: `# Pour Nginx\nadd_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;\n\n# Pour Apache\nHeader always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
                        "https://hstspreload.org/"
                    ]
                },
                "Content-Security-Policy": {
                    description: "Content Security Policy (CSP) empêche les attaques XSS en spécifiant quelles sources de contenu sont autorisées à être chargées.",
                    impact: "Sans CSP, votre site est vulnérable aux attaques Cross-Site Scripting (XSS) qui peuvent voler des données utilisateur ou détourner des sessions.",
                    remediation: `# CSP Basique pour Nginx\nadd_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;\n\n# Commencer en mode report-only pour tester\nadd_header Content-Security-Policy-Report-Only "default-src 'self'; report-uri /csp-report;"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
                        "https://csp-evaluator.withgoogle.com/"
                    ]
                },
                "X-Frame-Options": {
                    description: "X-Frame-Options empêche votre page d'être intégrée dans des iframes sur d'autres sites.",
                    impact: "Sans cet en-tête, les attaquants peuvent utiliser le clickjacking pour inciter les utilisateurs à cliquer sur des éléments cachés de votre page.",
                    remediation: `# Pour Nginx\nadd_header X-Frame-Options "DENY" always;\n# Ou pour autoriser la même origine\nadd_header X-Frame-Options "SAMEORIGIN" always;\n\n# Pour Apache\nHeader always set X-Frame-Options "DENY"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"
                    ]
                },
                "X-Content-Type-Options": {
                    description: "Cet en-tête empêche les navigateurs de deviner le type MIME d'une réponse différent de celui déclaré.",
                    impact: "Sans cela, les navigateurs pourraient interpréter des fichiers comme un type MIME différent, exécutant potentiellement du code malveillant.",
                    remediation: `# Pour Nginx\nadd_header X-Content-Type-Options "nosniff" always;\n\n# Pour Apache\nHeader always set X-Content-Type-Options "nosniff"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"
                    ]
                },
                "X-XSS-Protection": {
                    description: "En-tête hérité qui active le filtre XSS intégré du navigateur.",
                    impact: "Bien que déprécié dans les navigateurs modernes, il offre une protection pour les anciens navigateurs contre les attaques XSS réfléchies.",
                    remediation: `# Pour Nginx\nadd_header X-XSS-Protection "1; mode=block" always;\n\n# Pour Apache\nHeader always set X-XSS-Protection "1; mode=block"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection"
                    ]
                },
                "Referrer-Policy": {
                    description: "Contrôle la quantité d'informations de référent envoyées avec les requêtes.",
                    impact: "Sans une politique de référent appropriée, des URL sensibles et des paramètres de requête peuvent fuiter vers des sites tiers.",
                    remediation: `# Pour Nginx\nadd_header Referrer-Policy "strict-origin-when-cross-origin" always;\n\n# Pour Apache\nHeader always set Referrer-Policy "strict-origin-when-cross-origin"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
                    ]
                },
                "Permissions-Policy": {
                    description: "Contrôle quelles fonctionnalités et API du navigateur peuvent être utilisées sur votre site.",
                    impact: "Sans Permissions-Policy, des scripts tiers pourraient accéder à des API sensibles comme la caméra, le microphone ou la géolocalisation.",
                    remediation: `# Pour Nginx\nadd_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;\n\n# Pour Apache\nHeader always set Permissions-Policy "geolocation=(), microphone=(), camera=()"`,
                    references: [
                        "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"
                    ]
                },
                "X-Permitted-Cross-Domain-Policies": {
                    description: "Contrôle les politiques inter-domaines pour Flash et les documents PDF.",
                    impact: "Sans cet en-tête, les plugins Flash ou PDF pourraient permettre des fuites de données entre domaines.",
                    remediation: `# Pour Nginx\nadd_header X-Permitted-Cross-Domain-Policies "none" always;\n\n# Pour Apache\nHeader always set X-Permitted-Cross-Domain-Policies "none"`,
                    references: [
                        "https://owasp.org/www-project-secure-headers/"
                    ]
                }
            },
            exposedFilesDetail: {
                "/.git/config": {
                    description: "Le fichier de configuration du dépôt Git est exposé.",
                    impact: "Les attaquants peuvent télécharger l'intégralité du code source, y compris les identifiants sensibles et la propriété intellectuelle.",
                    remediation: `# Pour Nginx - Bloquer l'accès .git\nlocation ~ /\\.git {\n    deny all;\n    return 404;\n}\n\n# Pour Apache - Ajouter au .htaccess\nRedirectMatch 404 /\\.git`
                },
                "/.git/HEAD": {
                    description: "Le fichier Git HEAD est exposé, indiquant que le dépôt git est accessible.",
                    impact: "Le code source complet peut être reconstruit à l'aide d'outils git-dumper. Peut exposer des secrets, clés API et mots de passe.",
                    remediation: `# Supprimer .git de la production ou bloquer l'accès\nrm -rf .git\n\n# Ou bloquer dans la configuration du serveur web`
                },
                "/.env": {
                    description: "Le fichier de configuration d'environnement est accessible publiquement.",
                    impact: "CRITIQUE : Peut contenir des mots de passe de base de données, clés API, jetons secrets et autres configurations sensibles.",
                    remediation: `# Pour Nginx\nlocation ~ /\\.env {\n    deny all;\n    return 404;\n}\n\n# Déplacer .env hors de la racine web\n# Ne jamais commiter .env dans le contrôle de version`
                },
                "/robots.txt": {
                    description: "Le fichier Robots.txt est accessible (c'est normal pour le SEO).",
                    impact: "Risque faible. Cependant, vérifiez le contenu pour vous assurer que vous n'exposez pas accidentellement des chemins sensibles.",
                    remediation: "Vérifiez robots.txt pour vous assurer qu'aucun chemin sensible n'est divulgué. L'accessibilité de ce fichier est attendue."
                },
                "/sitemap.xml": {
                    description: "Le sitemap XML est accessible (c'est attendu pour le SEO).",
                    impact: "Les sitemaps sont destinés à être publics. Vérifiez qu'aucune URL interne/admin n'est répertoriée.",
                    remediation: "C'est un comportement attendu. Assurez-vous que seules les URL publiques sont incluses dans le sitemap."
                }
            },
        },

        tech: {
            title: "Stack Technique",
            currentVersion: "Version actuelle",
            latestVersion: "Dernière version",
            updateRecommended: "Mise à jour recommandée",
            securityRisks: "Risques de sécurité",
            detectionConfidence: "Confiance de détection",
            visitWebsite: "Visiter le site",
            noTechnologies: "Aucune technologie détectée",
            unknown: "Inconnue",
        },

        links: {
            title: "Liens cassés",
            checked: "vérifiés",
            broken: "cassés",
            allOk: "Tout OK",
            internal: "Interne",
            external: "Externe",
            brokenLinks: "Liens cassés",
            allLinksWorking: "Tous les liens fonctionnent",
            linksCheckedValid: "liens ont été vérifiés et sont tous valides",
            linkText: "Texte du lien",
        },

        cwv: {
            lcp: {
                name: "Largest Contentful Paint (LCP)",
                description: "Mesure les performances de chargement. Le LCP indique quand le contenu principal de la page a probablement été chargé.",
                goodThreshold: "≤ 2,5 secondes",
                impact: "Le LCP est un Core Web Vital qui impacte directement le classement Google. Un mauvais LCP entraîne un taux de rebond plus élevé.",
            },
            fid: {
                name: "First Input Delay (FID)",
                description: "Mesure l'interactivité. Le FID mesure le temps entre la première interaction de l'utilisateur et la réponse du navigateur.",
                goodThreshold: "≤ 100 millisecondes",
                impact: "Le FID affecte l'expérience utilisateur et est pris en compte dans les signaux d'expérience de page Google.",
            },
            cls: {
                name: "Cumulative Layout Shift (CLS)",
                description: "Mesure la stabilité visuelle. Le CLS mesure les décalages de mise en page inattendus pendant le cycle de vie de la page.",
                goodThreshold: "≤ 0,1",
                impact: "Le CLS est un Core Web Vital. Un CLS élevé crée une expérience frustrante quand les éléments bougent de façon inattendue.",
            },
            fcp: {
                name: "First Contentful Paint (FCP)",
                description: "Mesure le temps entre le chargement de la page et le premier rendu de contenu à l'écran.",
                goodThreshold: "≤ 1,8 secondes",
                impact: "Le FCP indique à l'utilisateur que la page se charge. Un FCP lent peut pousser les utilisateurs à quitter la page.",
            },
            ttfb: {
                name: "Time to First Byte (TTFB)",
                description: "Mesure le temps entre la requête et l'arrivée du premier octet de la réponse.",
                goodThreshold: "≤ 800 millisecondes",
                impact: "Le TTFB affecte toutes les autres métriques. Un TTFB lent indique des problèmes de performance côté serveur.",
            },
            inp: {
                name: "Interaction to Next Paint (INP)",
                description: "Mesure la réactivité globale de la page en observant toutes les interactions durant son cycle de vie.",
                goodThreshold: "≤ 200 millisecondes",
                impact: "L'INP remplace le FID comme Core Web Vital. Il donne une image plus complète de la réactivité de la page.",
            },
        },
    },
};
