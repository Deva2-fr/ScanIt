/**
 * API Types for SiteAuditor Frontend
 * Matches the backend Pydantic schemas
 */

// Enums
export type AuditStatus = "pending" | "running" | "completed" | "failed";
export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info" | "ok";

// SEO & Performance
export interface CoreWebVitals {
    lcp: number | null;
    lcp_score: string | null;
    fid: number | null;
    fid_score: string | null;
    cls: number | null;
    cls_score: string | null;
    fcp: number | null;
    ttfb: number | null;
    inp: number | null;
}

export interface LighthouseScores {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
    best_practices: number | null;
}

export interface SEOResult {
    scores: LighthouseScores;
    core_web_vitals: CoreWebVitals;
    audits: Array<{
        id: string;
        title: string;
        description: string;
        score: number | null;
        displayValue: string;
        passed: boolean;
    }>;
    opportunities: Array<{
        id: string;
        title: string;
        description: string;
        score: number;
        savings: number | null;
        displayValue: string;
    }>;
    diagnostics: Array<{
        id: string;
        title: string;
        description: string;
        displayValue: string;
        score: number | null;
    }>;
    error: string | null;
}

// Security - Enhanced with evidence and remediation
export interface SecurityHeader {
    name: string;
    value: string | null;
    present: boolean;
    severity: SeverityLevel;
    recommendation: string | null;
    description: string | null;
    // New fields for Deep Dive
    evidence?: string;
    remediation?: string;
    impact?: string;
    references?: string[];
}

export interface SSLInfo {
    valid: boolean;
    issuer: string | null;
    subject: string | null;
    expires_at: string | null;
    days_until_expiry: number | null;
    protocol_version: string | null;
    cipher_suite: string | null;
    is_expired: boolean;
    is_expiring_soon: boolean;
    error: string | null;
}

export interface ExposedFile {
    path: string;
    accessible: boolean;
    severity: SeverityLevel;
    description: string | null;
    // New fields for Deep Dive
    evidence?: string;
    remediation?: string;
    impact?: string;
}

export interface SecurityResult {
    score: number;
    headers: SecurityHeader[];
    ssl: SSLInfo;
    exposed_files: ExposedFile[];
    vulnerabilities: Array<Record<string, unknown>>;
    error: string | null;
}

// Technology Stack - Enhanced
export interface Technology {
    name: string;
    categories: string[];
    version: string | null;
    latest_version: string | null;
    is_outdated: boolean;
    confidence: number;
    icon: string | null;
    website: string | null;
    severity: SeverityLevel;
    // New fields for Deep Dive
    changelog_url?: string;
    security_advisories?: string[];
    update_urgency?: "critical" | "recommended" | "optional";
    known_vulnerabilities?: Array<{
        cve: string;
        description: string;
        severity: SeverityLevel;
    }>;
}

export interface CompanyInfo {
    name: string | null;
    description: string | null;
    industry: string | null;
    size: string | null;
    founded: number | null;
    location: string | null;
}

export interface ContactInfo {
    emails: string[];
    phones: string[];
    twitter: string[];
    linkedin: string[];
    facebook: string[];
}

export interface TechStackResult {
    source?: string;
    company?: CompanyInfo;
    contacts?: ContactInfo;
    technologies: Technology[];
    cms: string | null;
    framework: string | null;
    server: string | null;
    programming_language: string | null;
    cdn: string | null;
    analytics: string[];
    outdated_count: number;
    error: string | null;
}

// Broken Links
export interface BrokenLink {
    url: string;
    status_code: number;
    source_text: string | null;
    is_internal: boolean;
    error_type: string;
}

export interface BrokenLinksResult {
    total_links_checked: number;
    broken_links: BrokenLink[];
    broken_count: number;
    internal_broken: number;
    external_broken: number;
    error: string | null;
}

// GDPR & Compliance
export interface CookieItem {
    name: string;
    domain: string;
    secure: boolean;
    http_only: boolean;
    path: string;
    expires: number | null;
    is_session: boolean;
    same_site: string | null;
    is_compliant: boolean;
    category: string;
    risk_level: SeverityLevel;
}

export interface GDPRResult {
    compliant: boolean;
    cookies: CookieItem[];
    violation_count: number;
    cmp_detected: string | null;
    privacy_policy_detected: boolean;
    privacy_policy_url?: string;
    score: number;
    error: string | null;
}

// Social Media Optimization
export interface SMOResult {
    title: string | null;
    description: string | null;
    image: string | null;
    url: string | null;
    site_name: string | null;
    twitter_card: string | null;
    twitter_title: string | null;
    twitter_description: string | null;
    twitter_image: string | null;
    image_status: "valid" | "broken" | "missing";
    missing_tags: string[];
    score: number;
    error: string | null;
}

// Green IT
export interface GreenResult {
    co2_grams: number;
    grade: string;
    total_size_mb: number;
    resource_count: number;
    score: number;
    error: string | null;
}

// DNS & Email Health
export interface SPFInfo {
    present: boolean;
    record: string | null;
    status: "valid" | "warning" | "critical" | "missing";
    warnings: string[];
}

export interface DMARCInfo {
    present: boolean;
    record: string | null;
    policy: string | null;
    status: "valid" | "warning" | "critical" | "missing";
}

export interface DKIMInfo {
    present: boolean;
    selectors_checked: string[];
    selectors_found: string[];
    status: "manual_check" | "found" | "missing";
    note: string;
}

export interface DNSHealthResult {
    spf: SPFInfo;
    dmarc: DMARCInfo;
    dkim: DKIMInfo;
    domain: string | null;
    server_ip: string | null;
    score: number;
    error: string | null;
}

// Main Response
export interface AnalyzeResponse {
    url: string;
    analyzed_at: string;
    status: AuditStatus;
    global_score: number;
    seo: SEOResult;
    security: SecurityResult;
    tech_stack: TechStackResult;
    broken_links: BrokenLinksResult;
    gdpr: GDPRResult;
    smo: SMOResult;
    green_it: GreenResult;
    dns_health: DNSHealthResult;
    competitor?: AnalyzeResponse;
    scan_duration_seconds: number | null;
    errors: string[];
}

// Request
export interface AnalyzeRequest {
    url: string;
    lang?: string;
    competitor_url?: string;
}

// Analysis Steps for UI
export interface AnalysisStep {
    id: string;
    label: string;
    status: "pending" | "running" | "completed" | "error";
}

// Core Web Vitals Info for tooltips
export const CWV_INFO: Record<string, { name: string; description: string; goodThreshold: string; impact: string }> = {
    lcp: {
        name: "Largest Contentful Paint (LCP)",
        description: "Measures loading performance. LCP marks the point when the page's main content has likely loaded.",
        goodThreshold: "≤ 2.5 seconds",
        impact: "LCP is a Core Web Vital that directly impacts Google Search rankings. Poor LCP leads to higher bounce rates."
    },
    fid: {
        name: "First Input Delay (FID)",
        description: "Measures interactivity. FID measures the time from when a user first interacts with your page to when the browser responds.",
        goodThreshold: "≤ 100 milliseconds",
        impact: "FID affects user experience and is considered in Google's page experience signals."
    },
    cls: {
        name: "Cumulative Layout Shift (CLS)",
        description: "Measures visual stability. CLS measures unexpected layout shifts that occur during the page's lifecycle.",
        goodThreshold: "≤ 0.1",
        impact: "CLS is a Core Web Vital. High CLS causes frustrating user experiences when elements move unexpectedly."
    },
    fcp: {
        name: "First Contentful Paint (FCP)",
        description: "Measures the time from page load to when any part of the page's content is rendered on screen.",
        goodThreshold: "≤ 1.8 seconds",
        impact: "FCP provides feedback that the page is loading. Slow FCP may cause users to abandon the page."
    },
    ttfb: {
        name: "Time to First Byte (TTFB)",
        description: "Measures the time between the request for a resource and when the first byte of response arrives.",
        goodThreshold: "≤ 800 milliseconds",
        impact: "TTFB affects all other metrics. Slow TTFB indicates server-side performance issues."
    },
    inp: {
        name: "Interaction to Next Paint (INP)",
        description: "Measures overall page responsiveness by observing all interactions throughout the page lifecycle.",
        goodThreshold: "≤ 200 milliseconds",
        impact: "INP is replacing FID as a Core Web Vital. It provides a fuller picture of page responsiveness."
    }
};

// Security Headers Info for Deep Dive
export const SECURITY_HEADERS_INFO: Record<string, {
    description: string;
    impact: string;
    remediation: string;
    references: string[];
}> = {
    "Strict-Transport-Security": {
        description: "HTTP Strict Transport Security (HSTS) tells browsers to only use HTTPS for future requests to this domain.",
        impact: "Without HSTS, attackers can intercept and modify traffic using man-in-the-middle attacks, even if your site uses HTTPS.",
        remediation: `# For Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# For Apache
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"`,
        references: [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security",
            "https://hstspreload.org/"
        ]
    },
    "Content-Security-Policy": {
        description: "Content Security Policy (CSP) prevents XSS attacks by specifying which sources of content are allowed to be loaded.",
        impact: "Without CSP, your site is vulnerable to Cross-Site Scripting (XSS) attacks that can steal user data or hijack sessions.",
        remediation: `# Basic CSP for Nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

# Start with report-only to test
add_header Content-Security-Policy-Report-Only "default-src 'self'; report-uri /csp-report;"`,
        references: [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP",
            "https://csp-evaluator.withgoogle.com/"
        ]
    },
    "X-Frame-Options": {
        description: "X-Frame-Options prevents your page from being embedded in iframes on other sites.",
        impact: "Without this header, attackers can use clickjacking to trick users into clicking hidden elements on your page.",
        remediation: `# For Nginx
add_header X-Frame-Options "DENY" always;
# Or to allow same-origin
add_header X-Frame-Options "SAMEORIGIN" always;

# For Apache
Header always set X-Frame-Options "DENY"`,
        references: [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options"
        ]
    },
    "X-Content-Type-Options": {
        description: "This header prevents browsers from MIME-sniffing a response away from the declared content-type.",
        impact: "Without this, browsers might interpret files as a different MIME type, potentially executing malicious code.",
        remediation: `# For Nginx
add_header X-Content-Type-Options "nosniff" always;

# For Apache  
Header always set X-Content-Type-Options "nosniff"`,
        references: [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options"
        ]
    },
    "X-XSS-Protection": {
        description: "Legacy header that enables the browser's built-in XSS filter.",
        impact: "While deprecated in modern browsers, it provides protection for older browsers against reflected XSS attacks.",
        remediation: `# For Nginx
add_header X-XSS-Protection "1; mode=block" always;

# For Apache
Header always set X-XSS-Protection "1; mode=block"`,
        references: [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-XSS-Protection"
        ]
    },
    "Referrer-Policy": {
        description: "Controls how much referrer information is sent with requests.",
        impact: "Without proper Referrer-Policy, sensitive URLs and query parameters may leak to third-party sites.",
        remediation: `# For Nginx
add_header Referrer-Policy "strict-origin-when-cross-origin" always;

# For Apache
Header always set Referrer-Policy "strict-origin-when-cross-origin"`,
        references: [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy"
        ]
    },
    "Permissions-Policy": {
        description: "Controls which browser features and APIs can be used on your site.",
        impact: "Without Permissions-Policy, third-party scripts could access sensitive APIs like camera, microphone, or geolocation.",
        remediation: `# For Nginx
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# For Apache
Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"`,
        references: [
            "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Permissions-Policy"
        ]
    },
    "X-Permitted-Cross-Domain-Policies": {
        description: "Controls cross-domain policies for Flash and PDF documents.",
        impact: "Without this header, Flash or PDF plugins might allow data leakage across domains.",
        remediation: `# For Nginx
add_header X-Permitted-Cross-Domain-Policies "none" always;

# For Apache
Header always set X-Permitted-Cross-Domain-Policies "none"`,
        references: [
            "https://owasp.org/www-project-secure-headers/"
        ]
    }
};

// Exposed Files Info
export const EXPOSED_FILES_INFO: Record<string, {
    description: string;
    impact: string;
    remediation: string;
}> = {
    "/.git/config": {
        description: "Git repository configuration file is exposed.",
        impact: "Attackers can download the entire source code, including sensitive credentials and intellectual property.",
        remediation: `# For Nginx - Block .git access
location ~ /\\.git {
    deny all;
    return 404;
}

# For Apache - Add to .htaccess
RedirectMatch 404 /\\.git`
    },
    "/.git/HEAD": {
        description: "Git HEAD file is exposed, indicating git repository is accessible.",
        impact: "Full source code can be reconstructed using git-dumper tools. May expose secrets, API keys, and passwords.",
        remediation: `# Remove .git from production or block access
rm -rf .git

# Or block in web server configuration`
    },
    "/.env": {
        description: "Environment configuration file is publicly accessible.",
        impact: "CRITICAL: May contain database passwords, API keys, secret tokens, and other sensitive configuration.",
        remediation: `# For Nginx
location ~ /\\.env {
    deny all;
    return 404;
}

# Move .env outside web root
# Never commit .env to version control`
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
};
